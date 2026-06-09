# count-markers.ps1
# Count undetailed city markers (red dots) in a map region.
# Uses Python/PIL to detect and count distinct red blobs in city-markers.png.
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
    [int]$Margin     = 300
)

$indexFile    = ".\maps\world\index.md"
$markersImage = ".\maps\world\city-markers.png"
$cellW = 512
$cellH = 472
$imgW  = 8192
$imgH  = 6144

if (-not (Test-Path $markersImage)) {
    Write-Error "city-markers.png not found at $markersImage"
    exit 1
}

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

$left   = [Math]::Max(0,    ($ColMin - 1) * $cellW - $Margin)
$top    = [Math]::Max(0,    ($RowMin - 1) * $cellH - $Margin)
$right  = [Math]::Min($imgW, $ColMax      * $cellW + $Margin)
$bottom = [Math]::Min($imgH, $RowMax      * $cellH + $Margin)

$absMarkers = (Resolve-Path $markersImage).Path
$pyTmp = [System.IO.Path]::GetTempPath() + "count_markers.py"

$L1  = 'from PIL import Image'
$L2  = "img = Image.open(r'" + $absMarkers + "').convert('RGB')"
$L3  = "crop = img.crop((" + $left + ", " + $top + ", " + $right + ", " + $bottom + "))"
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
$L16 = '    while stack:'
$L17 = '        p = stack.pop()'
$L18 = '        if p not in red: continue'
$L19 = '        red.discard(p)'
$L20 = '        x, y = p'
$L21 = '        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]:'
$L22 = '            nx, ny = x+dx, y+dy'
$L23 = '            if 0 <= nx < w and 0 <= ny < h:'
$L24 = '                stack.append((nx, ny))'
$L25 = '    count += 1'
$L26 = 'print(count)'

@($L1,$L2,$L3,$L4,$L5,$L6,$L7,$L8,$L9,$L10,$L11,$L12,$L13,$L14,$L15,$L16,$L17,$L18,$L19,$L20,$L21,$L22,$L23,$L24,$L25,$L26) | Set-Content -Path $pyTmp -Encoding utf8

$result = python $pyTmp
Remove-Item $pyTmp

$label = if ($Feature -ne "") { $Feature } else { "cols $ColMin-$ColMax rows $RowMin-$RowMax" }
Write-Output "Undetailed cities in '$label': $result"
