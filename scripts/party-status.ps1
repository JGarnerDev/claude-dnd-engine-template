# party-status.ps1 -- show all PCs from historian + afflictions from campaign file
# consumers: CLAUDE.md, .claude/commands/session.md, meta/difficulty.md, tests/commands/session/spec.md -- update these if usage, flags, or output format change.
# Usage: .\scripts\party-status.ps1

$root = Resolve-Path "$PSScriptRoot\.."

. "$PSScriptRoot\lib\common.ps1"

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

# Latest played session number -- staleness baseline for level_confirmed
$latestSession = 0
$sessionFiles = Get-ChildItem "$root\historian\sessions" -Filter "*.md" -ErrorAction SilentlyContinue
foreach ($sf in $sessionFiles) {
    $sfm = Get-Frontmatter $sf.FullName
    $n = 0
    if ([int]::TryParse($sfm['session_number'], [ref]$n) -and $n -gt $latestSession) { $latestSession = $n }
}

# Load all PCs
$pcFiles = Get-ChildItem "$root\historian\characters\pcs" -Filter "*.md" -ErrorAction SilentlyContinue | Sort-Object Name

if (-not $pcFiles) {
    Write-Host "No PCs found in historian/characters/pcs" -ForegroundColor Red
    exit 1
}

# Spotlight rotation tally (windowed) -- shared logic in common.ps1.
$rotWindow = 4
$focusDoc = Join-Path $root "meta\character-focus.md"
if (Test-Path $focusDoc) {
    $ffm = Get-Frontmatter $focusDoc
    if ($ffm['rotation_window_sessions']) { $rotWindow = [int]$ffm['rotation_window_sessions'] }
}
$activeNames = @($pcFiles | ForEach-Object { (Get-Frontmatter $_.FullName)['name'] })
$spotSessions = Get-PlayedSpotlightSessions $root
$rotation = Get-SpotlightRotation $spotSessions $rotWindow $activeNames
$rotShown = $spotSessions.Count -ge $rotWindow   # only meaningful once the window can fill

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

    # Level staleness -- level_confirmed must match the latest played session
    if ($state -eq 'active' -and $latestSession -gt 0) {
        $confirmed = 0
        if (-not [int]::TryParse($fm['level_confirmed'], [ref]$confirmed)) {
            Write-Host "    LEVEL STALE: no level_confirmed stamp (latest session: $latestSession)" -ForegroundColor Red
        } elseif ($confirmed -lt $latestSession) {
            Write-Host "    LEVEL STALE: confirmed at session $confirmed, latest is $latestSession" -ForegroundColor Red
        }
    }
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

    # Spotlight: appetite + windowed rotation turns (meta/character-focus.md)
    $appetite = if ($fm['spotlight']) { $fm['spotlight'].Trim() } else { 'normal' }
    if ($appetite -eq 'low') {
        Write-Host "    Spotlight: low appetite (excluded from rotation)" -ForegroundColor DarkGray
    } elseif ($rotShown) {
        $t = if ($rotation.Turns.ContainsKey($name)) { $rotation.Turns[$name] } else { 0.0 }
        $seen = $rotation.Present.ContainsKey($name)
        $note = if (-not $seen) { " (absent this window)" } else { "" }
        Write-Host ("    Spotlight: {0} rotation turns over last {1} sessions{2}" -f $t, $rotWindow, $note) -ForegroundColor DarkCyan
    }

    if ($desc) { Write-Host "    $desc" -ForegroundColor DarkGray }
}

Write-Host ""
