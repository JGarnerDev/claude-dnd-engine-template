# timeline-data.ps1 -- extract the timeline data blob and inject it into the
# self-contained HTML artifact (M2 of the timeline-view overhaul).
# consumers: .claude/commands/timeline.md, CLAUDE.md (scripts table)
#
# Reads entity frontmatter (events, sessions, acts, chronicle beats) and builds
# the JSON shape app/components/charts/timeline/timeline.js consumes:
#   { calendar:{epochLabel,months:[{name,days}]}, events:[...], spans:[...] }
# Then rewrites the data sentinel inside the prebuilt shell
# (app/pages/demo/dist/timeline.html, produced by `npm run
# build:timeline`) and writes the result to historian/timeline/timeline.html.
#
# No node needed here -- the JS/CSS are already bundled into the shell; this only
# swaps the data line. Secret events are dropped entirely in the default
# (player-safe) export so they can't leak from the artifact. With -Full they are
# emitted carrying `secret: true`, and the chart's DM-only toggle hides them by
# default -- so a -Full export opens player-safe but lets the DM reveal them.
#
# Usage: .\scripts\timeline-data.ps1 [-Full] [-JsonOnly] [-Root <repo root>]

param(
    [switch]$Full,
    [switch]$JsonOnly,
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    # Prebuilt single-file shell to inject into. Defaults to this repo's own
    # built artifact; override to preview another repo's data through it.
    [string]$Shell = ''
)

. (Join-Path $PSScriptRoot 'lib\common.ps1')

# Calendar is optional. Only call Get-Calendar if a calendar file exists (it
# errors on a missing path); otherwise the blob carries a null calendar and
# render.js falls back to its DEFAULT_CALENDAR.
$cal = $null
if ((Test-Path (Join-Path $Root 'meta\calendar.md')) -or (Test-Path (Join-Path $Root 'meta\calendar-template.md'))) {
    $cal = Get-Calendar $Root
}

# Unclamped chronological sort key for the JSON array. (common.ps1's
# Get-DateSortKey clamps day<=28 for [datetime] safety, which ties days 29-31 and
# -- since Sort-Object is unstable -- can reorder same-month beats. render.js
# re-sorts by true day index, so this is purely for a tidy JSON order.)
function Get-BeatSort($s) {
    $p = $s -split '-'
    $y = [int]$p[0]
    $m = if ($p.Count -ge 2) { [int]$p[1] } else { 0 }
    $d = if ($p.Count -ge 3) { [int]$p[2] } else { 0 }
    $y * 10000 + $m * 100 + $d
}

function Write-NoBom($path, $text) {
    [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
}

function Test-Secret($fm) {
    ($fm['state'] -eq 'secret') -or ($fm['awareness'] -eq 'secret')
}

# Path to a source .md, relative to the output dir (historian/timeline/). The
# click-to-open handler resolves it against the artifact's own URL.
function Get-RelSource($fullPath, $root) {
    $rel = $fullPath.Substring($root.Length).TrimStart('\', '/') -replace '\\', '/'
    "../../$rel"
}

# Related-entity names for search: union of relates_to + participants (parsed by
# Get-Frontmatter into _list_ arrays, already unwrapped from [[wikilinks]] and
# alias/relationship-stripped). Lets a beat be found by a name not in its label.
function Get-Keywords($fm) {
    $names = @()
    foreach ($k in '_list_relates_to', '_list_participants') {
        if ($fm[$k]) { $names += $fm[$k] }
    }
    @($names | Where-Object { $_ } | Select-Object -Unique)
}

# importance -> render weight flags (major bolds + enlarges, minor dims).
function Add-Weight($obj, $fm) {
    $imp = $fm['importance']
    if (($imp -eq 'major') -or ($fm['state'] -in 'ancient', 'legendary')) { $obj['major'] = $true }
    elseif ($imp -eq 'minor') { $obj['minor'] = $true }
}

$script:warnFallback = 0

# -- world events: type:event with a timeline_date -----------------------------
function Get-EventBeats {
    $dirs = @('data\events', 'historian\events') | ForEach-Object { Join-Path $Root $_ }
    $out = @()
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) { continue }
        foreach ($f in Get-ChildItem $dir -Recurse -Filter '*.md' -ErrorAction SilentlyContinue) {
            $fm = Get-Frontmatter $f.FullName
            if ($fm['type'] -ne 'event') { continue }
            if (-not $fm['timeline_date']) { continue }
            $isSecret = Test-Secret $fm
            if ($isSecret -and -not $Full) { continue }
            $beat = [ordered]@{
                date   = $fm['timeline_date']
                label  = $fm['name']
                track  = if ($fm['track']) { $fm['track'] } else { 'world' }  # D7: explicit track wins
                source = Get-RelSource $f.FullName $Root
            }
            if ($isSecret) { $beat['secret'] = $true }  # DM-only: chart hides unless toggled
            Add-Weight $beat $fm
            $kw = Get-Keywords $fm
            if ($kw.Count -gt 0) { $beat['keywords'] = @($kw) }
            $out += [PSCustomObject]@{ Beat = $beat; Sort = Get-BeatSort $beat.date }
        }
    }
    $out
}

