# free-entities.ps1 -- list all free (exists: false) entities in ./data
# Usage: .\scripts\free-entities.ps1 [-Type npc|location|deity|etc] [-Player paul|ben|miguel|jeff]

param(
    [string]$Type   = "",
    [string]$Player = ""
)

$root = Join-Path (Join-Path $PSScriptRoot "..") "data"
$files = Get-ChildItem $root -Recurse -Filter "*.md"

function Get-Frontmatter($path) {
    $lines = Get-Content $path -Raw -Encoding UTF8
    if ($lines -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { return @{} }
    $block = $Matches[1]
    $fm = @{}
    foreach ($line in ($block -split "`n")) {
        if ($line -match '^(\w[\w_]*):\s*"?([^"#\r\n]*)"?\s*$') {
            $fm[$Matches[1].Trim()] = $Matches[2].Trim()
        }
    }
    return $fm
}

$results = @()

foreach ($file in $files) {
    $fm = Get-Frontmatter $file.FullName
    if ($fm['exists'] -ne 'false') { continue }
    if ($Type   -and $fm['type']           -ne $Type)   { continue }
    if ($Player -and $fm['contributed_by'] -ne $Player) { continue }

    $results += [PSCustomObject]@{
        Name          = $fm['name']
        Type          = $fm['type']
        Subtype       = $fm['subtype']
        Importance    = $fm['importance']
        ContributedBy = $fm['contributed_by']
        Description   = $fm['description']
        File          = $file.FullName.Replace((Resolve-Path "$PSScriptRoot\..").Path + "\", "")
    }
}

if ($results.Count -eq 0) {
    $filter = @()
    if ($Type)   { $filter += "type '$Type'" }
    if ($Player) { $filter += "player '$Player'" }
    $suffix = if ($filter.Count) { " matching " + ($filter -join ", ") } else { "" }
    Write-Host "No free entities found$suffix."
    exit
}

$typeGroups = $results | Group-Object Type | Sort-Object Name

foreach ($group in $typeGroups) {
    Write-Host "`n=== $($group.Name) ($($group.Count)) ===" -ForegroundColor Cyan
    foreach ($r in ($group.Group | Sort-Object Importance, Name)) {
        $sub  = if ($r.Subtype)       { "/$($r.Subtype)" }          else { "" }
        $by   = if ($r.ContributedBy) { " [$($r.ContributedBy)]" }  else { "" }
        Write-Host "  [$($r.Importance)] $($r.Name)$sub$by" -ForegroundColor White
        if ($r.Description) {
            Write-Host "    $($r.Description)" -ForegroundColor Gray
        }
    }
}

Write-Host "`nTotal: $($results.Count) free entities" -ForegroundColor Yellow

