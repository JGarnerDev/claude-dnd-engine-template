# contribution-balance.ps1 -- show contributed_by counts per player across ./data and ./historian
# consumers: CLAUDE.md, .claude/commands/region.md, data/CLAUDE.md -- update these if usage, flags, or output format change.
# Usage: .\scripts\contribution-balance.ps1

$repoRoot = Resolve-Path "$PSScriptRoot\.."
# Edit this to your table's player names (lowercase, matching the `contributed_by` field).
$players  = @('player1', 'player2', 'player3', 'player4')

function Get-Counts($folder) {
    $counts = @{}
    foreach ($p in $players) { $counts[$p] = 0 }
    $counts['(none)'] = 0

    $files = Get-ChildItem (Join-Path $repoRoot $folder) -Recurse -Filter "*.md" -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $raw = Get-Content $file.FullName -Raw -Encoding UTF8
        if ($raw -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { continue }
        $block = $Matches[1]
        $contributor = $null
        foreach ($line in ($block -split "`n")) {
            if ($line -match '^contributed_by:\s*(\S+)') {
                $contributor = $Matches[1].Trim().Trim('"')
                break
            }
        }
        if ($contributor -and $counts.ContainsKey($contributor)) {
            $counts[$contributor]++
        } elseif ($contributor) {
            $counts[$contributor] = 1
        } else {
            $counts['(none)']++
        }
    }
    return $counts
}

$pool      = Get-Counts "data"
$historian = Get-Counts "historian"

$totalPool      = ($pool.Values      | Measure-Object -Sum).Sum
$totalHistorian = ($historian.Values | Measure-Object -Sum).Sum

Write-Host "`n=== Contribution Balance ===" -ForegroundColor Cyan
Write-Host ("{0,-12} {1,8} {2,12} {3,10}" -f "Player", "Pool", "Canonized", "% Canon") -ForegroundColor Yellow
Write-Host ("{0,-12} {1,8} {2,12} {3,10}" -f "------", "----", "---------", "-------") -ForegroundColor DarkGray

$rows = @()
foreach ($p in ($players + @('(none)'))) {
    $poolCount = if ($pool.ContainsKey($p))      { $pool[$p] }      else { 0 }
    $histCount = if ($historian.ContainsKey($p)) { $historian[$p] } else { 0 }
    $pct       = if ($totalHistorian -gt 0) { [math]::Round(($histCount / $totalHistorian) * 100, 1) } else { 0 }
    $rows += [PSCustomObject]@{ Player = $p; Pool = $poolCount; Canon = $histCount; Pct = $pct }
}

foreach ($row in ($rows | Sort-Object Canon)) {
    $color = if ($row.Player -eq '(none)') { 'DarkGray' } else { 'White' }
    Write-Host ("{0,-12} {1,8} {2,12} {3,9}%" -f $row.Player, $row.Pool, $row.Canon, $row.Pct) -ForegroundColor $color
}

Write-Host ("{0,-12} {1,8} {2,12}" -f "TOTAL", $totalPool, $totalHistorian) -ForegroundColor Yellow

# Who's next up (fewest canonized entries, excluding (none))
$next = $rows | Where-Object { $_.Player -ne '(none)' -and $_.Pool -gt 0 } | Sort-Object Canon, Player | Select-Object -First 1
if ($next) {
    Write-Host "`nNext up: $($next.Player) ($($next.Canon) canonized, $($next.Pool) in pool)" -ForegroundColor Green
}
