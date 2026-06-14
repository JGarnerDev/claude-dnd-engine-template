# entity-graph.ps1 -- show 1-hop relation graph for a named entity
# consumers: CLAUDE.md -- update these if usage, flags, or output format change.
# Usage: .\scripts\entity-graph.ps1 -Name "<entity name>"
# Searches both ./data and ./historian

param(
    [Parameter(Mandatory)]
    [string]$Name
)

$root = Resolve-Path "$PSScriptRoot\.."
$searchDirs = @("data", "historian", "scheduler")

. "$PSScriptRoot\lib\common.ps1"

function Get-WikiLinks($text) {
    $links = @()
    $matches_all = [regex]::Matches($text, '\[\[([^\]|]+)(?:\|[^\]]*)?\]\]')
    foreach ($m in $matches_all) { $links += $m.Groups[1].Value.Trim() }
    return $links | Sort-Object -Unique
}

# Find target file
$allFiles = $searchDirs | ForEach-Object { Get-ChildItem "$root\$_" -Recurse -Filter "*.md" }
$target = $allFiles | Where-Object { $_.BaseName -ieq $Name } | Select-Object -First 1

if (-not $target) {
    # fuzzy: name contains
    $target = $allFiles | Where-Object { $_.BaseName -ilike "*$Name*" } | Select-Object -First 1
}

if (-not $target) {
    Write-Host "Entity not found: '$Name'" -ForegroundColor Red
    exit 1
}

$content = Get-Content $target.FullName -Raw -Encoding UTF8
$fm = Get-Frontmatter $target.FullName
$relPath = $target.FullName.Replace($root.Path + "\", "")

$entityName = if ($fm['name']) { $fm['name'] } else { $target.BaseName }
Write-Host "`n=== $entityName ===" -ForegroundColor Cyan
Write-Host "  File: $relPath" -ForegroundColor Gray
Write-Host "  Type: $($fm['type'])$(if ($fm['subtype']) { '/' + $fm['subtype'] })" -ForegroundColor White
Write-Host "  Exists: $($fm['exists']) | State: $($fm['state']) | Importance: $($fm['importance'])" -ForegroundColor White
if ($fm['description']) { Write-Host "  Desc: $($fm['description'])" -ForegroundColor Gray }

# Extract all wiki-links from frontmatter block only
if ($content -match '(?s)^---\r?\n(.+?)\r?\n---') {
    $fmBlock = $Matches[1]
    $links = Get-WikiLinks $fmBlock

    if ($links.Count -gt 0) {
        Write-Host "`n  Relations (from frontmatter):" -ForegroundColor Yellow
        foreach ($link in $links) {
            # find the linked entity
            $linked = $allFiles | Where-Object { $_.BaseName -ieq $link } | Select-Object -First 1
            if ($linked) {
                $lfm = Get-Frontmatter $linked.FullName
                $lRelPath = $linked.FullName.Replace($root.Path + "\", "")
                $exists = $lfm['exists']
                $color = if ($exists -eq 'true') { 'Green' } elseif ($exists -eq 'false') { 'DarkYellow' } else { 'Gray' }
                Write-Host "    -> [[$link]] ($($lfm['type'])$(if ($lfm['subtype']) { '/' + $lfm['subtype'] }), exists:$exists)" -ForegroundColor $color
            } else {
                Write-Host "    -> [[$link]] (not found)" -ForegroundColor DarkGray
            }
        }
    }
}

# Find reverse references: who links TO this entity
Write-Host "`n  Referenced by:" -ForegroundColor Yellow
$reverseName = if ($fm['name']) { $fm['name'] } else { $target.BaseName }
$refCount = 0
foreach ($file in $allFiles) {
    if ($file.FullName -eq $target.FullName) { continue }
    $fc = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($fc -match "\[\[$([regex]::Escape($reverseName))") {
        $rfm = Get-Frontmatter $file.FullName
        $rRelPath = $file.FullName.Replace($root.Path + "\", "")
        $rName = if ($rfm['name']) { $rfm['name'] } else { $file.BaseName }
        Write-Host "    <- $rName ($rRelPath)" -ForegroundColor DarkCyan
        $refCount++
    }
}
if ($refCount -eq 0) { Write-Host "    (none found)" -ForegroundColor DarkGray }

