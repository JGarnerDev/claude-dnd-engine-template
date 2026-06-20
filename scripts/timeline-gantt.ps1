# timeline-gantt.ps1 -- generate the world-history and party-history gantt charts.
# consumers: .claude/commands/timeline.md, CLAUDE.md (scripts table)
#
# Reads entity frontmatter (timeline_date / in_world_end_date) and emits ONE mermaid
# gantt per chart file, plus a reference doc. Each chart auto-scales to its OWN span
# (no shared axis). Goal is rough orientation, not true scale -- the tick-count
# resolver targets ~10 readable ticks. Secret events excluded unless -Full.
#
# Usage: .\scripts\timeline-gantt.ps1 [-Full] [-Root <repo root>]

param(
    [switch]$Full,
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

. (Join-Path $PSScriptRoot 'lib\common.ps1')

# Write UTF-8 WITHOUT a BOM (Set-Content -Encoding UTF8 on Windows PowerShell adds one,
# which can break the leading ```mermaid fence / markdownlint).
function Write-NoBom($path, $text) {
    [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
}

$cal = Get-Calendar $Root

# -- sanitize a task label: strip mermaid-breaking chars, truncate. -----------
function Format-Label($s, $max = 30) {
    if (-not $s) { return 'Unnamed' }
    $s = ($s -replace '[:#;]', ' ').Trim()
    if ($s.Length -gt $max) { $s = $s.Substring(0, $max - 2).TrimEnd() + '..' }
    return $s
}

# -- human label for a timeline_date, honoring precision + calendar month names.
function Format-DateLabel($s, $cal) {
    $p = Get-DateParts $s
    $suffix = if ($cal.YearSuffix) { " $($cal.YearSuffix)" } else { '' }
    $yr = "$($p.Year)$suffix"
    switch (Get-DatePrecision $s) {
        'year'  { $yr }
        'month' { $mn = if ($cal.Months.Count -ge $p.Month) { $cal.Months[$p.Month - 1].Name } else { "M$($p.Month)" }; "$mn $yr" }
        'day'   { $mn = if ($cal.Months.Count -ge $p.Month) { $cal.Months[$p.Month - 1].Name } else { "M$($p.Month)" }; "$mn $($p.Day), $yr" }
        default { $s }
    }
}

# -- is this entity secret? (hidden unless -Full) -----------------------------
function Test-Secret($fm) {
    ($fm['state'] -eq 'secret') -or ($fm['awareness'] -eq 'secret')
}

# -- collect world events from data/ + historian/ events ----------------------
function Get-WorldEvents {
    $dirs = @('data\events', 'historian\events') | ForEach-Object { Join-Path $Root $_ }
    $out = @()
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) { continue }
        foreach ($f in Get-ChildItem $dir -Recurse -Filter '*.md' -ErrorAction SilentlyContinue) {
            $fm = Get-Frontmatter $f.FullName
            if ($fm['type'] -ne 'event') { continue }
            if (-not $fm['timeline_date']) { continue }
            if ((Test-Secret $fm) -and -not $Full) { continue }
            $out += [PSCustomObject]@{
                Name    = $fm['name']
                Date    = $fm['timeline_date']
                Secret  = (Test-Secret $fm)
                State   = $fm['state']
                Sort    = Get-DateSortKey $fm['timeline_date']
            }
        }
    }
    @($out | Sort-Object Sort)
}

# -- collect party history: sessions (milestones) + acts (span bars) ----------
function Get-PartyItems {
    $out = @()
    $sdir = Join-Path $Root 'historian\sessions'
    if (Test-Path $sdir) {
        foreach ($f in Get-ChildItem $sdir -Recurse -Filter '*.md' -ErrorAction SilentlyContinue) {
            $fm = Get-Frontmatter $f.FullName
            if ($fm['type'] -ne 'session') { continue }
            if (-not $fm['in_world_end_date']) { continue }
            $num = ($fm['session_number'] -replace '[^0-9]', '')
            $label = if ($num) { "S$num $($fm['name'])" } else { $fm['name'] }
            $out += [PSCustomObject]@{
                Name = $label; Date = $fm['in_world_end_date']
                Kind = 'session'; End = $null
                Sort = Get-DateSortKey $fm['in_world_end_date']
            }
        }
    }
    $adir = Join-Path $Root 'historian\acts'
    if (Test-Path $adir) {
        foreach ($f in Get-ChildItem $adir -Recurse -Filter '*.md' -ErrorAction SilentlyContinue) {
            $fm = Get-Frontmatter $f.FullName
            if ($fm['type'] -ne 'act') { continue }
            if (-not $fm['timeline_start']) { continue }
            $out += [PSCustomObject]@{
                Name = $fm['name']; Date = $fm['timeline_start']
                Kind = 'act'; End = $fm['timeline_end']
                Sort = Get-DateSortKey $fm['timeline_start']
            }
        }
    }
    @($out | Sort-Object Sort)
}

# -- mermaid theme/sizing init (the locked look) ------------------------------
$INIT = @'
%%{init: {'theme':'base','themeVariables':{
  'fontFamily':'sans-serif',
  'sectionBkgColor':'#1f2937','altSectionBkgColor':'#111827',
  'taskBkgColor':'#3b82f6','taskBorderColor':'#93c5fd','taskTextColor':'#ffffff',
  'taskTextOutsideColor':'#cbd5e1',
  'activeTaskBkgColor':'#14b8a6','activeTaskBorderColor':'#5eead4',
  'doneTaskBkgColor':'#f59e0b','doneTaskBorderColor':'#fcd34d',
  'critBkgColor':'#ef4444','critBorderColor':'#fca5a5','gridColor':'#243042'
},'gantt':{
  'barHeight':30,'barGap':8,'fontSize':14,'sectionFontSize':16,
  'leftPadding':140,'topPadding':45,'gridLineStartPadding':40
}}}%%
'@

