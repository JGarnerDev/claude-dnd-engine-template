# party-status.ps1 -- show all PCs from historian + afflictions from campaign file
# Usage: .\scripts\party-status.ps1

$root = Resolve-Path "$PSScriptRoot\.."

function Get-Frontmatter($path) {
    $lines = Get-Content $path -Raw -Encoding UTF8
    if ($lines -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { return @{} }
    $block = $Matches[1]
    $fm = @{}
    foreach ($line in ($block -split "`n")) {
        $line = $line.TrimEnd("`r")
        if ($line -match '^(\w[\w_]*):\s*\[\[([^\]]+)\]\]') {
            $fm[$Matches[1].Trim()] = $Matches[2].Trim()
        } elseif ($line -match '^(\w[\w_]*):\s*"?([^"#\r\n]*)"?\s*$') {
            $fm[$Matches[1].Trim()] = $Matches[2].Trim()
        }
    }
    return $fm
}

# Load afflictions from campaign party table
$afflictions = @{}
$campaignFile = Get-ChildItem "$root\scheduler\campaign" -Filter "*.md" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($campaignFile) {
    $content = Get-Content $campaignFile.FullName -Raw -Encoding UTF8
    if ($content -match '## Party\r?\n([\s\S]+?)(\r?\n##|\z)') {
        $partyBlock = $Matches[1]
        foreach ($line in ($partyBlock -split "`n")) {
            $line = $line.TrimEnd("`r")
            if ($line -match '^\|' -and $line -notmatch '^\|---' -and $line -notmatch '^\| ?Player') {
                $cols = $line -split '\|' | Where-Object { $_ -ne '' } | ForEach-Object { $_.Trim() }
                if ($cols.Count -ge 4) {
                    $charName = $cols[1] -replace '\[\[|\]\]', '' -replace '"', ''
                    $afflictions[$charName] = $cols[3]
                }
            }
        }
    }
}

# Load all PCs
$pcFiles = Get-ChildItem "$root\historian\characters\pcs" -Filter "*.md" -ErrorAction SilentlyContinue | Sort-Object Name

if (-not $pcFiles) {
    Write-Host "No PCs found in historian/characters/pcs" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== PARTY STATUS ===" -ForegroundColor Cyan

foreach ($file in $pcFiles) {
    $fm = Get-Frontmatter $file.FullName
    $name = $fm['name']
    $player = $fm['player']
    $class = $fm['class']
    $race = $fm['race']
    $level = $fm['level']
    $state = $fm['state']
    $desc = $fm['description']

    $stateColor = if ($state -eq 'active') { 'Green' } elseif ($state -eq 'dead') { 'Red' } else { 'Yellow' }

    Write-Host "`n  $name" -ForegroundColor White -NoNewline
    Write-Host " ($player)" -ForegroundColor Gray
    Write-Host ("    {0} {1}, Level {2}" -f $race, $class, $level) -ForegroundColor White
    Write-Host "    State: " -ForegroundColor Gray -NoNewline
    Write-Host $state -ForegroundColor $stateColor

    # Affliction lookup -- try by name and by known aliases
    $affliction = $null
    foreach ($key in $afflictions.Keys) {
        if ($key -ilike "*$name*" -or $name -ilike "*$key*") {
            $affliction = $afflictions[$key]
            break
        }
    }
    if ($affliction -and $affliction -notmatch '^Alive$') {
        Write-Host "    Status: $affliction" -ForegroundColor DarkYellow
    }

    if ($desc) { Write-Host "    $desc" -ForegroundColor DarkGray }
}

Write-Host ""
