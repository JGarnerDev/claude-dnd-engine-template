# location-entities.ps1 -- find all historian entities at or near a location
# consumers: CLAUDE.md -- update these if usage, flags, or output format change.
# Hop 0: direct location/region/relates_to match
# Hops 1-N: BFS via all frontmatter entity-name references
# Usage: .\scripts\location-entities.ps1 -Location "Barovia Village" [-Depth 3]

param(
    [Parameter(Mandatory)]
    [string]$Location,
    [int]$Depth = 3
)

$root = Resolve-Path "$PSScriptRoot\.."
$histDir = "$root\historian"

. "$PSScriptRoot\lib\common.ps1"

function Get-AllRefs($fm) {
    $refs = @()
    foreach ($key in $fm.Keys) {
        if ($key -like '_list_*') {
            $refs += $fm[$key]
        } elseif ($fm[$key] -is [string] -and $fm[$key] -ne '') {
            $refs += $fm[$key]
        }
    }
    return $refs
}

function Matches-Location($fm, $loc) {
    $locLower = $loc.ToLower()
    foreach ($key in @('location', 'region')) {
        if ($fm[$key] -and $fm[$key].ToLower() -like "*$locLower*") { return $true }
    }
    foreach ($key in @('_list_locations', '_list_relates_to')) {
        if ($fm[$key]) {
            foreach ($item in $fm[$key]) {
                if ($item.ToLower() -like "*$locLower*") { return $true }
            }
        }
    }
    return $false
}

# Load all historian entities
$allFiles = Get-ChildItem $histDir -Recurse -Filter "*.md"
$entityIndex  = @{}   # canonical name -> { fm, file }
$entityByLower = @{}  # lowercase name -> canonical name (for fast lookup)

foreach ($file in $allFiles) {
    $fm = Get-Frontmatter $file.FullName
    $name = $fm['name']
    if ($name) {
        $entityIndex[$name]          = @{ fm = $fm; file = $file.FullName }
        $entityByLower[$name.ToLower()] = $name
    }
}

# BFS
$visited = @{}   # canonical name -> hop distance
$queue   = [System.Collections.Queue]::new()

# Hop 0: direct location match
foreach ($name in $entityIndex.Keys) {
    if (Matches-Location $entityIndex[$name].fm $Location) {
        if (-not $visited.ContainsKey($name)) {
            $visited[$name] = 0
            $queue.Enqueue($name)
        }
    }
}

# Expand hops 1 .. $Depth
while ($queue.Count -gt 0) {
    $current     = $queue.Dequeue()
    $currentHop  = $visited[$current]
    if ($currentHop -ge $Depth) { continue }

    $refs = Get-AllRefs $entityIndex[$current].fm
    foreach ($ref in $refs) {
        $refKey = $ref.Trim().ToLower()
        if ($entityByLower.ContainsKey($refKey)) {
            $ename = $entityByLower[$refKey]
            if (-not $visited.ContainsKey($ename)) {
                $visited[$ename] = $currentHop + 1
                $queue.Enqueue($ename)
            }
        }
    }
}

if ($visited.Count -eq 0) {
    Write-Host "No historian entities found referencing '$Location'." -ForegroundColor Yellow
    Write-Host "Try a partial name (e.g. 'Barovia' instead of 'Barovia Village')." -ForegroundColor DarkGray
    exit
}

Write-Host "`n=== Entities near: $Location ($($visited.Count) total, depth $Depth) ===" -ForegroundColor Cyan

for ($hop = 0; $hop -le $Depth; $hop++) {
    $hopNames = @($visited.Keys | Where-Object { $visited[$_] -eq $hop })
    if ($hopNames.Count -eq 0) { continue }

    $label = if ($hop -eq 0) { "Direct" } else { "Hop $hop" }
    Write-Host "`n--- $label ($($hopNames.Count)) ---" -ForegroundColor Magenta

    $hopResults = foreach ($name in $hopNames) {
        $fm      = $entityIndex[$name].fm
        $relPath = $entityIndex[$name].file.Replace($root.Path + "\", "")
        [PSCustomObject]@{
            Name       = $fm['name']
            Type       = $fm['type']
            Subtype    = $fm['subtype']
            State      = $fm['state']
            Exists     = $fm['exists']
            Importance = $fm['importance']
            Desc       = $fm['description']
            File       = $relPath
        }
    }

    $grouped = $hopResults | Group-Object Type | Sort-Object Name
    foreach ($group in $grouped) {
        Write-Host "`n  [$($group.Name)]" -ForegroundColor Yellow
        foreach ($r in ($group.Group | Sort-Object Importance, Name)) {
            $sub        = if ($r.Subtype) { "/$($r.Subtype)" } else { "" }
            $existsColor = if ($r.Exists -eq 'true') { 'Green' } else { 'DarkYellow' }
            Write-Host ("    {0}{1} - {2}" -f $r.Name, $sub, $r.State) -ForegroundColor $existsColor
            if ($r.Desc) { Write-Host "      $($r.Desc)" -ForegroundColor DarkGray }
        }
    }
}

Write-Host ""
