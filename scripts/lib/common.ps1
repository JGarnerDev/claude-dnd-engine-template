# common.ps1 -- shared helpers dot-sourced by the scripts in scripts/.
# consumers: scripts/entity-graph.ps1, scripts/free-entities.ps1, scripts/location-entities.ps1,
#   scripts/party-status.ps1, scripts/route-cities.ps1, scripts/session-brief.ps1,
#   scripts/session-state.ps1, scripts/todo-brief.ps1, scripts/inventory-brief.ps1,
#   scripts/threads-brief.ps1
# -- update those scripts if a function signature or output shape changes here.

# Parse YAML-ish frontmatter into a hashtable.
# Scalars: $fm['key']. Wikilink scalars are unwrapped and alias-stripped ([[Name|alias]] -> Name).
# List items (plain or wikilink) accumulate under $fm['_list_<key>'].
function Get-Frontmatter($path) {
    $lines = Get-Content $path -Raw -Encoding UTF8
    if ($lines -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { return @{} }
    $block = $Matches[1]
    $fm = @{}
    $currentKey = $null
    foreach ($line in ($block -split "`n")) {
        $line = $line.TrimEnd("`r")
        if ($line -match '^(\w[\w_]*):\s*\[\[([^\]]+)\]\]') {
            $currentKey = $Matches[1].Trim()
            $fm[$currentKey] = ($Matches[2] -split '\|')[0].Trim()
        } elseif ($line -match '^(\w[\w_]*):\s*"?([^"#\r\n]*)"?\s*$') {
            $currentKey = $Matches[1].Trim()
            $fm[$currentKey] = $Matches[2].Trim()
        } elseif ($line -match '^\s+-\s+\[\[([^\]]+)\]\]') {
            if ($currentKey) {
                if (-not $fm.ContainsKey("_list_$currentKey")) { $fm["_list_$currentKey"] = @() }
                $fm["_list_$currentKey"] += ($Matches[1] -split '\|')[0].Trim()
            }
        } elseif ($line -match '^\s+-\s+"?([^"#\r\n]+)"?\s*$') {
            if ($currentKey) {
                if (-not $fm.ContainsKey("_list_$currentKey")) { $fm["_list_$currentKey"] = @() }
                $fm["_list_$currentKey"] += $Matches[1].Trim()
            }
        }
    }
    return $fm
}
