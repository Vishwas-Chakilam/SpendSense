# Android App Setup Guide for SpendSense

This guide will help you convert your SpendSense PWA into an Android app using Bubblewrap.

## Prerequisites

- Node.js installed
- Your website should be live and publicly accessible
- Basic knowledge of web development

## Step 1: PWA Configuration ✅

The PWA has been configured with:
- ✅ `vite-plugin-pwa` installed
- ✅ PWA plugin configured in `vite.config.ts`
- ✅ Manifest file will be auto-generated on build

### Icon Setup

**IMPORTANT**: You need to create proper icon files:
1. Go to [Favicon Generator](https://realfavicongenerator.net/) or similar tool
2. Upload your logo
3. Generate icons in sizes: **192x192** and **512x512** pixels
4. Download and place them in the `public` folder as:
   - `public/web-app-manifest-192x192.png`
   - `public/web-app-manifest-512x512.png`

Currently, placeholder files have been created from your existing logo.png, but you should replace them with properly sized versions.

### Build and Deploy

1. Build your project:
   ```bash
   npm run build
   ```

2. Deploy your website to make it publicly accessible (the manifest will be available at `https://your-domain.com/manifest.webmanifest`)

## Step 2: Install Bubblewrap CLI

```bash
npm install -g @bubblewrap/cli
```

## Step 3: Initialize Android Project

Navigate to the `android` folder and run:

```bash
cd android
bubblewrap init --manifest=https://your-website-domain.com/manifest.webmanifest
```

Replace `your-website-domain.com` with your actual live website URL.

### Troubleshooting the Init Command

**JDK Setup:**
- If Bubblewrap asks to install JDK, you can say "No" and install manually:
  1. Download JDK 17 from [Adoptium](https://adoptium.net/)
  2. Install it
  3. Set environment variables to include the JDK's bin path
  4. When prompted, provide the path (e.g., `C:\java\jdk-17.0.16.8-hotspot`)

**Android SDK Setup:**
- Let Bubblewrap install the Android SDK automatically (recommended)
- If you face issues, install manually and provide the path

## Step 4: Answer Bubblewrap Questions

When prompted, answer:

- **Domain**: Press Enter (auto-filled from manifest)
- **Application name**: `Spendsense`
- **Application ID**: `com.spendsense.twa` (or your preferred package name)
- **Display mode**: `standalone`
- **Orientation**: `portrait`
- **Status bar color**: Press Enter (default)
- **Splash screen color**: Press Enter (default)
- **Icon URL**: Press Enter (default)
- **Include support for Play Billing?**: `N` (unless you need in-app purchases)
- **Request geolocation permission?**: `N` (unless your app needs location)

**Key Store Information:**
- **First and Last names**: Your full name
- **Organizational Unit**: Developer (or anything)
- **Organization**: Your organization name
- **Country (2-letter code)**: Your country code (e.g., US, IN, UK)
- **Password for key store**: Enter a password (remember this!)
- **Password for key**: Enter the SAME password (must match!)

⚠️ **Important**: The key store and key passwords must be the same, or the build will fail.

## Step 5: Build the App

```bash
bubblewrap build --universalApk
```

This creates both `.apk` (for testing) and `.aab` (for Play Store) files.

The APK will be in: `android/app/build/outputs/bundle/release/app-release.aab` or `android/app/build/outputs/apk/release/app-release.apk`

## Step 6: Set Up TWA Validation

After building, you'll get an APK. When you test it, you'll see the browser address bar. To remove it and enable full-screen mode:

### Get Your SHA256 Fingerprint

1. Navigate to your `android` folder
2. Run:
   ```bash
   keytool -list -v -keystore android.keystore -alias android
   ```
   (The alias name should match what you created during init)

3. Enter your key store password
4. Copy the **SHA256** fingerprint from the output

### Update assetlinks.json

1. Open `public/.well-known/assetlinks.json`
2. Replace `YOUR_SHA256_FINGERPRINT_HERE` with your actual SHA256 fingerprint
3. Replace `com.spendsense.twa` with your actual package name (from `android/twa-manifest.json`)
4. Deploy this file to your live website

The file should be accessible at: `https://your-domain.com/.well-known/assetlinks.json`

### Verify TWA Validation

1. Visit [Digital Asset Links Verifier](https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://your-domain.com&relation=delegate_permission/common.handle_all_urls)
2. Replace `your-domain.com` with your actual domain
3. Check if the validation passes

## Step 7: Test the App

1. Transfer the APK to your Android device
2. Install it (you may need to enable "Install from unknown sources")
3. Open the app - it should now run in full-screen mode without the address bar!

## Step 8 (Optional): Customize In-App Experience

If you want to show different content for app users vs website users:

1. In `android/twa-manifest.json`, set:
   ```json
   "startUrl": "/?twa=true"
   ```

2. In your React app, detect the TWA parameter:
   ```typescript
   const queryParams = new URLSearchParams(window.location.search);
   const twaParam = queryParams.get("twa");
   
   const [isTwa, setIsTwa] = useState<boolean>(() => {
     return localStorage.getItem("isTwa") === "true";
   });
   
   useEffect(() => {
     if (twaParam === "true") {
       localStorage.setItem("isTwa", "true");
       setIsTwa(true);
     }
   }, [twaParam]);
   ```

3. Conditionally render content:
   ```tsx
   {isTwa ? (
     <Link to="/contact">Contact</Link>
   ) : (
     <Link to="/download">Download App</Link>
   )}
   ```

4. Rebuild:
   ```bash
   bubblewrap build --universalApk
   ```

## Publishing to Play Store

1. Use the `.aab` file (not `.apk`) for Play Store submission
2. The file is located in: `android/app/build/outputs/bundle/release/app-release.aab`
3. Upload it to Google Play Console

## Customization

You can customize:
- App name, colors, splash screen in `android/twa-manifest.json`
- After changes, rebuild with `bubblewrap build --universalApk`

## Notes

- Bubblewrap is only for Android
- For cross-platform support, consider Capacitor or similar tools
- Make sure your website is HTTPS (required for PWAs and TWAs)
- Keep your keystore file safe - you'll need it for updates!

## Troubleshooting

**Issue**: Address bar still showing after setup
- **Solution**: Verify `assetlinks.json` is accessible and correctly formatted
- Check Digital Asset Links Verifier
- Ensure package name matches in both `twa-manifest.json` and `assetlinks.json`

**Issue**: Build fails
- **Solution**: Check that JDK and Android SDK are properly configured
- Verify key store passwords match

**Issue**: Icons not showing
- **Solution**: Ensure icon files are exactly 192x192 and 512x512 pixels
- Check that files are in the `public` folder

## Next Steps

1. ✅ PWA configured
2. ⏳ Create proper icon files (192x192 and 512x512)
3. ⏳ Build and deploy your website
4. ⏳ Run `bubblewrap init` in the android folder
5. ⏳ Build the Android app
6. ⏳ Set up TWA validation
7. ⏳ Test and publish!

Good luck! 🚀
