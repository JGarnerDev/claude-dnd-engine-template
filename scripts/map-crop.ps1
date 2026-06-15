# map-crop.ps1
# consumers: CLAUDE.md, .claude/commands/region.md, maps/CLAUDE.md -- update these if usage, flags, or output format change.
# Crop a region from the world-names master by feature name (looked up in index) or by explicit col/row.
# Master can be any image format (webp/png/jpg/...); resolved by stem from masters/.
# Cell pixel size is derived from the master image's actual resolution at crop time.
# Saves permanent crops to maps/locations/<slug>-map.png.
# Saves temp crops to maps/world/temp-crop.png (caller must delete).
# -Markers: also crop the city-markers master to same bounds -> <slug>-markers.png or temp-markers.png
#
# WARNING: keep -Output inside maps/. .gitignore covers maps/**/*.{png,webp,...} but NOT
# arbitrary paths elsewhere. A crop written outside maps/ can be committed by accident --
# never commit generated images.
#
# Usage:
#   .\scripts\map-crop.ps1 -Feature "<feature>"
#   .\scripts\map-crop.ps1 -Feature "<feature>" -Markers
#   .\scripts\map-crop.ps1 -Feature "<feature>" -Margin 500
#   .\scripts\map-crop.ps1 -ColMin 5 -ColMax 10 -RowMin 2 -RowMax 6
#   .\scripts\map-crop.ps1 -ColMin 5 -ColMax 10 -RowMin 2 -RowMax 6 -Markers
#   .\scripts\map-crop.ps1 -ColMin 5 -ColMax 10 -RowMin 2 -RowMax 6 -Output ".\maps\locations\<slug>-map.png"

param(
    [string]$Feature  = "",
    [int]$ColMin      = 0,
    [int]$ColMax      = 0,
    [int]$RowMin      = 0,
    [int]$RowMax      = 0,
    [int]$Margin      = 112,
    [string]$Output   = "",
    [switch]$Temp,              # Save as temp-crop.png instead of maps/locations/
    [switch]$Markers            # Also crop city-markers.png to same bounds
)

. "$PSScriptRoot\map-common.ps1"

$indexFile   = ".\maps\world\index.md"
$sourceImage = Resolve-Master "world-names"   # any image format in masters/
# Grid is 16 cols x 13 rows (structural). Cell pixel size is derived from the
# master image's actual resolution at crop time -- no hardcoded pixel constants.
$NCols = 16
$NRows = 13

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

# Pixel box is derived in Python from the master's actual resolution (below).

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
W, H = img.size
cw, ch = W / $NCols, H / $NRows
left   = max(0, round(($ColMin - 1) * cw) - $Margin)
top    = max(0, round(($RowMin - 1) * ch) - $Margin)
right  = min(W, round($ColMax * cw) + $Margin)
bottom = min(H, round($RowMax * ch) + $Margin)
crop = img.crop((left, top, right, bottom))
crop.save(r'$absOutput')
print(f'Saved {crop.size[0]}x{crop.size[1]}px from {W}x{H} master -> $absOutput')
"@

if ($Temp) { Write-Warning "Temp file -- delete after reading: $Output" }

# Optionally crop city-markers.png to same bounds
if (-not $Markers) { exit 0 }

$markersSource = Resolve-Master "city-markers"   # any image format in masters/

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
W, H = img.size
cw, ch = W / $NCols, H / $NRows
left   = max(0, round(($ColMin - 1) * cw) - $Margin)
top    = max(0, round(($RowMin - 1) * ch) - $Margin)
right  = min(W, round($ColMax * cw) + $Margin)
bottom = min(H, round($RowMax * ch) + $Margin)
crop = img.crop((left, top, right, bottom))
crop.save(r'$markersOutput')
print(f'Markers: {crop.size[0]}x{crop.size[1]}px from {W}x{H} master -> $markersOutput')
"@
