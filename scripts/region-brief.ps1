# region-brief.ps1 -- compressed summary of an existing region draft
# Usage: .\scripts\region-brief.ps1 [-Region <slug>]
# Auto-detects draft if only one exists in drafts/regions/

param(
    [string]$Region = ""
)

$root      = Resolve-Path "$PSScriptRoot\.."
$draftsDir = Join-Path $root "drafts\regions"

# -- Find draft file -----------------------------------------------------------
if ($Region) {
    $candidate = Join-Path $draftsDir "$Region.md"
    if (-not (Test-Path $candidate)) { $candidate = Join-Path $draftsDir $Region }
    if (-not (Test-Path $candidate)) {
        Write-Host "Draft not found: $Region" -ForegroundColor Red; exit 1
    }
    $draftFile = $candidate
} else {
    $drafts = Get-ChildItem $draftsDir -Filter "*.md" |
              Where-Object { $_.BaseName -notmatch '\.original$' }
    if ($drafts.Count -eq 0) {
        Write-Host "No region drafts in $draftsDir" -ForegroundColor Red; exit 1
    } elseif ($drafts.Count -eq 1) {
        $draftFile = $drafts[0].FullName
    } else {
        Write-Host "Multiple drafts -- specify -Region <slug>:" -ForegroundColor Yellow
        $drafts | ForEach-Object { Write-Host "  $($_.BaseName)" -ForegroundColor Gray }
        exit 1
    }
}

$content = Get-Content $draftFile -Raw -Encoding UTF8

# -- Frontmatter ---------------------------------------------------------------
$fm = @{}
if ($content -match '(?s)^---\r?\n(.+?)\r?\n---') {
    foreach ($line in ($Matches[1] -split "`n")) {
        $line = $line.TrimEnd("`r")
        if ($line -match '^([\w_]+):\s*(.+)$') { $fm[$Matches[1].Trim()] = $Matches[2].Trim() }
    }
}

# -- Counts --------------------------------------------------------------------
$zoneCount     = ([regex]::Matches($content, '(?m)^## Zone')).Count
$locationCount = ([regex]::Matches($content, '(?m)^### Location')).Count

# -- Anchored / Unanchored -----------------------------------------------------
$anchored   = [System.Collections.Generic.List[string]]::new()
$unanchored = [System.Collections.Generic.List[string]]::new()

$locBlocks = [regex]::Matches($content, '(?s)### (Location \d+[^\n]*)\n(.*?)(?=\n### |\n## |\z)')
foreach ($m in $locBlocks) {
    $header = $m.Groups[1].Value.Trim()
    $body   = $m.Groups[2].Value
    $num    = ([regex]::Match($header, '\d+')).Value

    if ($body -match '\*\*Candidate entities:\*\*') {
        if ($body -match 'None\. No free entities') {
            $unanchored.Add($num)
        } else {
            $names = [regex]::Matches($body, '\[\[([^\]]+)\]\]') |
                     ForEach-Object { $_.Groups[1].Value } |
                     Select-Object -Unique
            $label = "$num -- $($names -join ', ')"
            $anchored.Add($label)
        }
    } else {
        $unanchored.Add("$num (no anchor section yet)")
    }
}

# -- Open Questions ------------------------------------------------------------
$openQs = @()
if ($content -match '(?s)## Open Questions\r?\n\r?\n(.*?)(?=\r?\n---|\r?\n## |\z)') {
    $openQs = ($Matches[1] -split "`n") |
              Where-Object { $_ -match '^\s*-\s*\*\*' } |
              ForEach-Object { ($_ -replace '^\s*-\s*\*\*([^*]+)\*\*.*', '$1').Trim() }
}

# -- Phases complete (heuristic) -----------------------------------------------
$phaseDone = @()
if ($zoneCount -gt 0)                             { $phaseDone += "Phase 4 (draft)" }
if ($anchored.Count -gt 0 -or $unanchored.Count -gt 0) { $phaseDone += "Phase 6 (anchoring)" }
$questDir = Join-Path $root "questionnaires"
if (Test-Path $questDir) {
    $slug = [IO.Path]::GetFileNameWithoutExtension($draftFile)
    $qCount = (Get-ChildItem $questDir -Filter "$slug-city-*.md" -ErrorAction SilentlyContinue).Count
    if ($qCount -gt 0) { $phaseDone += "Phase 7 ($qCount questionnaires)" }
}

# -- Output --------------------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host "  REGION BRIEF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host ""

$nameDisplay = if ($fm['name']) { $fm['name'] } else { [IO.Path]::GetFileNameWithoutExtension($draftFile) }
Write-Host "Region:   $nameDisplay" -ForegroundColor White
if ($fm['world_position']) { Write-Host "Position: $($fm['world_position'])" -ForegroundColor Gray }
if ($fm['climate'])        { Write-Host "Climate:  $($fm['climate'])"        -ForegroundColor Gray }
if ($fm['major_water'])    { Write-Host "Water:    $($fm['major_water'])"    -ForegroundColor Gray }
Write-Host ""
Write-Host "Zones: $zoneCount    Locations: $locationCount" -ForegroundColor White
if ($phaseDone.Count) {
    Write-Host "Done:  $($phaseDone -join ' | ')" -ForegroundColor Green
}
Write-Host ""

if ($anchored.Count) {
    Write-Host "-- Anchored ($($anchored.Count)) -------------------------" -ForegroundColor Green
    foreach ($a in $anchored) { Write-Host "  $a" -ForegroundColor Gray }
}
if ($unanchored.Count) {
    Write-Host "-- Unanchored ($($unanchored.Count)) ---------------------" -ForegroundColor Yellow
    Write-Host "  Locations: $($unanchored -join ', ')" -ForegroundColor Gray
}

if ($openQs.Count) {
    Write-Host ""
    Write-Host "-- Open Questions ($($openQs.Count)) ----------------------" -ForegroundColor Cyan
    foreach ($q in $openQs) { Write-Host "  - $q" -ForegroundColor Gray }
}

# -- Map files -----------------------------------------------------------------
$slug    = [IO.Path]::GetFileNameWithoutExtension($draftFile)
$mapsDir = Join-Path $root "maps\regions\$slug"
if (Test-Path $mapsDir) {
    $mapImages = Get-ChildItem $mapsDir -Include '*.jpg','*.png','*.jpeg' -ErrorAction SilentlyContinue
    Write-Host "-- Maps ($($mapsDir -replace [regex]::Escape($root.Path+'\'), '')) ------------" -ForegroundColor DarkGray
    if ($mapImages.Count) {
        foreach ($img in $mapImages) { Write-Host "  $($img.Name)" -ForegroundColor Gray }
    } else {
        Write-Host "  No images yet -- add to maps/regions/$slug/" -ForegroundColor DarkYellow
    }
    Write-Host ""
}

Write-Host "File: $([IO.Path]::GetFileName($draftFile))" -ForegroundColor DarkGray
Write-Host "========================================`n" -ForegroundColor DarkGray
