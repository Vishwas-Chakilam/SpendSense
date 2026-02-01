# PowerShell script to commit Android setup files to GitHub
# Run this from the project root directory

Write-Host "🚀 Committing Android App Setup Files..." -ForegroundColor Green
Write-Host ""

# Add Android configuration files
Write-Host "Adding Android configuration files..." -ForegroundColor Yellow
git add android/twa-manifest.json
git add android/build.gradle
git add android/app/build.gradle
git add android/settings.gradle
git add android/gradle.properties
git add android/gradle/
git add android/gradlew
git add android/gradlew.bat
git add android/manifest-checksum.txt
git add android/app/src/

# Add PWA files
Write-Host "Adding PWA files..." -ForegroundColor Yellow
git add public/.well-known/assetlinks.json
git add public/web-app-manifest-*.png

# Add updated config files
Write-Host "Adding updated configuration files..." -ForegroundColor Yellow
git add vite.config.ts
git add .gitignore
git add index.html
git add package.json
git add package-lock.json

# Add documentation
Write-Host "Adding documentation..." -ForegroundColor Yellow
git add ANDROID_SETUP.md
git add PWA_SETUP_SUMMARY.md
git add GITHUB_COMMIT_GUIDE.md

Write-Host ""
Write-Host "✅ Files staged for commit!" -ForegroundColor Green
Write-Host ""
Write-Host "Review what will be committed:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "To commit, run:" -ForegroundColor Cyan
Write-Host "  git commit -m 'Add Android app setup with PWA and TWA configuration'" -ForegroundColor White
Write-Host ""
Write-Host "Then push to GitHub:" -ForegroundColor Cyan
Write-Host "  git push origin main" -ForegroundColor White
