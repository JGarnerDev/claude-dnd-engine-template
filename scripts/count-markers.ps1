# count-markers.ps1
# consumers: CLAUDE.md, .claude/commands/region.md -- update these if usage, flags, or output format change.
# Count undetailed city markers (red dots) in a map region.
# Uses Python/PIL to detect and count distinct red blobs in the city-markers master.
# Master can be any image format (webp/png/jpg/...); resolved by stem from masters/.
# Cell pixel size is derived from the master image's actual resolution at count time.
#
# Usage:
#   .\scripts\count-markers.ps1 -Feature "Bay B"
#   .\scripts\count-markers.ps1 -ColMin 4 -ColMax 7 -RowMin 3 -RowMax 6

param(
    [string]$Feature = "",
    [int]$ColMin     = 0,
    [int]$ColMax     = 0,
    [int]$RowMin     = 0,
    [int]$RowMax     = 0,
    [int]$Margin     = 112,
    [int]$MinArea    = -1       # -1 = auto (~0.0006 of a grid cell; scales with resolution). Drops sub-dot specks (lava flecks / webp noise).
)

. "$PSScriptRoot\map-common.ps1"

$indexFile    = ".\maps\world\index.md"
$markersImage = Resolve-Master "city-markers"   # any image format in masters/
# Grid is 16 cols x 13 rows (structural). Cell pixel size is derived from the
# master image's actual resolution at count time -- no hardcoded pixel constants.
$NCols = 16
$NRows = 13

if ($Feature -ne "") {
    $lines = Get-Content $indexFile
    $found = $false
    foreach ($line in $lines) {
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
        Write-Warning "'$Feature' not in index -- provide -ColMin/-ColMax/-RowMin/-RowMax directly"
        exit 1
    }
}

if ($ColMin -eq 0 -and $ColMax -eq 0) {
    Write-Error "Provide -Feature or -ColMin/-ColMax/-RowMin/-RowMax"
    exit 1
}

$absMarkers = (Resolve-Path $markersImage).Path
$pyTmp = [System.IO.Path]::GetTempPath() + "count_markers.py"

$L1  = 'from PIL import Image'
$L2  = "img = Image.open(r'" + $absMarkers + "').convert('RGB')"
$Lc1 = "W, H = img.size"
$Lc2 = "cw, ch = W / $NCols, H / $NRows"
$Lc3 = "left   = max(0, round(($ColMin - 1) * cw) - $Margin)"
$Lc4 = "top    = max(0, round(($RowMin - 1) * ch) - $Margin)"
$Lc5 = "right  = min(W, round($ColMax * cw) + $Margin)"
$Lc6 = "bottom = min(H, round($RowMax * ch) + $Margin)"
$Lc7 = "min_area = ($MinArea) if ($MinArea) >= 0 else max(6, round(cw * ch * 0.0006))"
$L3  = "crop = img.crop((left, top, right, bottom))"
$L4  = 'w, h = crop.size'
$L5  = 'pixels = crop.load()'
$L6  = 'red = set()'
$L7  = 'for y in range(h):'
$L8  = '    for x in range(w):'
$L9  = '        r, g, b = pixels[x, y]'
$L10 = '        if r > 160 and g < 110 and b < 110:'
$L11 = '            red.add((x, y))'
$L12 = 'count = 0'
$L13 = 'while red:'
$L14 = '    start = next(iter(red))'
$L15 = '    stack = [start]'
$L15b= '    size = 0'
$L16 = '    while stack:'
$L17 = '        p = stack.pop()'
$L18 = '        if p not in red: continue'
$L19 = '        red.discard(p)'
$L19b= '        size += 1'
$L20 = '        x, y = p'
$L21 = '        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]:'
$L22 = '            nx, ny = x+dx, y+dy'
$L23 = '            if 0 <= nx < w and 0 <= ny < h:'
$L24 = '                stack.append((nx, ny))'
$L25 = '    if size >= min_area: count += 1'
$L26 = 'print(count)'

@($L1,$L2,$Lc1,$Lc2,$Lc3,$Lc4,$Lc5,$Lc6,$Lc7,$L3,$L4,$L5,$L6,$L7,$L8,$L9,$L10,$L11,$L12,$L13,$L14,$L15,$L15b,$L16,$L17,$L18,$L19,$L19b,$L20,$L21,$L22,$L23,$L24,$L25,$L26) | Set-Content -Path $pyTmp -Encoding utf8

$result = python $pyTmp
Remove-Item $pyTmp

$label = if ($Feature -ne "") { $Feature } else { "cols $ColMin-$ColMax rows $RowMin-$RowMax" }
Write-Output "Undetailed cities in '$label': $result"
