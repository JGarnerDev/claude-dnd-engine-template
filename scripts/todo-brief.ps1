# todo-brief.ps1 -- DM action-item dashboard. Backbone of the /todo command.
# consumers: CLAUDE.md, .claude/commands/todo.md -- update these if usage, flags, or output format change.
# Collects every mechanical "needs attention" signal in one call:
#   uncanonized sessions, recap inbox, index staleness, unchecked todo.md items,
#   questionnaire fill states, draft files, undeployed design preferences.
# Output is raw signals; /todo translates them to plain DM language.
# Usage: .\scripts\todo-brief.ps1

$root = Resolve-Path "$PSScriptRoot\.."

. "$PSScriptRoot\lib\common.ps1"

# Emoji via codepoints — literal emoji in this file break under PS 5.1's ANSI read of BOM-less .ps1
$d20     = [char]::ConvertFromUtf32(0x1F3B2)   # 🎲
$dragon  = [char]::ConvertFromUtf32(0x1F409)   # 🐉
$scroll  = [char]::ConvertFromUtf32(0x1F4DC)   # 📜
$crown   = [char]::ConvertFromUtf32(0x1F451)   # 👑
$horns   = [char]::ConvertFromUtf32(0x1F918)   # 🤘
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

# DM name comes from the active campaign's frontmatter (dm: field)
$dmName = $null
foreach ($c in (Get-ChildItem "$root\scheduler\campaign" -Filter "*.md" -ErrorAction SilentlyContinue)) {
    $cfm = Get-Frontmatter $c.FullName
    if ($cfm['state'] -eq 'active' -and $cfm['dm']) { $dmName = $cfm['dm']; break }
}

Write-Host "`n========================================" -ForegroundColor DarkGray
Write-Host "  $d20 DM TODO BRIEF $dragon" -ForegroundColor Cyan
Write-Host "  $scroll quests, debts, and loose ends" -ForegroundColor DarkCyan
if ($dmName) { Write-Host "  DM: $dmName" -ForegroundColor DarkCyan }
Write-Host "========================================" -ForegroundColor DarkGray

# -- 1. Uncanonized sessions + recap inbox -------------------------------------
$histSessions  = Get-ChildItem "$root\historian\sessions" -Filter "*.md" -ErrorAction SilentlyContinue
$schedSessions = Get-ChildItem "$root\scheduler\sessions" -Filter "*.md" -ErrorAction SilentlyContinue
$today = (Get-Date).Date

$histNums = @{}
foreach ($s in $histSessions) {
    $fm = Get-Frontmatter $s.FullName
    if ($fm['session_number']) { $histNums[[string]$fm['session_number']] = $true }
}

Write-Host "`n--- SESSIONS ---" -ForegroundColor DarkGray
$sessionFlags = 0
foreach ($s in $schedSessions) {
    $fm = Get-Frontmatter $s.FullName
    if (@('draft', 'planned') -notcontains $fm['state']) { continue }
    $pd = [datetime]::MinValue
    $hasDate = $fm['planned_date'] -and $fm['planned_date'] -ne 'null' -and [datetime]::TryParse([string]$fm['planned_date'], [ref]$pd)
    if ($hasDate -and $pd.Date -lt $today -and -not $histNums.ContainsKey([string]$fm['session_number'])) {
        Write-Host "  UNCANONIZED: #$($fm['session_number']) '$($fm['name'])' planned $($fm['planned_date'])" -ForegroundColor Red
    } else {
        Write-Host "  Pending plan: #$($fm['session_number']) '$($fm['name'])' [$($fm['state'])]$(if ($hasDate) { " for $($fm['planned_date'])" })" -ForegroundColor Yellow
    }
    $sessionFlags++
}
$inbox = Get-ChildItem "$root\recaps\inbox" -Filter "*.md" -ErrorAction SilentlyContinue
foreach ($f in $inbox) {
    Write-Host "  INBOX NOTES: recaps/inbox/$($f.Name) awaiting /recap" -ForegroundColor Red
    $sessionFlags++
}

# No plan drafted for the next game night (Tuesdays, per campaign Rules Decisions)
$futurePlans = 0
foreach ($s in $schedSessions) {
    $fm = Get-Frontmatter $s.FullName
    if (@('draft', 'planned') -notcontains $fm['state']) { continue }
    $pd = [datetime]::MinValue
    $hasDate = $fm['planned_date'] -and $fm['planned_date'] -ne 'null' -and [datetime]::TryParse([string]$fm['planned_date'], [ref]$pd)
    if (-not $hasDate -or $pd.Date -ge $today) { $futurePlans++ }
}
if (-not $futurePlans) {
    $daysUntil = ([int][DayOfWeek]::Tuesday - [int]$today.DayOfWeek + 7) % 7
    $nextGame = $today.AddDays($daysUntil).ToString('yyyy-MM-dd')
    $when = if ($daysUntil -eq 0) { "TONIGHT ($nextGame)" } else { "Tuesday $nextGame ($daysUntil day(s) away)" }
    Write-Host "  NO PLAN: next game is $when - nothing drafted. Run /session." -ForegroundColor Red
    $sessionFlags++
}
if (-not $sessionFlags) { Write-Host "  (clean)" -ForegroundColor DarkGray }

