param(
    [string]$RepoName = "react-ui-learning",
    [ValidateSet("private","public")]
    [string]$Visibility = "private"
)

# Move to project root (script directory assumed to be scripts/)
Set-Location -Path (Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) ".."))

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git not found in PATH. Install Git and retry."
    exit 1
}

Write-Host "Project root: $(Get-Location)"

if (-not (Test-Path .gitignore)) {
    Write-Warning "No .gitignore found at project root. It's recommended to add one before pushing."
}

# Initialize git repo if missing
if (-not (Test-Path .git)) {
    git init
    Write-Host "Initialized local git repository."
} else {
    Write-Host "Local git repository already exists."
}

# Stage everything and commit if there are changes
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "chore: initial commit"
    Write-Host "Created initial commit."
} else {
    Write-Host "No changes to commit."
}

# Ensure branch is main
git branch -M main

# Try using gh CLI to create repo and push
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "gh CLI found. Checking auth..."
    gh auth status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "gh authenticated. Creating repo '$RepoName' ($Visibility) and pushing..."
        gh repo create $RepoName --$Visibility --source=. --remote=origin --push
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Repository created and pushed via gh. Done."
            exit 0
        } else {
            Write-Warning "gh repo create failed. You may need to create the repo manually on github.com."
        }
    } else {
        Write-Warning "gh CLI is installed but not authenticated. Run 'gh auth login' and retry, or create the remote manually."
    }
} else {
    Write-Host "gh CLI not found. You can create the repo on github.com and then add a remote and push."
}

Write-Host "If no remote was pushed, run these commands to add a remote and push:"
Write-Host "  git remote add origin https://github.com/USERNAME/$RepoName.git"
Write-Host "  git push -u origin main"

Write-Host "Or using SSH (if configured):"
Write-Host "  git remote add origin git@github.com:USERNAME/$RepoName.git"
Write-Host "  git push -u origin main"

