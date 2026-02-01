# GitHub Commit Guide for Android Setup

This guide explains what files to commit to GitHub after setting up your Android app.

## ✅ Files to Commit

### Android Configuration Files (in `android/` folder)
- ✅ `android/twa-manifest.json` - TWA configuration (keystore path sanitized)
- ✅ `android/build.gradle` - Root build configuration
- ✅ `android/app/build.gradle` - App build configuration
- ✅ `android/settings.gradle` - Gradle settings
- ✅ `android/gradle.properties` - Gradle properties
- ✅ `android/gradle/wrapper/` - Gradle wrapper files (needed for builds)
- ✅ `android/gradlew` and `android/gradlew.bat` - Gradle wrapper scripts
- ✅ `android/manifest-checksum.txt` - Manifest checksum
- ✅ `android/app/src/` - Source code and resources (Java files, AndroidManifest.xml, res/)

### PWA Files
- ✅ `public/.well-known/assetlinks.json` - TWA validation file (with your SHA256 fingerprint)
- ✅ `public/web-app-manifest-192x192.png` - App icon (192x192)
- ✅ `public/web-app-manifest-512x512.png` - App icon (512x512)

### Configuration Files
- ✅ `vite.config.ts` - Updated with PWA plugin
- ✅ `.gitignore` - Updated to exclude build files and keystores
- ✅ `package.json` - Includes vite-plugin-pwa dependency

### Documentation
- ✅ `ANDROID_SETUP.md` - Setup instructions
- ✅ `PWA_SETUP_SUMMARY.md` - PWA setup summary

## ❌ Files to NEVER Commit

### Sensitive Files
- ❌ `android/android.keystore` - **NEVER commit this!** Contains your signing key
- ❌ `android/*.keystore` - Any keystore files
- ❌ `.env` or `.env.local` - API keys and secrets

### Build Outputs
- ❌ `android/app/build/` - Build output directory
- ❌ `android/build/` - Build output directory
- ❌ `android/app-release-*.apk` - Built APK files
- ❌ `android/app-release-*.aab` - Built AAB files
- ❌ `android/*.idsig` - Signature files
- ❌ `dist/` - Vite build output (already in .gitignore)

### Other
- ❌ `node_modules/` - Dependencies (already in .gitignore)
- ❌ `android/.gradle/` - Gradle cache
- ❌ `android/local.properties` - Local Android SDK paths

## 📝 Quick Commit Commands

```bash
# Check what will be committed
git status

# Add Android configuration files
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
git add public/.well-known/assetlinks.json
git add public/web-app-manifest-*.png

# Add updated config files
git add vite.config.ts
git add .gitignore
git add package.json
git add package-lock.json

# Add documentation
git add ANDROID_SETUP.md
git add PWA_SETUP_SUMMARY.md

# Commit
git commit -m "Add Android app setup with PWA and TWA configuration"

# Push to GitHub
git push origin main
```

## 🔒 Security Notes

1. **Keystore File**: The `android.keystore` file is in `.gitignore` and will NOT be committed. Keep this file safe and backed up separately.

2. **API Keys**: Make sure `.env` files are in `.gitignore` and never committed.

3. **Asset Links**: The `assetlinks.json` file contains your SHA256 fingerprint, which is safe to commit as it's meant to be publicly accessible.

## ✅ Verification

After committing, verify:
1. Visit your GitHub repository
2. Check that `android/android.keystore` is NOT visible
3. Check that `android/app/build/` is NOT visible
4. Check that `public/.well-known/assetlinks.json` IS visible with your fingerprint
5. Check that `android/twa-manifest.json` IS visible with relative keystore path

## 🚀 Next Steps

After committing:
1. Your website should already have `assetlinks.json` deployed at `https://your-domain.com/.well-known/assetlinks.json`
2. Verify TWA validation using [Digital Asset Links Verifier](https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://your-domain.com&relation=delegate_permission/common.handle_all_urls)
3. Test your APK on Android devices
4. When ready, submit the AAB file to Google Play Store
