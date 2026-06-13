# map-crop.ps1
# consumers: CLAUDE.md, .claude/commands/region.md, maps/CLAUDE.md -- update these if usage, flags, or output format change.
# Crop a region from world-names.png by feature name (looked up in index) or by explicit col/row.
# Saves permanent crops to maps/locations/<slug>-map.png.
# Saves temp crops to maps/world/temp-crop.png (caller must delete).
# -Markers: also crop city-markers.png to same bounds -> <slug>-markers.png or temp-markers.png
#
# Usage:
#   .\scripts\map-crop.ps1 -Feature "Erevast"
#   .\scripts\map-crop.ps1 -Feature "Erevast" -Markers
#   .\scripts\map-crop.ps1 -Feature "Erevast" -Margin 500
#   .\scripts\map-crop.ps1 -ColMin 5 -ColMax 10 -RowMin 2 -RowMax 6
#   .\scripts\map-crop.ps1 -ColMin 5 -ColMax 10 -RowMin 2 -RowMax 6 -Markers
#   .\scripts\map-crop.ps1 -ColMin 5 -ColMax 10 -RowMin 2 -RowMax 6 -Output ".\maps\locations\erevast-map.png"

param(
    [string]$Feature  = "",
    [int]$ColMin      = 0,
    [int]$ColMax      = 0,
    [int]$RowMin      = 0,
    [int]$RowMax      = 0,
    [int]$Margin      = 300,
    [string]$Output   = "",
    [switch]$Temp,              # Save as temp-crop.png instead of maps/locations/
    [switch]$Markers            # Also crop city-markers.png to same bounds
)

$indexFile   = ".\maps\world\index.md"
$sourceImage = ".\maps\world\world-names.png"
$cellW = 512
$cellH = 472
$imgW  = 8192
$imgH  = 6144

# Resolve col/row from feature name if provided
if ($Feature -ne "") {
    $lines = Get-Content $indexFile
    $found = $false
    foreach ($line in $lines) {
        # Match table rows: | Feature | ~colMin-colMax | ~rowMin-rowMax | ...
        if ($line -match "\|\s*$([regex]::Escape($Feature))\s*\|\s*~?(\d+)[^\d]*(\d*)\s*\|\s*~?(\d+)[^\d]*(\d*)\s*\|") {
            $ColMin = [int]$matches[1]
            $ColMax = if ($matches[2] -ne "") { [int]$matches[2] } else { $ColMin }
            $RowMin = [int]$matches[3]
            $RowMax = if ($matches[4] -ne "") { [int]$matches[4] } else { $RowMin }
            $found = $true
            break
        }
    }
    if (-not $found) {
        Write-Error "'$Feature' not found in Known Region Positions table in maps/world/index.md"
        exit 1
    }
}

if ($ColMin -eq 0 -and $ColMax -eq 0) {
    Write-Error "Provide -Feature or -ColMin/-ColMax/-RowMin/-RowMax"
    exit 1
}

# Convert grid coords to pixel box with margin
$left   = [Math]::Max(0,     ($ColMin - 1) * $cellW - $Margin)
$top    = [Math]::Max(0,     ($RowMin - 1) * $cellH - $Margin)
$right  = [Math]::Min($imgW,  $ColMax      * $cellW + $Margin)
$bottom = [Math]::Min($imgH,  $RowMax      * $cellH + $Margin)

# Resolve output path
if ($Output -eq "") {
    if ($Temp -or $Feature -eq "") {
        $Output = ".\maps\world\temp-crop.png"
    } else {
        $slug = $Feature.ToLower() -replace "[^a-z0-9]+" , "-" -replace "-+", "-" -replace "^-|-$", ""
        $Output = ".\maps\locations\$slug-map.png"
    }
}

# Ensure output directory exists
$dir = Split-Path $Output -Parent
if ($dir -ne "" -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}

# Run crop via Python/PIL
$absSource = Resolve-Path $sourceImage
$absOutput = $Output  # keep relative for display; Python handles it

python -c @"
from PIL import Image
img = Image.open(r'$absSource')
crop = img.crop(($left, $top, $right, $bottom))
crop.save(r'$absOutput')
print(f'Saved {crop.size[0]}x{crop.size[1]}px -> $absOutput')
"@

if ($Temp) { Write-Warning "Temp file -- delete after reading: $Output" }

# Optionally crop city-markers.png to same bounds
if (-not $Markers) { exit 0 }

$markersSource = ".\maps\world\city-markers.png"
if (-not (Test-Path $markersSource)) {
    Write-Warning "city-markers.png not found - skipping markers crop"
    exit 0
}

if ($Temp -or $Feature -eq "") {
    $markersOutput = ".\maps\world\temp-markers.png"
} else {
    $mSlug = $Feature.ToLower() -replace "[^a-z0-9]+", "-"
    $mSlug = $mSlug.Trim("-")
    $markersOutput = ".\maps\locations\$mSlug-markers.png"
}

$absMarkersSource = Resolve-Path $markersSource

python -c @"
from PIL import Image
img = Image.open(r'$absMarkersSource')
crop = img.crop(($left, $top, $right, $bottom))
crop.save(r'$markersOutput')
print(f'Markers: {crop.size[0]}x{crop.size[1]}px -> $markersOutput')
"@
