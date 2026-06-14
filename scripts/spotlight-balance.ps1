# spotlight-balance.ps1 -- character-focus ledger: spotlight-vs-agnostic balance + per-PC rotation
# consumers: CLAUDE.md, .claude/commands/session.md, .claude/commands/todo.md, scripts/session-brief.ps1,
#   scripts/todo-brief.ps1, scripts/party-status.ps1 -- update these if usage, flags, or output format change.
# Reads played-session `beats:` (see meta/schemas/session.md) and reports against meta/character-focus.md.
# Usage: .\scripts\spotlight-balance.ps1 [-Section]
#   -Section : print as a compact "--- SPOTLIGHT ---" subsection (for embedding in session-brief.ps1)
#              instead of the standalone banner report.
param([switch]$Section)

$root = Resolve-Path "$PSScriptRoot\.."
. "$PSScriptRoot\lib\common.ps1"

# -- Tunables from the principle doc ------------------------------------------
$focusDoc   = Join-Path $root "meta\character-focus.md"
$target     = 0.5
$coldStart  = 3
$window     = 4
if (Test-Path $focusDoc) {
    $ffm = Get-Frontmatter $focusDoc
    if ($ffm['spotlight_target'])         { $target    = [double]$ffm['spotlight_target'] }
    if ($ffm['cold_start_sessions'])      { $coldStart = [int]$ffm['cold_start_sessions'] }
    if ($ffm['rotation_window_sessions']) { $window    = [int]$ffm['rotation_window_sessions'] }
}

# -- Collect played sessions (beat parsing + collection live in common.ps1) ----
$sessions = Get-PlayedSpotlightSessions $root
$playedCount = $sessions.Count

# -- Active PCs: appetite + hooks presence ------------------------------------
$pcFiles = Get-ChildItem "$root\historian\characters\pcs" -Filter "*.md" -ErrorAction SilentlyContinue
$pcs = @()
foreach ($f in $pcFiles) {
    $fm = Get-Frontmatter $f.FullName
    if ($fm['state'] -and $fm['state'] -ne 'active') { continue }
    $raw = Get-Content $f.FullName -Raw -Encoding UTF8
    $hookCount = ([regex]::Matches($raw, '(?m)^\s*-\s*hook:')).Count
    $appetite = if ($fm['spotlight']) { $fm['spotlight'].Trim() } else { 'normal' }
    $pcs += [PSCustomObject]@{
        Name     = $fm['name']
        Player   = $fm['player']
        Appetite = $appetite
        Hooks    = $hookCount
    }
}
$activeNames = $pcs | ForEach-Object { $_.Name }

if ($Section) {
    Write-Host "`n--- SPOTLIGHT ---" -ForegroundColor DarkGray
} else {
    Write-Host "`n========================================" -ForegroundColor DarkGray
    Write-Host "  SPOTLIGHT BALANCE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor DarkGray
}

# -- Cold start guard ---------------------------------------------------------
if ($playedCount -lt $coldStart) {
    Write-Host ("  insufficient history - spotlight balance not yet meaningful ({0} of {1} sessions played)." -f $playedCount, $coldStart) -ForegroundColor Yellow
    # Missing-hooks is still useful pre-cold-start.
    $noHooks = $pcs | Where-Object { $_.Appetite -ne 'low' -and $_.Hooks -eq 0 }
    if ($noHooks) {
        foreach ($p in $noHooks) { Write-Host "  ! $($p.Name) has no spotlight hooks - needs a backstory pass." -ForegroundColor Yellow }
    }
    if (-not $Section) { Write-Host "`n========================================`n" -ForegroundColor DarkGray }
    return
}

# -- Lifetime balance ---------------------------------------------------------
function Get-Balance($sessionSet) {
    $spot = 0; $all = 0
    foreach ($s in $sessionSet) {
        foreach ($b in $s.Beats) {
            $all += $b.Value
            if ($b.Class -eq 'spotlight' -or $b.Class -eq 'shared') { $spot += $b.Value }
        }
    }
    if ($all -eq 0) { return $null }
    return @{ Spot = $spot; All = $all; Ratio = $spot / $all }
}

