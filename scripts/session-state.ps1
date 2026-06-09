# session-state.ps1 Ã¢‚¬" dump current campaign/act/mission/session state
# Usage: .\scripts\session-state.ps1

$root = Resolve-Path "$PSScriptRoot\.."

function Get-Frontmatter($path) {
    $lines = Get-Content $path -Raw -Encoding UTF8
    if ($lines -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { return @{} }
    $block = $Matches[1]
    $fm = @{}
    foreach ($line in ($block -split "`n")) {
        $line = $line.TrimEnd("`r")
        if ($line -match '^(\w[\w_]*):\s*"?([^"#\r\n]*)"?\s*$') {
            $fm[$Matches[1].Trim()] = $Matches[2].Trim()
        }
    }
    return $fm
}

function Show-Entity($label, $fm, $path) {
    $relPath = $path.Replace($root.Path + "\", "")
    Write-Host "`n[$label]" -ForegroundColor Cyan
    Write-Host "  Name:  $($fm['name'])" -ForegroundColor White
    Write-Host "  State: $($fm['state']) | Exists: $($fm['exists'])" -ForegroundColor White
    if ($fm['description']) { Write-Host "  Desc:  $($fm['description'])" -ForegroundColor Gray }
    Write-Host "  File:  $relPath" -ForegroundColor DarkGray
}

# Campaign
$campaignFiles = Get-ChildItem "$root\scheduler\campaign" -Filter "*.md" -ErrorAction SilentlyContinue
if ($campaignFiles) {
    foreach ($f in $campaignFiles) {
        $fm = Get-Frontmatter $f.FullName
        if ($fm['state'] -eq 'active') { Show-Entity "CAMPAIGN" $fm $f.FullName }
    }
} else {
    Write-Host "`n[CAMPAIGN] none found" -ForegroundColor DarkGray
}

# Acts
$actFiles = Get-ChildItem "$root\scheduler\acts" -Filter "*.md" -ErrorAction SilentlyContinue
if ($actFiles) {
    foreach ($f in ($actFiles | Sort-Object Name)) {
        $fm = Get-Frontmatter $f.FullName
        Show-Entity "ACT" $fm $f.FullName
    }
} else {
    Write-Host "`n[ACT] none in scheduler" -ForegroundColor DarkGray
}

# Missions
$missionFiles = Get-ChildItem "$root\scheduler\missions" -Filter "*.md" -ErrorAction SilentlyContinue
if ($missionFiles) {
    foreach ($f in ($missionFiles | Sort-Object Name)) {
        $fm = Get-Frontmatter $f.FullName
        Show-Entity "MISSION" $fm $f.FullName
    }
} else {
    Write-Host "`n[MISSIONS] none in scheduler" -ForegroundColor DarkGray
}

# Planned sessions
$sessionFiles = Get-ChildItem "$root\scheduler\sessions" -Filter "*.md" -ErrorAction SilentlyContinue
if ($sessionFiles) {
    foreach ($f in ($sessionFiles | Sort-Object Name)) {
        $fm = Get-Frontmatter $f.FullName
        Show-Entity "SESSION (planned)" $fm $f.FullName
    }
} else {
    Write-Host "`n[SESSIONS] none planned in scheduler" -ForegroundColor DarkGray
}

# Most recent historian session
$histSessions = Get-ChildItem "$root\historian\sessions" -Filter "*.md" -ErrorAction SilentlyContinue | Sort-Object Name -Descending
if ($histSessions) {
    $last = $histSessions | Select-Object -First 1
    $fm = Get-Frontmatter $last.FullName
    Show-Entity "LAST PLAYED SESSION" $fm $last.FullName
}

# Quick party summary from campaign file
$campaignFile = $campaignFiles | Select-Object -First 1
if ($campaignFile) {
    $content = Get-Content $campaignFile.FullName -Raw -Encoding UTF8
    if ($content -match '## Party\r?\n([\s\S]+?)(\r?\n##|\z)') {
        Write-Host "`n[PARTY]" -ForegroundColor Cyan
        $partyBlock = $Matches[1].Trim()
        foreach ($line in ($partyBlock -split "`n")) {
            $line = $line.TrimEnd("`r")
            if ($line -match '^\|' -and $line -notmatch '^\|---') {
                $cols = $line -split '\|' | Where-Object { $_ -ne '' } | ForEach-Object { $_.Trim() }
                if ($cols[0] -ne 'Player') {
                    Write-Host ("  {0}: {1} ({2}) - {3}" -f $cols[0], $cols[1], $cols[2], $cols[3]) -ForegroundColor White
                }
            }
        }
    }
}

Write-Host ""

