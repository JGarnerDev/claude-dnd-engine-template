# session-brief.ps1 -- pre-session planning dashboard
# consumers: CLAUDE.md, .claude/commands/recap.md, .claude/commands/session.md, meta/difficulty.md, tests/commands/session/spec.md -- update these if usage, flags, or output format change.
# Replaces ~8 manual Read calls at the start of every /session invocation
# Usage: .\scripts\session-brief.ps1

$root = Resolve-Path "$PSScriptRoot\.."

. "$PSScriptRoot\lib\common.ps1"

function Get-FullContent($path) { Get-Content $path -Raw -Encoding UTF8 }

# -- Next session number ------------------------------------------------------
$histSessions = Get-ChildItem "$root\historian\sessions" -Filter "*.md" -ErrorAction SilentlyContinue
$schedSessions = Get-ChildItem "$root\scheduler\sessions" -Filter "*.md" -ErrorAction SilentlyContinue
$allSessions = @($histSessions) + @($schedSessions) | Where-Object { $_ -ne $null }

$maxNum = 0
$latestPlayed = 0   # historian sessions only -- staleness baseline
foreach ($s in $allSessions) {
    $fm = Get-Frontmatter $s.FullName
    $n = [int]($fm['session_number'] -replace '[^0-9]', '')
    if ($n -gt $maxNum) { $maxNum = $n }
    if ($n -gt $latestPlayed -and $histSessions -and $histSessions.FullName -contains $s.FullName) { $latestPlayed = $n }
}
$nextNum = $maxNum + 1

Write-Host "`n========================================" -ForegroundColor DarkGray
Write-Host "  SESSION BRIEF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor DarkGray

Write-Host "`nNext session: #$nextNum" -ForegroundColor Yellow
if ($nextNum % 5 -eq 0) {
    Write-Host "  MILESTONE: session #$nextNum - worth marking at the table." -ForegroundColor Magenta
}

# -- Uncanonized sessions: planned date passed, no historian record ------------
$today = (Get-Date).Date
$histNums = @{}
foreach ($s in $histSessions) {
    $fm = Get-Frontmatter $s.FullName
    if ($fm['session_number']) { $histNums[[string]$fm['session_number']] = $true }
}
$uncanonized = @()
foreach ($s in $schedSessions) {
    $fm = Get-Frontmatter $s.FullName
    if (@('draft', 'planned') -notcontains $fm['state']) { continue }
    if (-not $fm['planned_date'] -or $fm['planned_date'] -eq 'null') { continue }
    $pd = [datetime]::MinValue
    if (-not [datetime]::TryParse([string]$fm['planned_date'], [ref]$pd)) { continue }
    if ($pd.Date -lt $today -and -not $histNums.ContainsKey([string]$fm['session_number'])) {
        $uncanonized += "  ! #$($fm['session_number']) '$($fm['name'])' planned $($fm['planned_date']) - played but not canonized? Run /recap."
    }
}
$inbox = Get-ChildItem "$root\recaps\inbox" -Filter "*.md" -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne '.gitkeep' }
foreach ($f in $inbox) {
    $uncanonized += "  ! Notes waiting in recaps/inbox/$($f.Name) - run /recap to canonize."
}
if ($uncanonized.Count) {
    Write-Host "`n--- UNCANONIZED SESSIONS ---" -ForegroundColor Red
    $uncanonized | ForEach-Object { Write-Host $_ -ForegroundColor Red }
}

# -- Campaign / Act / Mission -------------------------------------------------
Write-Host "`n--- STORY STATE ---" -ForegroundColor DarkGray

$campaignFiles = Get-ChildItem "$root\scheduler\campaign" -Filter "*.md" -ErrorAction SilentlyContinue
foreach ($f in $campaignFiles) {
    $fm = Get-Frontmatter $f.FullName
    Write-Host ("  Campaign: {0} [{1}]" -f $fm['name'], $fm['state']) -ForegroundColor White
    if ($fm['current_act']) { Write-Host "  Current act note: $($fm['current_act'])" -ForegroundColor DarkGray }
}

$actFiles = Get-ChildItem "$root\scheduler\acts" -Filter "*.md" -ErrorAction SilentlyContinue | Sort-Object Name
foreach ($f in $actFiles) {
    $fm = Get-Frontmatter $f.FullName
    Write-Host ("  Act: {0} [{1}]" -f $fm['name'], $fm['state']) -ForegroundColor White
}

$missionFiles = Get-ChildItem "$root\scheduler\missions" -Filter "*.md" -ErrorAction SilentlyContinue | Sort-Object Name
if ($missionFiles) {
    foreach ($f in $missionFiles) {
        $fm = Get-Frontmatter $f.FullName
        Write-Host ("  Mission: {0} [{1}]" -f $fm['name'], $fm['state']) -ForegroundColor White
    }
} else {
    Write-Host "  Missions: none active" -ForegroundColor DarkGray
}

# -- Last played session ------------------------------------------------------
Write-Host "`n--- LAST SESSION ---" -ForegroundColor DarkGray

$lastSession = $histSessions | Sort-Object Name -Descending | Select-Object -First 1
if ($lastSession) {
    $fm = Get-Frontmatter $lastSession.FullName
    Write-Host ("  #{0}: {1}" -f $fm['session_number'], $fm['name']) -ForegroundColor White
    if ($fm['description']) { Write-Host "  Summary: $($fm['description'])" -ForegroundColor Gray }

    # Pull cliffhanger and played_date from HISTORIAN block
    $body = Get-FullContent $lastSession.FullName
    if ($body -match 'cliffhanger:\s*"([^"]+)"') {
        Write-Host "  Cliffhanger: $($Matches[1])" -ForegroundColor DarkYellow
    }
    if ($body -match 'played_date:\s*"?([^"\r\n]+)"?') {
        Write-Host "  Played: $($Matches[1])" -ForegroundColor DarkGray
    }
}