# -- 1b. Open threads (states that mean unfinished business) --------------------
Write-Host "`n--- OPEN THREADS ---" -ForegroundColor DarkGray
$threadHits = Get-ChildItem "$root\historian" -Recurse -Filter "*.md" -ErrorAction SilentlyContinue |
    Select-String -Pattern '^state:\s*(missing|imprisoned|transformed|stranded|captured)\s*$'
if ($threadHits) {
    foreach ($h in $threadHits) {
        $base = [IO.Path]::GetFileNameWithoutExtension($h.Filename)
        Write-Host "  $base [$($h.Matches[0].Groups[1].Value)]" -ForegroundColor White
    }
    Write-Host "  ($(@($threadHits).Count) total - run /threads for the full picture)" -ForegroundColor DarkGray
} else {
    Write-Host "  (none)" -ForegroundColor DarkGray
}

# -- 1b2. Party state staleness (level stamps + rest clock) ----------------------
Write-Host "`n--- PARTY STATE ---" -ForegroundColor DarkGray
$latestPlayed = 0
foreach ($k in $histNums.Keys) {
    $n = 0
    if ([int]::TryParse($k, [ref]$n) -and $n -gt $latestPlayed) { $latestPlayed = $n }
}
$partyFlags = 0
if ($latestPlayed -gt 0) {
    foreach ($pc in (Get-ChildItem "$root\historian\characters\pcs" -Filter "*.md" -ErrorAction SilentlyContinue)) {
        $fm = Get-Frontmatter $pc.FullName
        if ($fm['state'] -ne 'active') { continue }
        $confirmed = 0
        if (-not [int]::TryParse($fm['level_confirmed'], [ref]$confirmed)) {
            Write-Host "  LEVEL STALE: $($fm['name']) has no level_confirmed stamp (latest session: $latestPlayed)" -ForegroundColor Red
            $partyFlags++
        } elseif ($confirmed -lt $latestPlayed) {
            Write-Host "  LEVEL STALE: $($fm['name']) confirmed at session $confirmed, latest is $latestPlayed" -ForegroundColor Red
            $partyFlags++
        }
    }
}
$activeCampaign = $null
foreach ($c in (Get-ChildItem "$root\scheduler\campaign" -Filter "*.md" -ErrorAction SilentlyContinue)) {
    $cfm = Get-Frontmatter $c.FullName
    if ($cfm['state'] -eq 'active') { $activeCampaign = $c; break }
}
if ($activeCampaign) {
    $cRaw = Get-Content $activeCampaign.FullName -Raw -Encoding UTF8
    if ($cRaw -match '### Rest Clock \(as of:? Session (\d+)\)') {
        if ([int]$Matches[1] -lt $latestPlayed) {
            Write-Host "  REST CLOCK STALE: as of Session $($Matches[1]), latest played is $latestPlayed - reconstruct at next /session or /recap" -ForegroundColor Red
            $partyFlags++
        }
    } elseif ($cRaw -match '### Rest Clock') {
        Write-Host "  REST CLOCK NOT INITIALIZED - reconstruct at next /session or /recap" -ForegroundColor Red
        $partyFlags++
    } else {
        Write-Host "  No Rest Clock section in campaign Current State (see meta/difficulty.md)" -ForegroundColor Yellow
        $partyFlags++
    }
}
if (-not $partyFlags) { Write-Host "  (clean)" -ForegroundColor DarkGray }