# -- party sessions: in_world_end_date, falling back to played/planned_date ----
function Get-SessionBeats {
    $dir = Join-Path $Root 'historian\sessions'
    $out = @()
    if (-not (Test-Path $dir)) { return $out }
    foreach ($f in Get-ChildItem $dir -Recurse -Filter '*.md' -ErrorAction SilentlyContinue) {
        $fm = Get-Frontmatter $f.FullName
        if ($fm['type'] -ne 'session') { continue }
        $date = $fm['in_world_end_date']
        if (-not $date) {
            $date = $fm['played_date']
            if (-not $date) { $date = $fm['planned_date'] }
            if ($date) { $script:warnFallback++ }  # any real-world fallback counts
        }
        if (-not $date) { continue }
        $num = ($fm['session_number'] -replace '[^0-9]', '')
        $beat = [ordered]@{
            date   = $date
            label  = if ($num) { "S$num $($fm['name'])" } else { $fm['name'] }
            track  = 'party'
            source = Get-RelSource $f.FullName $Root
        }
        Add-Weight $beat $fm
        $kw = Get-Keywords $fm
        if ($kw.Count -gt 0) { $beat['keywords'] = @($kw) }
        $out += [PSCustomObject]@{ Beat = $beat; Sort = Get-BeatSort $date }
    }
    $out
}

# -- chronicle beats: a `chronicle:` list of "category | member | date | label | flags"
#    embedded in an entity. Track = "category:member" (D7). Scoped to the canon
#    layers (historian/scheduler) where /recap writes beats -- a repo-wide scan
#    is slow and trips on non-entity markdown. ----------------------------------
function Get-ChronicleBeats {
    $out = @()
    $files = @('historian', 'scheduler') | ForEach-Object { Join-Path $Root $_ } |
        Where-Object { Test-Path $_ } |
        ForEach-Object { Get-ChildItem $_ -Recurse -Filter '*.md' -ErrorAction SilentlyContinue }
    foreach ($f in $files) {
        $fm = Get-Frontmatter $f.FullName
        if (-not $fm['_list_chronicle']) { continue }
        foreach ($row in $fm['_list_chronicle']) {
            $p = $row -split '\|' | ForEach-Object { $_.Trim() }
            if ($p.Count -lt 4) { continue }
            $category, $member, $date, $label = $p[0], $p[1], $p[2], $p[3]
            $flags = if ($p.Count -ge 5) { $p[4] } else { '' }
            if (-not $date) { continue }
            $beat = [ordered]@{
                date   = $date
                label  = $label
                track  = if ($member) { "${category}:${member}" } else { $category }
                source = Get-RelSource $f.FullName $Root
            }
            if ($flags -match '\bmajor\b') { $beat['major'] = $true }
            elseif ($flags -match '\bminor\b') { $beat['minor'] = $true }
            $out += [PSCustomObject]@{ Beat = $beat; Sort = Get-BeatSort $date }
        }
    }
    $out
}

