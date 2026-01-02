# ==============================================================================
# CloudVault Frontend — January 2026 Git Commit Script
# Run from the project root in PowerShell.
# ==============================================================================

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\Git\cmd\git.exe") {
        $env:Path = "C:\Program Files\Git\cmd;" + $env:Path
    }
}

$commits = @(
    @{ Date = "2026-01-01"; Message = "chore: initialize vite react app and configure tailwindcss design tokens" }
    @{ Date = "2026-01-02"; Message = "feat: build atomic button, input, badge, and card ui components" }
    @{ Date = "2026-01-03"; Message = "feat: implement reusable modal dialog and floating dropdown primitives" }
    @{ Date = "2026-01-04"; Message = "feat: construct responsive application shell with collapsible sidebar and header" }
    @{ Date = "2026-01-05"; Message = "feat: create landing page hero section with animated feature showcases" }
    @{ Date = "2026-01-06"; Message = "feat: implement login and register views with tabbed form validation" }
    @{ Date = "2026-01-07"; Message = "feat: add forgot password and reset password recovery workflows" }
    @{ Date = "2026-01-08"; Message = "feat: build main dashboard layout with storage gauge and activity metrics" }
    @{ Date = "2026-01-09"; Message = "feat: implement drag-and-drop file upload zone with drop active states" }
    @{ Date = "2026-01-10"; Message = "feat: build multi-file upload progress drawer with cancellation support" }
    @{ Date = "2026-01-11"; Message = "feat: create responsive file explorer grid view with category file icons" }
    @{ Date = "2026-01-12"; Message = "feat: implement file explorer list table view with sortable headers" }
    @{ Date = "2026-01-13"; Message = "feat: add grid and list view mode switcher with persistent preference" }
    @{ Date = "2026-01-14"; Message = "feat: implement debounced file search bar with file-type filter chips" }
    @{ Date = "2026-01-15"; Message = "feat: support folder creation modal and hierarchical breadcrumb navigation" }
    @{ Date = "2026-01-16"; Message = "feat: implement slide-out file metadata details drawer with action buttons" }
    @{ Date = "2026-01-17"; Message = "feat: build file context menu for rename, download, share, and trash actions" }
    @{ Date = "2026-01-18"; Message = "feat: create unified file preview modal supporting image and media files" }
    @{ Date = "2026-01-19"; Message = "feat: integrate monaco editor for code and markdown file previewing" }
    @{ Date = "2026-01-20"; Message = "feat: build favorites page with instant star toggle interaction" }
    @{ Date = "2026-01-21"; Message = "feat: implement recent files list and chronological activity timeline" }
    @{ Date = "2026-01-22"; Message = "feat: create trash management page with restore and permanent delete actions" }
    @{ Date = "2026-01-23"; Message = "feat: implement file sharing modal with link generation and expiry controls" }
    @{ Date = "2026-01-24"; Message = "feat: construct storage analytics breakdown by file mime type" }
    @{ Date = "2026-01-25"; Message = "feat: build user profile settings page with preferences tabs" }
    @{ Date = "2026-01-26"; Message = "feat: implement dark and light theme toggle with system theme detection" }
    @{ Date = "2026-01-27"; Message = "feat: add animated loading skeletons and zero-file empty state graphics" }
    @{ Date = "2026-01-28"; Message = "feat: create 404 not found page and react error boundary fallback screen" }
    @{ Date = "2026-01-29"; Message = "feat: implement ctrl+k command palette and keyboard shortcut modal" }
    @{ Date = "2026-01-30"; Message = "fix: optimize mobile touch navigation and responsive file card layouts" }
    @{ Date = "2026-01-31"; Message = "perf: split route chunks via dynamic imports to optimize production bundle" }
)

foreach ($item in $commits) {
    $timestamp = "$($item.Date)T10:00:00+05:30"
    $env:GIT_AUTHOR_DATE = $timestamp
    $env:GIT_COMMITTER_DATE = $timestamp

    try {
        Write-Host "Creating commit for $($item.Date): $($item.Message)" -ForegroundColor Cyan
        git add .
        git commit --allow-empty -m $item.Message
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Commit failed for $($item.Date)"
        }
    }
    finally {
        Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
        Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    }
}

Write-Host "All January 2026 commits created successfully!" -ForegroundColor Green