# -- build one gantt block from task rows --------------------------------------
# rows: [PSCustomObject]{ Section; Label; Render } where Render is the ':...' tail.
function Build-Gantt($title, $section, $items) {
    if (-not $items -or $items.Count -eq 0) {
        return "_(no dated entries yet)_"
    }
    $dates = $items | ForEach-Object { Get-PlotDate $_.Date }
    $min = ($dates | Measure-Object -Minimum).Minimum
    $max = ($dates | Measure-Object -Maximum).Maximum
    foreach ($it in $items) { if ($it.End) { $e = Get-PlotDate $it.End; if ($e -gt $max) { $max = $e } } }
    $axis = Get-AxisConfig $min $max

    # Mermaid's tickInterval grammar caps at small month-multiples; a span needing a coarser
    # tick (> ~1 year/tick) can't be ticked, so a real axis floods with gridlines. Switch to
    # COMPRESSED SEQUENCE mode: even spacing, one tick per event, real date in the label.
    $compressed = $axis.Days -gt 365

    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine('```mermaid')
    [void]$sb.AppendLine($INIT)
    [void]$sb.AppendLine('gantt')
    [void]$sb.AppendLine("    title $title")
    [void]$sb.AppendLine('    dateFormat YYYY-MM-DD')
    if ($compressed) {
        [void]$sb.AppendLine('    axisFormat  ')      # blank: synthetic dates are meaningless
        [void]$sb.AppendLine('    tickInterval 1month')
    } else {
        [void]$sb.AppendLine("    axisFormat $($axis.AxisFormat)")
        [void]$sb.AppendLine("    tickInterval $($axis.TickInterval)")
    }
    [void]$sb.AppendLine("    section $section")

    $synthBase = [datetime]'2000-01-01'
    $i = 0
    foreach ($it in $items) {
        $i++
        $id = "t$i"
        if ($compressed) {
            # even 1-month spacing; real date moves into the label
            $start = $synthBase.AddMonths($i - 1).ToString('yyyy-MM-dd')
            # truncate the NAME only; keep the date intact (it carries the orientation)
            $label = "$(Format-Label $it.Name 24) ($(Format-DateLabel $it.Date $cal))"
            $tag = if ($it.Secret) { 'crit, ' } elseif ($it.State -in 'ancient', 'legendary') { 'done, ' } else { '' }
            [void]$sb.AppendLine("    $label :${tag}milestone, $id, $start, 0d")
            continue
        }
        $label = Format-Label $it.Name
        $start = (Get-PlotDate $it.Date).ToString('yyyy-MM-dd')
        if ($it.Kind -eq 'act') {
            $end = if ($it.End) { Get-PlotDate $it.End } else { (Get-PlotDate $it.Date).AddDays(30) }
            $dur = [math]::Max(1, ($end - (Get-PlotDate $it.Date)).TotalDays)
            [void]$sb.AppendLine("    $label :active, $id, $start, $([int]$dur)d")
        }
        elseif ($it.Kind -eq 'session') {
            [void]$sb.AppendLine("    $label :milestone, $id, $start, 0d")
        }
        else {
            $tag = if ($it.Secret) { 'crit, ' } elseif ($it.State -in 'ancient', 'legendary') { 'done, ' } else { '' }
            if ((Get-DatePrecision $it.Date) -eq 'day') {
                [void]$sb.AppendLine("    $label :${tag}milestone, $id, $start, 0d")
            } else {
                $dur = Get-PrecisionDuration $it.Date $cal
                [void]$sb.AppendLine("    $label :$tag$id, $start, $dur")
            }
        }
    }
    # axis pad: one slot past the last so edge labels have room
    $padDate = if ($compressed) { $synthBase.AddMonths($items.Count).ToString('yyyy-MM-dd') } else { $max.AddDays($axis.Days).ToString('yyyy-MM-dd') }
    [void]$sb.AppendLine("    . :pad, $padDate, 0d")
    [void]$sb.AppendLine('```')
    return $sb.ToString()
}

# -- generate ------------------------------------------------------------------
$world = Get-WorldEvents
$party = Get-PartyItems

$outDir = Join-Path $Root 'historian\timeline'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$worldGantt = Build-Gantt 'World History' 'World' $world
$partyGantt = Build-Gantt 'Party History' 'Party' $party

Write-NoBom (Join-Path $outDir 'world-history.md') $worldGantt
Write-NoBom (Join-Path $outDir 'party-history.md') $partyGantt

$stamp = (Get-Date).ToString('yyyy-MM-dd')
$mode = if ($Full) { 'FULL (includes secret events)' } else { 'player-safe (secret events hidden)' }
$ref = @"
# Campaign Timeline

Generated $stamp - mode: $mode. Regenerated by ``/timeline`` (script: ``scripts/timeline-gantt.ps1``).
Do not hand-edit the chart files - they are overwritten each run. This reference doc is yours to keep.

## World history

![[world-history]]

## Party history

![[party-history]]

## Legend

- **blue bar** - world event (width = date precision: year-wide / month-wide)
- **amber** - completed major event
- **teal bar** - party act span
- **red** - secret event (only in ``--full``)
- **diamond** - milestone: a day-precise point (battles, sessions)

Axes are independent: world history scales to its own span (may be millennia), party
history to its own (months/years). Ticks give rough orientation, not true proportion.
"@
Write-NoBom (Join-Path $outDir 'timeline.md') $ref

Write-Host "Wrote timeline to $outDir"
Write-Host "  world-history.md  ($($world.Count) event(s))"
Write-Host "  party-history.md  ($($party.Count) item(s))"
Write-Host "  timeline.md       (reference doc)"
