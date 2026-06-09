# pitch-brief.ps1 - pre-pitch context summary
# Replaces manual reads of meta/worldbuilding.md and pitch-log/pitch-history.md
# Usage: .\scripts\pitch-brief.ps1 [-Type <type>]

param(
    [string]$Type = ""
)

$root = Resolve-Path "$PSScriptRoot\.."

$header = if ($Type) { "PITCH BRIEF -- $Type" } else { "PITCH BRIEF" }
Write-Host $header -ForegroundColor Cyan

# -- Worldbuilding tone + themes ---------------------------------------------
$wbPath = "$root\meta\worldbuilding.md"
if (Test-Path $wbPath) {
    $content = Get-Content $wbPath -Raw -Encoding UTF8

    if ($content -match '(?s)## Tone\r?\n\r?\n(.+?)\r?\n\r?\n##') {
        Write-Host "`nTone: $($Matches[1].Trim())"
    }

    if ($content -match '(?s)## Core Themes\r?\n\r?\n((?:- [^\r\n]+\r?\n?)+)') {
        $themes = ($Matches[1] -split '\r?\n' |
            Where-Object { $_ -match '^- ' } |
            ForEach-Object { $_ -replace '^- ', '' }) -join ' | '
        Write-Host "Themes: $themes"
    }
} else {
    Write-Host "`n(worldbuilding.md not found)"
}

# -- Pitch history -----------------------------------------------------------
$histPath = "$root\pitch-log\pitch-history.md"
if (Test-Path $histPath) {
    $lines = Get-Content $histPath -Encoding UTF8 | Where-Object { $_ -match '^- ' }

    if ($Type -ne "") {
        $pattern = "^- $([regex]::Escape($Type)):"
        $filtered = $lines | Where-Object { $_ -match $pattern }
        if ($filtered) {
            $count = @($filtered).Count
            Write-Host "`n$Type history ($count entries - avoid all):"
            $filtered | ForEach-Object {
                $entry = $_ -replace "^- $([regex]::Escape($Type)):\s*", ''
                Write-Host "  $entry"
            }
        } else {
            Write-Host "`n$Type history: none"
        }
    } else {
        Write-Host "`nPitch history (all):"
        $lines | ForEach-Object { Write-Host "  $_" }
    }
} else {
    Write-Host "`nPitch history: none"
}

Write-Host ""
