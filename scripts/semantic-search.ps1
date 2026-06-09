# semantic-search.ps1 -- Semantic similarity search over indexed entities
# Requires index built first: python scripts/index-entities.py
# Usage: .\scripts\semantic-search.ps1 -Query "betrayal and political intrigue" [-Type character] [-Subtype npc] [-Exists true] [-Source historian] [-K 8]

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,

    [string]$Type    = "",
    [string]$Subtype = "",

    [ValidateSet("true", "false", "")]
    [string]$Exists  = "",

    [ValidateSet("data", "historian", "scheduler", "")]
    [string]$Source  = "",

    [int]$K = 8
)

$root   = Resolve-Path "$PSScriptRoot\.."
$script = "$root\scripts\semantic-search.py"

$pyArgs = @($script, $Query, "-k", $K)
if ($Type)    { $pyArgs += @("--type",    $Type)    }
if ($Subtype) { $pyArgs += @("--subtype", $Subtype) }
if ($Exists)  { $pyArgs += @("--exists",  $Exists)  }
if ($Source)  { $pyArgs += @("--source",  $Source)  }

py -3.10 @pyArgs