# -- 1c. Graph health ------------------------------------------------------------
Write-Host "`n--- GRAPH HEALTH ---" -ForegroundColor DarkGray
# *>&1 captures Write-Host (information stream) -- plain 2>&1 lets it leak to the console
$vOut = & "$PSScriptRoot\validate.ps1" -Quiet *>&1
$vLine = $vOut | Where-Object { $_ -match 'Errors:\s*(\d+)' } | Select-Object -Last 1
if ($vLine -match 'Errors:\s*(\d+)') {
    $errCount = [int]$Matches[1]
    if ($errCount) {
        Write-Host "  $errCount broken cross-reference(s) or missing field(s) - run validate.ps1 for detail" -ForegroundColor Yellow
        Write-Host "  (placeholder world names under construction are expected here)" -ForegroundColor DarkGray
    } else {
        Write-Host "  Clean" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  (validate.ps1 did not report - run it manually)" -ForegroundColor Yellow
}

# -- 2. Semantic index staleness ------------------------------------------------
Write-Host "`n--- INDEX ---" -ForegroundColor DarkGray
$stamp = "$root\vector-index\.index-built"
if (Test-Path $stamp) {
    $lines = Get-Content $stamp
    $sha = $lines[1]
    $commits = @(git -C $root log --oneline "$sha..HEAD" -- data/ historian/ scheduler/ 2>$null)
    if ($commits.Count) {
        Write-Host "  Stale: $($commits.Count) entity-dir commit(s) since last build ($($sha.Substring(0,7)))" -ForegroundColor Yellow
        Write-Host "  (commits touching only CLAUDE.md/README do not stale the index)" -ForegroundColor DarkGray
    } else {
        Write-Host "  Fresh (built $($lines[0].Substring(0,10)))" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  Never built - run: py -3.10 scripts\index-entities.py" -ForegroundColor Red
}

# -- 3. Unchecked todo items (todo.md + topic files like todo-worldmap.md) -------
# todo-dashboard.md is /todo output, not a source -- always excluded.
Write-Host "`n--- TODO FILES (unchecked) ---" -ForegroundColor DarkGray
$todoFiles = Get-ChildItem "$root" -Filter "todo*.md" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "todo-dashboard.md" }
if ($todoFiles) {
    foreach ($todoFile in $todoFiles) {
        Write-Host "  == $($todoFile.Name) ==" -ForegroundColor DarkGray
        $section = ""
        foreach ($line in (Get-Content $todoFile.FullName -Encoding UTF8)) {
            if ($line -match '^##\s+(.*)') { $section = $Matches[1].Trim(); continue }
            if ($line -match '^\s*-\s+\[ \]\s+(.*)') {
                $item = $Matches[1].Trim()
                if ($item.Length -gt 110) { $item = $item.Substring(0, 107) + "..." }
                Write-Host "  [$section] $item" -ForegroundColor White
            }
        }
    }
} else {
    Write-Host "  (no todo files found)" -ForegroundColor DarkGray
}

# -- 4. Questionnaires ------------------------------------------------------------
Write-Host "`n--- QUESTIONNAIRES ---" -ForegroundColor DarkGray
$qFiles = Get-ChildItem "$root\questionnaires" -Filter "*.md" -File -ErrorAction SilentlyContinue
if ($qFiles) {
    foreach ($q in $qFiles) {
        $raw = Get-Content $q.FullName -Raw -Encoding UTF8
        $player = if ($raw -match '(?m)^player:\s*(.+)$') { $Matches[1].Trim() } else { "?" }
        if ($raw -match '(?m)^filled:\s*true') {
            Write-Host "  READY TO INGEST: $($q.Name) (player: $player)" -ForegroundColor Yellow
        } else {
            Write-Host "  Waiting on player: $($q.Name) (player: $player)" -ForegroundColor White
        }
    }
} else {
    Write-Host "  (none outstanding)" -ForegroundColor DarkGray
}

# -- 5. Draft files ---------------------------------------------------------------
Write-Host "`n--- DRAFTS ---" -ForegroundColor DarkGray
$draftCount = 0
foreach ($dir in @("$root\data\lore", "$root\scheduler\acts", "$root\scheduler\missions")) {
    $files = Get-ChildItem $dir -Filter "*.md" -ErrorAction SilentlyContinue
    foreach ($f in $files) {
        $fm = Get-Frontmatter $f.FullName
        if ($fm['state'] -eq 'draft') {
            $rel = $f.FullName.Replace("$root\", "")
            Write-Host "  $rel - $($fm['description'])" -ForegroundColor White
            $draftCount++
        }
    }
}
if (-not $draftCount) { Write-Host "  (none)" -ForegroundColor DarkGray }

# -- 6. Design preferences not yet used ---------------------------------------------
Write-Host "`n--- DESIGN PREFERENCES ---" -ForegroundColor DarkGray
$prefFile = "$root\meta\campaign-design-preferences.md"
if (Test-Path $prefFile) {
    $raw = Get-Content $prefFile -Raw -Encoding UTF8
    # Deployed lines hold either an em-dash (unused) or a [[session wikilink]] (used).
    # Match on the wikilink's absence: a literal em-dash here breaks under PS 5.1's
    # ANSI read of BOM-less .ps1 files.
    $total    = ([regex]::Matches($raw, '(?m)^\s*-\s*\*Deployed:')).Count
    $deployed = ([regex]::Matches($raw, '(?m)^\s*-\s*\*Deployed:[^\r\n]*\[\[')).Count
    $undeployed = $total - $deployed
    $seeded   = ([regex]::Matches($raw, '(?m)^\s*-\s*\*Seeded:')).Count
    Write-Host "  $undeployed of $total items not yet deployed; $seeded seeded" -ForegroundColor White
    # Aging check fires every 5th played session (act transitions are too rare a trigger)
    $latestPlayed = 0
    foreach ($k in $histNums.Keys) {
        $n = 0
        if ([int]::TryParse($k, [ref]$n) -and $n -gt $latestPlayed) { $latestPlayed = $n }
    }
    if ($latestPlayed -gt 0 -and $latestPlayed % 5 -eq 0 -and $undeployed -gt 0) {
        Write-Host "  AGING CHECK DUE: session $latestPlayed milestone - review undeployed items; seed or retire what's stalling" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor DarkGray
Write-Host "  $horns $crown All hail the DM $crown $horns" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor DarkGray
