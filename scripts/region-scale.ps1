# region-scale.ps1 -- travel scale context for a region
# consumers: CLAUDE.md, .claude/commands/region.md -- update these if usage, flags, or output format change.
# Usage: .\scripts\region-scale.ps1 -SpanGrids <decimal> [-WaterBody sea|river|both|none] [-Locations <n>]

param(
    [decimal]$SpanGrids = 0,
    [string]$WaterBody  = "none",   # sea, river, both, none
    [int]$Locations     = 0
)

$GRID_KM = 1000

if ($SpanGrids -le 0) {
    Write-Host ""
    Write-Host "Usage: .\scripts\region-scale.ps1 -SpanGrids <n> [-WaterBody sea|river|both|none] [-Locations <n>]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SpanGrids: fraction of a world map grid square this region covers" -ForegroundColor Gray
    Write-Host "  Example: 0.25 = 250km across | 0.5 = 500km | 1.0 = 1000km" -ForegroundColor Gray
    Write-Host "  Tip: compare region map width to world map grid lines to estimate" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

$widthKm = [int]($SpanGrids * $GRID_KM)

# Travel times coast-to-coast (days)
$foot    = [Math]::Round($widthKm / 30,  1)
$horse   = [Math]::Round($widthKm / 60,  1)
$barge_d = [Math]::Round($widthKm / 80,  1)
$barge_u = [Math]::Round($widthKm / 30,  1)
$ship    = [Math]::Round($widthKm / 150, 1)

Write-Host ""
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host "  REGION SCALE -- $SpanGrids grid = ~${widthKm}km across" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Mode                  Speed       Region crossing" -ForegroundColor White
Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
Write-Host ("  On foot               30km/day    ~$foot days") -ForegroundColor Gray
Write-Host ("  Horseback             60km/day    ~$horse days") -ForegroundColor Gray

if ($WaterBody -match "river|both") {
    Write-Host ("  River barge (down)    80km/day    ~$barge_d days") -ForegroundColor Gray
    Write-Host ("  River barge (up)      30km/day    ~$barge_u days") -ForegroundColor Gray
}
if ($WaterBody -match "sea|ocean|both") {
    Write-Host ("  Coastal/sea ship     150km/day    ~$ship days") -ForegroundColor Gray
}

Write-Host ""
Write-Host "-- Modifiers ----------------------------" -ForegroundColor DarkGray
Write-Host "  Mountain crossing:      +2-3 days per major range" -ForegroundColor Gray
Write-Host "  Dense forest (foot):    -25% speed" -ForegroundColor Gray
Write-Host "  Deep winter (overland): halve all speeds" -ForegroundColor Gray
Write-Host "  Hostile territory:      avoid main roads; unpredictable delay" -ForegroundColor Gray

if ($Locations -gt 0) {
    Write-Host ""
    Write-Host "-- City Spacing ($Locations locations) --------------" -ForegroundColor DarkGray
    $avgSpacing = [int]($widthKm / [Math]::Sqrt($Locations))
    $footDays   = [Math]::Round($avgSpacing / 30, 1)
    $horseDays  = [Math]::Round($avgSpacing / 60, 1)
    Write-Host "  Avg spacing between markers: ~${avgSpacing}km" -ForegroundColor Gray
    Write-Host "  Nearest neighbors: ~$footDays days on foot, ~$horseDays days on horse" -ForegroundColor Gray
}

Write-Host ""