# -- Rest clock ----------------------------------------------------------------
Write-Host "`n--- REST CLOCK ---" -ForegroundColor DarkGray

$activeCampaign = $null
foreach ($f in $campaignFiles) {
    $fm = Get-Frontmatter $f.FullName
    if ($fm['state'] -eq 'active') { $activeCampaign = $f; break }
}
if (-not $activeCampaign) { $activeCampaign = $campaignFiles | Select-Object -First 1 }

if ($activeCampaign) {
    $content = Get-FullContent $activeCampaign.FullName
    if ($content -match '### Rest Clock \(as of:? Session (\d+)\)\r?\n([\s\S]+?)(\r?\n##|\r?\n###|\z)') {
        $clockSession = [int]$Matches[1]
        $clockBlock = $Matches[2]
        foreach ($line in ($clockBlock -split "`n")) {
            $line = $line.TrimEnd("`r")
            if ($line -match '^- (.+)$') { Write-Host "  $($Matches[1])" -ForegroundColor White }
        }
        # Long-rest availability: derive from the 24h time gate (meta/difficulty.md -> Long Rest Rules).
        # Only the time condition is computable here; safe location + no PC at 0 HP stay DM judgment.
        if ($clockBlock -match '(?im)^\s*-\s*Hours since last long rest:\s*~?\s*(\d+(?:\.\d+)?)') {
            $hrs = [double]$Matches[1]
            if ($hrs -ge 24) {
                Write-Host "  > Long rest TIME GATE met ($hrs h >= 24) - offerable if location is safe and no PC at 0 HP." -ForegroundColor Green
            } else {
                Write-Host ("  ! Long rest NOT available: only {0} h since last (needs 24) - {1} h more in-world before a fresh reset." -f $hrs, (24 - $hrs)) -ForegroundColor Red
            }
        } else {
            Write-Host "  ! Long rest availability UNKNOWN - 'Hours since last long rest' not numeric; reconstruct with DM." -ForegroundColor Yellow
        }
        if ($clockSession -lt $latestPlayed) {
            Write-Host "  ! REST CLOCK STALE: as of Session $clockSession, latest played is $latestPlayed - reconstruct with DM before encounter planning." -ForegroundColor Red
        }
    } elseif ($content -match '### Rest Clock') {
        Write-Host "  ! REST CLOCK NOT INITIALIZED - reconstruct with DM before encounter planning." -ForegroundColor Red
    } else {
        Write-Host "  ! No Rest Clock section in campaign Current State - add one (see meta/difficulty.md)." -ForegroundColor Red
    }

    # Current State header carries the same stamp pattern as the Rest Clock
    if ($content -match '## Current State \(after Session (\d+)\)') {
        if ([int]$Matches[1] -lt $latestPlayed) {
            Write-Host "  ! CURRENT STATE STALE: header says Session $($Matches[1]), latest played is $latestPlayed - update and restamp at next /recap." -ForegroundColor Red
        }
    } elseif ($content -match '## Current State') {
        Write-Host "  ! Current State header has no '(after Session N)' stamp - restamp at next /recap." -ForegroundColor Yellow
    }
}

# -- Party --------------------------------------------------------------------
Write-Host "`n--- PARTY ---" -ForegroundColor DarkGray

# Load afflictions from the active campaign's party table
$afflictions = @{}
$campaignFile = $activeCampaign
if ($campaignFile) {
    $content = Get-FullContent $campaignFile.FullName
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

$pcFiles = Get-ChildItem "$root\historian\characters\pcs" -Filter "*.md" -ErrorAction SilentlyContinue | Sort-Object Name
foreach ($file in $pcFiles) {
    $fm = Get-Frontmatter $file.FullName
    $name = $fm['name']
    $affliction = $null
    foreach ($key in $afflictions.Keys) {
        if ($key -ilike "*$name*" -or $name -ilike "*$key*") {
            $affliction = $afflictions[$key]
            break
        }
    }
    $suffix = if ($affliction -and $affliction -notmatch '^Alive$') { " ! $affliction" } else { "" }
    Write-Host ("  {0} ({1}) - {2} {3} L{4}{5}" -f $name, $fm['player'], $fm['race'], $fm['class'], $fm['level'], $suffix) -ForegroundColor White
}

# -- Design preference drought (literary devices excluded: homebrew-era tools) --
$prefFile = "$root\meta\campaign-design-preferences.md"
if (Test-Path $prefFile) {
    $raw = Get-Content $prefFile -Raw -Encoding UTF8
    $total    = ([regex]::Matches($raw, '(?m)^\s*-\s*\*Deployed:')).Count
    $deployed = ([regex]::Matches($raw, '(?m)^\s*-\s*\*Deployed:[^\r\n]*\[\[')).Count
    $seeded   = ([regex]::Matches($raw, '(?m)^\s*-\s*\*Seeded:')).Count
    if ($total - $deployed -gt 0) {
        Write-Host "`n--- PREFERENCES ---" -ForegroundColor DarkGray
        Write-Host "  $($total - $deployed) of $total group wishlist items not yet deployed; $seeded seeded ($latestPlayed sessions played)" -ForegroundColor White
    }
}

Write-Host "`n========================================`n" -ForegroundColor DarkGray
