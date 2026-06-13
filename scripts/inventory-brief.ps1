# inventory-brief.ps1 -- free entity pool inventory. Backbone of the /inventory command.
# consumers: CLAUDE.md, .claude/commands/inventory.md -- update these if usage, flags, or output format change.
# Replaces a manual frontmatter sweep of every file under data/ (1,200+ files).
# Reports exists:false entities grouped by type/subtype, plus a gaps section for
# pool types with zero free entities. Reference catalogs (exists:true) are skipped.
# Usage: .\scripts\inventory-brief.ps1 [-Type <type>]

param(
    [string]$Type = ""
)

$root = Resolve-Path "$PSScriptRoot\.."

. "$PSScriptRoot\lib\common.ps1"

# Pool types checked in the gaps section (reference data like class/race/deity excluded)
$poolTypes = @(
    'character/npc', 'event', 'faction', 'item/magic',
    'location/city', 'location/dungeon', 'location/region',
    'location/shop', 'location/wilderness', 'rumor'
)

$groups = @{}
$files = Get-ChildItem "$root\data" -Recurse -Filter "*.md" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne 'CLAUDE.md' }

foreach ($f in $files) {
    $fm = Get-Frontmatter $f.FullName
    if ($fm['exists'] -ne 'false') { continue }
    $key = if ($fm['subtype']) { "$($fm['type'])/$($fm['subtype'])" } else { [string]$fm['type'] }
    if (-not $key -or $key -eq '/') { $key = '(untyped)' }
    if ($Type -and $key -notlike "*$Type*") { continue }
    if (-not $groups.ContainsKey($key)) { $groups[$key] = @() }
    $name = if ($fm['name']) { $fm['name'] } else { $f.BaseName }
    $imp  = if ($fm['importance']) { $fm['importance'] } else { '-' }
    $act  = if ($fm['active']) { $fm['active'] } else { '-' }
    $by   = if ($fm['contributed_by']) { " by:$($fm['contributed_by'])" } else { "" }
    $groups[$key] += "    $name  [importance: $imp | active: $act$by]"
}

Write-Host "`n========================================" -ForegroundColor DarkGray
Write-Host "  FREE ENTITY INVENTORY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor DarkGray

$totalCount = 0
foreach ($key in ($groups.Keys | Sort-Object)) {
    Write-Host "`n  $key ($($groups[$key].Count))" -ForegroundColor Yellow
    $groups[$key] | Sort-Object | ForEach-Object { Write-Host $_ -ForegroundColor White }
    $totalCount += $groups[$key].Count
}
Write-Host "`n  Total free entities: $totalCount" -ForegroundColor Cyan

if (-not $Type) {
    $gaps = $poolTypes | Where-Object { -not $groups.ContainsKey($_) }
    if ($gaps) {
        Write-Host "`n--- GAPS (pool types with zero free entities) ---" -ForegroundColor Red
        $gaps | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    } else {
        Write-Host "`n  No pool-type gaps." -ForegroundColor DarkGray
    }
}

Write-Host "`n========================================`n" -ForegroundColor DarkGray
