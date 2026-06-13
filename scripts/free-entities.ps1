# free-entities.ps1 -- list all free (exists: false) entities in ./data
# consumers: CLAUDE.md, .claude/commands/entity-ingest.md, .claude/commands/entity-questionnaire.md, .claude/commands/region.md, .claude/commands/session.md, tests/commands/session/spec.md, data/CLAUDE.md -- update these if usage, flags, or output format change.
# Usage: .\scripts\free-entities.ps1 [-Type npc|location|deity|etc] [-Player paul|ben|miguel|jeff]

param(
    [string]$Type   = "",
    [string]$Player = ""
)

$root = Join-Path (Join-Path $PSScriptRoot "..") "data"
$files = Get-ChildItem $root -Recurse -Filter "*.md"

. "$PSScriptRoot\lib\common.ps1"

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