# -- acts/missions: span bars (timeline_start..timeline_end). Forward-compat for
#    the M4 multi-track tree; render.js ignores `spans` until then. ----------
function Get-Spans {
    $out = @()
    foreach ($sub in 'historian\acts', 'historian\missions', 'scheduler\acts') {
        $dir = Join-Path $Root $sub
        if (-not (Test-Path $dir)) { continue }
        foreach ($f in Get-ChildItem $dir -Recurse -Filter '*.md' -ErrorAction SilentlyContinue) {
            $fm = Get-Frontmatter $f.FullName
            if (-not $fm['timeline_start']) { continue }
            if ((Test-Secret $fm) -and -not $Full) { continue }
            $out += [PSCustomObject]@{
                start  = $fm['timeline_start']
                end    = if ($fm['timeline_end']) { $fm['timeline_end'] } else { $fm['timeline_start'] }
                label  = $fm['name']
                track  = if ($fm['track']) { $fm['track'] } else { 'party' }
                source = (Get-RelSource $f.FullName $Root)
            }
        }
    }
    @($out)
}

# -- assemble ------------------------------------------------------------------
$eventRows = @()
$eventRows += Get-EventBeats
$eventRows += Get-SessionBeats
$eventRows += Get-ChronicleBeats
$events = @($eventRows | Sort-Object Sort | ForEach-Object { $_.Beat })
$spans = Get-Spans

# Null when there's no usable calendar -- render.js then uses DEFAULT_CALENDAR.
# An empty months array would break its day-index math (divide by zero).
$calJson = $null
if ($cal -and $cal.Months.Count -gt 0) {
    $calJson = [ordered]@{
        epochLabel = if ($cal.YearSuffix) { $cal.YearSuffix } else { '' }
        months     = @($cal.Months | ForEach-Object { [ordered]@{ name = $_.Name; days = $_.Days } })
    }
}

$data = [ordered]@{
    calendar = $calJson
    events   = @($events)
    spans    = @($spans)
}

# -Compress keeps it a single line so the sentinel swap is a clean one-liner.
$json = $data | ConvertTo-Json -Depth 8 -Compress

if ($JsonOnly) { Write-Output $json; return }

# -- inject into the prebuilt shell --------------------------------------------
$shell = if ($Shell) { $Shell } else { Join-Path $Root 'app\pages\demo\dist\timeline.html' }
if (-not (Test-Path $shell)) {
    Write-Error "Shell not built: $shell`nRun ``npm run build:timeline`` first."
    exit 1
}
$html = [System.IO.File]::ReadAllText($shell)
$pattern = '/\*TL_DATA_START\*/.*?/\*TL_DATA_END\*/'
if ($html -notmatch $pattern) {
    Write-Error "Data sentinel not found in $shell -- was the shell rebuilt from timeline.html?"
    exit 1
}
$replacement = "/*TL_DATA_START*/$json/*TL_DATA_END*/"
$evaluator = [System.Text.RegularExpressions.MatchEvaluator] { param($m) $replacement }
$html = [regex]::Replace($html, $pattern, $evaluator)

$outDir = Join-Path $Root 'historian\timeline'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir 'timeline.html'
Write-NoBom $outFile $html

Write-Host "Wrote interactive timeline to $outFile"
Write-Host "  events: $($events.Count)   spans: $($spans.Count)   mode: $(if ($Full) { 'FULL (secret beats tagged, hidden behind the DM-only toggle)' } else { 'player-safe' })"
if ($script:warnFallback -gt 0) {
    Write-Host "  note: $($script:warnFallback) session(s) have no in_world_end_date -- plotted by real-world played/planned_date. Backfill in_world_end_date for a true in-world axis."
}
