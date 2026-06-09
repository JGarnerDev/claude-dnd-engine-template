# route-cities.ps1 -- find all cities served by a given trade route
# Searches data/ and historian/ city files for a routes field match
# Usage: .\scripts\route-cities.ps1 -Route "The Irongate Road"

param(
    [Parameter(Mandatory)]
    [string]$Route
)

$root = Resolve-Path "$PSScriptRoot\.."
$searchDirs = @(
    "$root\data\locations\cities",
    "$root\historian\locations\cities"
)

function Get-Frontmatter($path) {
    $lines = Get-Content $path -Raw -Encoding UTF8
    if ($lines -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { return @{} }
    $block = $Matches[1]
    $fm = @{}
    $currentKey = $null
    foreach ($line in ($block -split "`n")) {
        $line = $line.TrimEnd("`r")
        if ($line -match '^(\w[\w_]*):\s*\[\[([^\]]+)\]\]') {
            $currentKey = $Matches[1].Trim()
            $fm[$currentKey] = ($Matches[2] -split '\|')[0].Trim()
        } elseif ($line -match '^(\w[\w_]*):\s*"?([^"#\r\n]*)"?\s*$') {
            $currentKey = $Matches[1].Trim()
            $fm[$currentKey] = $Matches[2].Trim()
        } elseif ($line -match '^\s+-\s+\[\[([^\]]+)\]\]') {
            if (-not $fm.ContainsKey("_list_$currentKey")) { $fm["_list_$currentKey"] = @() }
            $fm["_list_$currentKey"] += ($Matches[1] -split '\|')[0].Trim()
        } elseif ($line -match '^\s+-\s+"?([^"#\r\n]+)"?\s*$') {
            if ($currentKey -and -not $fm.ContainsKey("_list_$currentKey")) { $fm["_list_$currentKey"] = @() }
            if ($currentKey) { $fm["_list_$currentKey"] += $Matches[1].Trim() }
        }
    }
    return $fm
}

$results = @()

foreach ($dir in $searchDirs) {
    if (-not (Test-Path $dir)) { continue }
    $isCanon = $dir -like "*historian*"

    Get-ChildItem "$dir\*.md" -ErrorAction SilentlyContinue | ForEach-Object {
        $fm = Get-Frontmatter $_.FullName
        $routeList = $fm['_list_routes']
        if (-not $routeList) { return }

        $match = $routeList | Where-Object { $_ -like "*$Route*" }
        if (-not $match) { return }

        $results += [PSCustomObject]@{
            Name       = $fm['name']
            Importance = if ($fm['importance']) { $fm['importance'] } else { '—' }
            State      = if ($fm['state']) { $fm['state'] } else { '—' }
            Canon      = if ($isCanon) { 'canon' } else { 'free' }
            Desc       = $fm['description']
            File       = $_.FullName.Replace($root.Path + '\', '')
        }
    }
}

if ($results.Count -eq 0) {
    Write-Host "No cities found linked to route: $Route" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Add to a city's frontmatter:" -ForegroundColor DarkGray
    Write-Host "  routes:" -ForegroundColor DarkGray
    Write-Host "    - [[$Route]]" -ForegroundColor DarkGray
    exit
}

$importanceOrder = @{ 'critical' = 0; 'major' = 1; 'minor' = 2; 'background' = 3; '—' = 4 }
$sorted = $results | Sort-Object { $importanceOrder[$_.Importance] }, Name

Write-Host ""
Write-Host "=== Cities served by: $Route ($($results.Count) found) ===" -ForegroundColor Cyan
Write-Host ""

foreach ($r in $sorted) {
    $color = if ($r.Canon -eq 'canon') { 'Green' } else { 'DarkYellow' }
    Write-Host ("  {0} [{1}] — {2} ({3})" -f $r.Name, $r.Importance, $r.State, $r.Canon) -ForegroundColor $color
    if ($r.Desc) { Write-Host "    $($r.Desc)" -ForegroundColor DarkGray }
}

Write-Host ""
