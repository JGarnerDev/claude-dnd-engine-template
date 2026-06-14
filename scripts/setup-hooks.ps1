# consumers: README.md
# One-time per clone. Points git at .githooks/ and ensures the Markdown formatter
# binary is installed. Safe to re-run.

git config core.hooksPath .githooks
Write-Host "core.hooksPath -> .githooks (pre-commit Markdown formatting enabled)"

if (Get-Command markdownlint-cli2 -ErrorAction SilentlyContinue) {
    Write-Host "markdownlint-cli2 already installed."
} else {
    Write-Host "Installing markdownlint-cli2@0.13.0 globally (node 18 pin)..."
    npm install -g markdownlint-cli2@0.13.0
}
