<div align="center">
  <h1>💰 Spendsense</h1>
  <p><strong>AI-Powered Expense Tracker with Gamification</strong></p>
  <p>A modern Progressive Web App (PWA) and Android app that makes personal finance management fun and intuitive</p>
  
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Spendsense-blue?style=for-the-badge)](https://spendsense-one.netlify.app)
  [![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![PWA](https://img.shields.io/badge/PWA-Enabled-4285F4?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
  [![Android](https://img.shields.io/badge/Android-Available-3DDC84?style=for-the-badge&logo=android)](https://www.android.com/)
</div>

---

## ✨ Features

### 🤖 AI-Powered Receipt Scanning
- Snap a photo of your receipt and let Google Gemini AI extract transaction details automatically
- Automatic categorization and data extraction
- No more manual data entry!

### 📊 Smart Analytics & Insights
- Visual charts showing your spending patterns over time
- AI-generated personalized financial advice
- Category-wise expense breakdown with interactive charts
- Time-based filtering (Week/Month/Year)

### 🎮 Gamification
- Earn points for tracking transactions
- Unlock achievements and badges
- Build daily streaks to stay consistent
- Unlock new avatars as you progress
- Level up system based on points

### 💰 Budget Management
- Set weekly, monthly, or yearly budget limits
- Category-specific budget controls
- Real-time budget tracking and progress indicators
- Budget alerts when limits are exceeded

### 📱 Progressive Web App (PWA)
- Install directly on your phone or desktop
- Works offline with service worker caching
- Auto-updates with background sync
- Native app-like experience
- No app store needed for web version!

### 🤖 Android App
- Native Android app built with Trusted Web Activity (TWA)
- Full-screen experience without browser UI
- Deep linking support
- Available as APK or ready for Google Play Store

### 📤 Data Export
- Export transactions to PDF
- Export transactions to Excel
- Full control over your financial data

### 🔒 Privacy-First
- All data stored locally on your device
- No cloud sync, no servers
- Complete privacy and data ownership

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vishwas-Chakilam/SpendSense.git
   cd SpendSense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory. The PWA manifest and service worker will be automatically generated.

### Building Android App

To build the Android app, see the comprehensive [Android Setup Guide](ANDROID_SETUP.md). Quick steps:

1. Install Bubblewrap CLI: `npm install -g @bubblewrap/cli`
2. Navigate to android folder: `cd android`
3. Build APK: `bubblewrap build --universalApk`

For detailed instructions, see [ANDROID_SETUP.md](ANDROID_SETUP.md).

---

## 📲 Installation Options

### Option 1: Install as PWA (Web)

#### On Mobile (Android/iPhone)

1. Open the app in your browser: [https://spendsense-one.netlify.app](https://spendsense-one.netlify.app)
2. **Android (Chrome):**
   - Tap the menu (⋮) in the top right
   - Select "Install app" or "Add to Home screen"
   - Confirm installation
3. **iPhone (Safari):**
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add" to confirm

#### On Desktop (Chrome/Edge)

1. Visit [https://spendsense-one.netlify.app](https://spendsense-one.netlify.app)
2. Look for the install icon (⊕) in the address bar
3. Click it and select "Install"
4. The app will open in its own window, just like a native app!

### Option 2: Install Android App (APK)

1. **Download the APK** from the releases or build it yourself (see [Android Setup Guide](ANDROID_SETUP.md))
2. **Enable installation from unknown sources** on your Android device:
   - Go to Settings → Security → Enable "Install from unknown sources"
3. **Install the APK** by tapping on the downloaded file
4. **Launch Spendsense** from your app drawer

> **Note:** The Android app provides a full-screen native experience without browser UI. For building your own APK, see the [Android Setup Guide](ANDROID_SETUP.md).

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19.2.1
- **Language:** TypeScript 5.8
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **AI Integration:** Google Gemini AI
- **PDF Export:** jsPDF
- **Excel Export:** xlsx
- **PWA:** Vite PWA Plugin with Service Worker + Web App Manifest
- **Android:** Bubblewrap CLI + Trusted Web Activity (TWA)

---

## 📁 Project Structure

```
spendsense/
├── android/             # Android TWA project (Bubblewrap)
│   ├── app/             # Android app source code
│   ├── gradle/          # Gradle wrapper
│   ├── twa-manifest.json  # TWA configuration
│   └── build.gradle     # Build configuration
├── components/          # Reusable React components
│   ├── AddTransactionModal.tsx
│   ├── Icons.tsx
│   ├── Layout.tsx
│   └── Tour.tsx
├── services/            # Business logic and API services
│   ├── exportService.ts
│   ├── geminiService.ts
│   └── storageService.ts
├── views/               # Main page views
│   ├── Analytics.tsx
│   ├── Dashboard.tsx
│   ├── Onboarding.tsx
│   ├── Profile.tsx
│   └── Transactions.tsx
├── public/              # Static assets and PWA files
│   ├── .well-known/     # TWA validation files
│   │   └── assetlinks.json
│   ├── web-app-manifest-192x192.png
│   ├── web-app-manifest-512x512.png
│   └── logo.png
├── App.tsx              # Main app component
├── index.tsx            # Entry point
├── types.ts             # TypeScript type definitions
├── constants.tsx        # App constants and configurations
├── vite.config.ts       # Vite configuration with PWA plugin
├── ANDROID_SETUP.md     # Android app setup guide
└── README.md            # This file
```

---

## 🎯 Key Features Explained

### AI Receipt Scanning
Uses Google Gemini AI to analyze receipt images and extract:
- Transaction amount
- Date
- Merchant name
- Category (automatically categorized)

### Gamification System
- **Points:** Earn 100 points per achievement unlocked
- **Badges:** Unlock badges for milestones (first transaction, 50+ transactions, big purchases, savings, streaks)
- **Streaks:** Track consecutive days of logging transactions
- **Avatars:** Unlock new avatars by earning points or badges

### Budget Tracking
- Set overall budget limits for different periods
- Optional category-specific limits
- Visual progress indicators
- Real-time budget status

---

## 📚 Documentation

- **[Android Setup Guide](ANDROID_SETUP.md)** - Complete guide for building and deploying the Android app
- **[PWA Setup Summary](PWA_SETUP_SUMMARY.md)** - PWA configuration overview
- **[GitHub Commit Guide](GITHUB_COMMIT_GUIDE.md)** - Guide for committing Android setup files

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Developer

**Vishwas Chakilam**

- LinkedIn: [vishwas-chakilam](https://linkedin.com/in/vishwas-chakilam)
- GitHub: [@Vishwas-Chakilam](https://github.com/vishwas-chakilam)
- Email: work.vishwas1@gmail.com

---

## 🙏 Acknowledgments

- Google Gemini AI for powering the receipt scanning and insights
- React and Vite communities for amazing tools
- All contributors and users of Spendsense

---

<div align="center">
  <p>Made with ❤️ using React, TypeScript, and AI</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
