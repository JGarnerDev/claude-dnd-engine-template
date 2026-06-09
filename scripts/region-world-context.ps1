# region-world-context.ps1 -- geographic rules for a world map grid position
# Usage: .\scripts\region-world-context.ps1 -Col <n> -Row <n>
# Grid assumption: ~16 cols x 13 rows, 1000km per cell, equator at row 7, poles at rows 1 and 13

param(
    [Parameter(Mandatory)][int]$Col,
    [Parameter(Mandatory)][int]$Row,
    [int]$TotalCols = 16,
    [int]$TotalRows = 13
)

$root    = Resolve-Path "$PSScriptRoot\.."
$GRID_KM = 1000

# -- Climate band --------------------------------------------------------------
$equatorRow       = [int]($TotalRows / 2) + 1
$hemisphere       = if ($Row -le $equatorRow) { "Northern" } else { "Southern" }
$distFromEquator  = [Math]::Abs($Row - $equatorRow)

$climateBand = switch ($distFromEquator) {
    { $_ -le 1 } { "Tropical / Equatorial" }
      2           { "Subtropical -- warm, pronounced wet/dry seasons" }
      3           { "Warm Temperate -- mild winters, hot summers" }
      4           { "Cold-to-Warm Temperate -- four seasons, reliable rainfall" }
      5           { "Cold Temperate / Continental -- harsh winters, short summers" }
    { $_ -ge 6 } { "Subarctic / Tundra -- permafrost possible, low biodiversity" }
    default       { "Unknown" }
}

# -- Wind exposure -------------------------------------------------------------
$colPct = $Col / $TotalCols
$windNote = switch ($colPct) {
    { $_ -le 0.25 } { "Western coast -- direct ocean exposure; maximum moisture, frequent storms" }
    { $_ -le 0.45 } { "Western interior -- good moisture unless blocked by mountain ranges" }
    { $_ -le 0.65 } { "Central interior -- moisture depends on local mountain barriers; drier than west" }
    default          { "Eastern zone -- likely drier; western ranges may cast rain shadow here" }
}

# -- Position in km ------------------------------------------------------------
$kmFromWest  = ($Col - 1) * $GRID_KM
$kmFromNorth = ($Row - 1) * $GRID_KM

# -- Known world entities near this position -----------------------------------
$worldEntities = @()
$worldDir = Join-Path $root "data\locations\world"
if (Test-Path $worldDir) {
    foreach ($f in (Get-ChildItem $worldDir -Filter "*.md" -ErrorAction SilentlyContinue)) {
        $raw = Get-Content $f.FullName -Raw -Encoding UTF8
        $fm  = @{}
        if ($raw -match '(?s)^---\r?\n(.+?)\r?\n---') {
            foreach ($line in ($Matches[1] -split "`n")) {
                $line = $line.TrimEnd("`r")
                if ($line -match '^([\w_]+):\s*(.+)$') { $fm[$Matches[1].Trim()] = $Matches[2].Trim() }
            }
        }
        $eCol = [int]($fm['world_col'] -replace '[^0-9\.]', '')
        $eRow = [int]($fm['world_row'] -replace '[^0-9\.]', '')
        if ($eCol -gt 0 -and $eRow -gt 0) {
            $dist = [Math]::Sqrt([Math]::Pow($Col - $eCol, 2) + [Math]::Pow($Row - $eRow, 2))
            if ($dist -le 2) {
                $worldEntities += "  $($fm['name']) -- $($fm['description'])"
            }
        }
    }
}

# -- Output --------------------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host "  WORLD CONTEXT -- Col $Col, Row $Row" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Climate:    $climateBand" -ForegroundColor White
Write-Host "Hemisphere: $hemisphere" -ForegroundColor Gray
Write-Host "Position:   ~${kmFromWest}km from western edge, ~${kmFromNorth}km from northern edge" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Wind & Moisture ----------------------" -ForegroundColor DarkGray
Write-Host "  $windNote" -ForegroundColor Gray
Write-Host "  Prevailing direction: West -> East" -ForegroundColor Gray
Write-Host "  West-facing slopes/coasts:  wet, lush, frequent storms" -ForegroundColor Gray
Write-Host "  East-facing slopes/coasts:  drier; rain shadow if mountains present" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Rivers -------------------------------" -ForegroundColor DarkGray
Write-Host "  Drain east/southeast off mountain ranges" -ForegroundColor Gray
Write-Host "  Lakes form at mountain bases and along river courses" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Coast Type (if applicable) -----------" -ForegroundColor DarkGray
Write-Host "  West-facing:       rocky cliffs, sea stacks, no beaches" -ForegroundColor Gray
Write-Host "  East-facing/bays:  calmer, sandy beaches" -ForegroundColor Gray
Write-Host "  River mouths:      wide muddy estuaries" -ForegroundColor Gray
Write-Host "  Polar coasts:      fjords" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Scale --------------------------------" -ForegroundColor DarkGray
Write-Host "  1 grid cell = 1000km x 1000km" -ForegroundColor Gray
Write-Host "  Estimate how many grid squares wide the region covers" -ForegroundColor Yellow
Write-Host "  then run: .\scripts\region-scale.ps1 -SpanGrids <n> -WaterBody <type>" -ForegroundColor Yellow
Write-Host ""
Write-Host "-- Water Body Checklist -----------------" -ForegroundColor DarkGray
Write-Host "  Confirm before proceeding with draft:" -ForegroundColor Yellow
Write-Host "  [ ] Entirely landlocked, or ocean-connected?" -ForegroundColor Gray
Write-Host "  [ ] If ocean-connected -- which direction is the sea passage?" -ForegroundColor Gray
Write-Host "  [ ] What major rivers feed into or drain out of this region?" -ForegroundColor Gray
Write-Host "  [ ] Does any water body connect two separate regions?" -ForegroundColor Gray
Write-Host ""

if ($worldEntities.Count) {
    Write-Host "-- Known World Entities Nearby ----------" -ForegroundColor DarkGray
    foreach ($e in $worldEntities) { Write-Host $e -ForegroundColor Gray }
} else {
    Write-Host "-- Known World Entities Nearby ----------" -ForegroundColor DarkGray
    Write-Host "  None. Add world-scale entries to data/locations/world/" -ForegroundColor DarkYellow
    Write-Host "  Use schema: world_col, world_row fields for geographic indexing" -ForegroundColor DarkYellow
}

Write-Host ""
