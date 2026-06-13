# refs.ps1 -- reverse dependency lookup: who references this file?
# consumers: CLAUDE.md -- update these if usage, flags, or output format change.
# Run BEFORE renaming, moving, or changing the output format of any script,
# meta doc, or command file. Lists every file:line that mentions the target,
# so dependents get updated in the same change.
#
# Matches both the full relative path and the bare filename (catches
# `.\scripts\foo.ps1`, `scripts/foo.ps1`, and plain `foo.ps1` mentions).
#
# Usage: .\scripts\refs.ps1 -Target <path-or-filename>
#   e.g. .\scripts\refs.ps1 -Target scripts/session-brief.ps1
#        .\scripts\refs.ps1 -Target meta/entity-creation.md

param(
    [Parameter(Mandatory = $true)]
    [string]$Target
)

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
function Rel($p) { $p.Replace($repo + [IO.Path]::DirectorySeparatorChar, "") }

$leaf = [IO.Path]::GetFileName(($Target -replace '\\', '/'))
$pattern = [regex]::Escape($leaf)

$files = Get-ChildItem $repo -Recurse -File -Include *.md, *.ps1, *.py |
    Where-Object { $_.FullName -notmatch '[\\/](\.obsidian|\.git|node_modules|vector-index)[\\/]' }

$hits = 0
foreach ($f in $files) {
    $rel = Rel $f.FullName
    if ($leaf -ieq $f.Name) { continue }   # skip the target itself
    $matches = Select-String -Path $f.FullName -Pattern $pattern
    foreach ($m in $matches) {
        Write-Host ("{0}:{1}: {2}" -f $rel, $m.LineNumber, $m.Line.Trim())
        $hits++
    }
}

Write-Host "`n$hits reference(s) to '$leaf'" -ForegroundColor Cyan
