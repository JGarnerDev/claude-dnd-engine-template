# monster-lookup.ps1 -- filter monsters by CR, creature type, and/or habitat
# consumers: CLAUDE.md, meta/difficulty.md, data/CLAUDE.md -- update these if usage, flags, or output format change.
# Reads frontmatter only. Replaces manual Glob + Read loops over data/monsters/.
# Usage: .\scripts\monster-lookup.ps1 [-Type <aberration|undead|...>] [-CRMin <n>] [-CRMax <n>] [-Habitat <cave|forest|...>]

param(
    [string]$Type    = "",
    [double]$CRMin   = 0,
    [double]$CRMax   = 30,
    [string]$Habitat = ""
)

$root  = Resolve-Path "$PSScriptRoot\..\data\monsters"
$files = Get-ChildItem $root -Filter "*.md" | Sort-Object Name

function Parse-MonsterFrontmatter($path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    if ($content -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { return $null }
    $block = $Matches[1]
    $lines = $block -split "`r?\n"

    $fm = @{ name = ""; creature_type = ""; challenge_rating = ""; habitats = @() }

    $i = 0
    while ($i -lt $lines.Count) {
        $line = $lines[$i]

        if ($line -match '^habitats:') {
            $i++
            $hab = @()
            while ($i -lt $lines.Count -and $lines[$i] -match '^\s+-\s+"?\[\[(.+?)\]\]"?') {
                $hab += $Matches[1]
                $i++
            }
            $fm['habitats'] = $hab
            continue
        }

        if ($line -match '^(\w[\w_]*):\s*"?([^"#\r\n]*)"?\s*$') {
            $fm[$Matches[1].Trim()] = $Matches[2].Trim()
        }
        $i++
    }

    return $fm
}

function Parse-CR($crStr) {
    if ($crStr -match '^(\d+)/(\d+)$') { return [double]$Matches[1] / [double]$Matches[2] }
    $val = 0.0
    if ([double]::TryParse($crStr, [ref]$val)) { return $val }
    return -1
}

$results = @()

foreach ($file in $files) {
    $fm = Parse-MonsterFrontmatter $file.FullName
    if (-not $fm) { continue }

    if ($Type    -and $fm['creature_type'] -notlike $Type)    { continue }
    if ($Habitat -and -not ($fm['habitats'] | Where-Object { $_ -ilike "*$Habitat*" })) { continue }

    $cr = Parse-CR $fm['challenge_rating']
    if ($cr -lt 0 -or $cr -lt $CRMin -or $cr -gt $CRMax) { continue }

    $results += [PSCustomObject]@{
        Name         = $fm['name']
        CR           = $fm['challenge_rating']
        CRNum        = $cr
        CreatureType = $fm['creature_type']
        Habitats     = ($fm['habitats'] -join ", ")
    }
}

if ($results.Count -eq 0) {
    $filters = @()
    if ($Type)    { $filters += "type=$Type" }
    if ($PSBoundParameters.ContainsKey('CRMin')) { $filters += "CR>=$CRMin" }
    if ($PSBoundParameters.ContainsKey('CRMax')) { $filters += "CR<=$CRMax" }
    if ($Habitat) { $filters += "habitat=$Habitat" }
    $f = if ($filters) { " matching " + ($filters -join ", ") } else { "" }
    Write-Host "No monsters found$f."
    exit
}

$groups = $results | Group-Object CreatureType | Sort-Object Name

foreach ($group in $groups) {
    Write-Host "`n=== $($group.Name) ($($group.Count)) ===" -ForegroundColor Cyan
    foreach ($m in ($group.Group | Sort-Object CRNum, Name)) {
        $hab = if ($m.Habitats) { "  [$($m.Habitats)]" } else { "" }
        Write-Host "  CR $($m.CR.PadRight(4))  $($m.Name)$hab" -ForegroundColor White
    }
}

Write-Host "`nTotal: $($results.Count) monsters" -ForegroundColor Yellow
