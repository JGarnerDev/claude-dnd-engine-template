# naming-status.ps1
# consumers: CLAUDE.md -- update these if usage, flags, or output format change.
# Scan questionnaires/world-naming.md and report named vs. unnamed entries by section.

param(
    [string]$Section = ""  # Optional: filter to a specific section (e.g. "Rivers", "Plains")
)

$file = ".\questionnaires\world-naming.md"
if (-not (Test-Path $file)) {
    Write-Error "Not found: $file"
    exit 1
}

$lines = Get-Content $file
$currentSection = ""
$currentEntry = ""
$named = [System.Collections.Generic.List[PSCustomObject]]::new()
$unnamed = [System.Collections.Generic.List[PSCustomObject]]::new()

foreach ($line in $lines) {
    if ($line -match "^## (.+)") {
        $currentSection = $matches[1].Trim()
    }
    elseif ($line -match "^\#{3} (.+)") {
        $currentEntry = $matches[1].Trim()
    }
    elseif ($line -match "^\*\*Name:\*\*\s*$") {
        $unnamed.Add([PSCustomObject]@{ Section = $currentSection; Entry = $currentEntry })
    }
    elseif ($line -match "^\*\*Name:\*\*\s+(.+)$") {
        $named.Add([PSCustomObject]@{ Section = $currentSection; Entry = $currentEntry; Name = $matches[1].Trim() })
    }
}

# Apply section filter
if ($Section -ne "") {
    $named  = $named  | Where-Object { $_.Section -like "*$Section*" }
    $unnamed = $unnamed | Where-Object { $_.Section -like "*$Section*" }
}

$total = $named.Count + $unnamed.Count
Write-Host ""
Write-Host "World Naming Status" -ForegroundColor Cyan
Write-Host "Named: $($named.Count) / $total  |  Unnamed: $($unnamed.Count) / $total"
Write-Host ""

# Unnamed grouped by section
if ($unnamed.Count -gt 0) {
    Write-Host "UNNAMED" -ForegroundColor Yellow
    $unnamed | Group-Object Section | ForEach-Object {
        Write-Host "  [$($_.Name)]"
        $_.Group | ForEach-Object { Write-Host "    - $($_.Entry)" }
    }
    Write-Host ""
}

# Named grouped by section
if ($named.Count -gt 0) {
    Write-Host "NAMED" -ForegroundColor Green
    $named | Group-Object Section | ForEach-Object {
        Write-Host "  [$($_.Name)]"
        $_.Group | ForEach-Object { Write-Host "    + $($_.Entry) => $($_.Name)" }
    }
    Write-Host ""
}