$life = Get-Balance $sessions
Write-Host "`n--- BALANCE (lifetime, target $([math]::Round($target*100))% spotlight) ---" -ForegroundColor DarkGray
if ($null -eq $life) {
    Write-Host "  no weighted beats recorded yet." -ForegroundColor DarkGray
} else {
    $spotPct = [math]::Round($life.Ratio * 100, 1)
    $agPct   = [math]::Round((1 - $life.Ratio) * 100, 1)
    $verdict = if ([math]::Abs($life.Ratio - $target) -le 0.05) { "on target" }
               elseif ($life.Ratio -gt $target) { "spotlight-heavy -> campaign owes agnostic material" }
               else { "agnostic-heavy -> room for more character focus" }
    Write-Host ("  lifetime: {0}% spotlight / {1}% agnostic ({2})" -f $spotPct, $agPct, $verdict) -ForegroundColor White
}

# -- Recent trend (last `window` sessions; needs >= window to compute) --------
if ($playedCount -ge $window) {
    $recent = $sessions | Select-Object -Last $window
    $tr = Get-Balance $recent
    if ($tr) {
        $trPct = [math]::Round($tr.Ratio * 100, 1)
        $lean  = if ([math]::Abs($tr.Ratio - $target) -le 0.05) { "balanced - hold steady" }
                 elseif ($tr.Ratio -gt $target) { "spotlight-heavy -> lean agnostic this week" }
                 else { "agnostic-heavy -> lean spotlight this week" }
        Write-Host ("  recent trend (last {0}): {1}% spotlight -> {2}" -f $window, $trPct, $lean) -ForegroundColor White
    }
} else {
    Write-Host ("  recent trend: suppressed (needs {0} sessions, have {1})" -f $window, $playedCount) -ForegroundColor DarkGray
}

# -- Rotation (windowed, present-only, >= beat only) --------------------------
$rot = Get-SpotlightRotation $sessions $window $activeNames
$turns = $rot.Turns
$presentInWindow = $rot.Present
$fallbackUsed = $rot.Fallback

Write-Host "`n--- ROTATION (last $window sessions, present-only) ---" -ForegroundColor DarkGray
if ($fallbackUsed) {
    Write-Host "  (some sessions lack pcs_present: - assumed all active PCs present for those)" -ForegroundColor DarkGray
}
$rows = @()
foreach ($p in $pcs) {
    $t = if ($turns.ContainsKey($p.Name)) { $turns[$p.Name] } else { 0.0 }
    $seen = $presentInWindow.ContainsKey($p.Name)
    $rows += [PSCustomObject]@{ Name = $p.Name; Turns = $t; Appetite = $p.Appetite; Seen = $seen }
}
foreach ($r in ($rows | Sort-Object Turns, Name)) {
    $tag = if ($r.Appetite -eq 'low') { " [low appetite - excluded]" } elseif (-not $r.Seen) { " [absent this window]" } else { "" }
    $color = if ($r.Appetite -eq 'low' -or -not $r.Seen) { 'DarkGray' } else { 'White' }
    Write-Host ("  {0,-20} {1,5} turns{2}" -f $r.Name, $r.Turns, $tag) -ForegroundColor $color
}

# Overdue = fewest windowed turns among present, normal-appetite PCs
$eligible = $rows | Where-Object { $_.Appetite -ne 'low' -and $_.Seen }
$overdue = $eligible | Sort-Object Turns, Name | Select-Object -First 1
if ($overdue) {
    Write-Host ("`n  Overdue: {0} ({1} turns - fewest among present, normal-appetite PCs)" -f $overdue.Name, $overdue.Turns) -ForegroundColor Green
}

# -- Missing hooks ------------------------------------------------------------
$noHooks = $pcs | Where-Object { $_.Appetite -ne 'low' -and $_.Hooks -eq 0 }
if ($noHooks) {
    Write-Host "`n--- MISSING HOOKS ---" -ForegroundColor DarkGray
    foreach ($p in $noHooks) { Write-Host "  ! $($p.Name) has no spotlight hooks - needs a backstory pass." -ForegroundColor Yellow }
}

if (-not $Section) { Write-Host "`n========================================`n" -ForegroundColor DarkGray }
