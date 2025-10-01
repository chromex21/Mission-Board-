<#
Create and push an annotated backup tag for the current branch.
Usage: .\scripts\tag-backup.ps1 -TagName "backup/main-YYYYMMDD"
If no TagName is provided, defaults to backup/main-<timestamp>.
#>

param(
  [string]$TagName = $("backup/main-" + (Get-Date -Format yyyyMMdd_HHmmss))
)

Write-Host "Creating annotated tag: $TagName"
git tag -a $TagName -m "Backup before history rewrite: $TagName"
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create tag"; exit 1 }

Write-Host "Pushing tag to origin..."
git push origin $TagName
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to push tag"; exit 1 }

Write-Host "Tag $TagName created and pushed."
