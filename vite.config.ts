import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: "autoUpdate",
          manifest: {
            name: "Spendsense - Expense Tracker",
            short_name: "Spendsense",
            description: "Track and manage your expenses with AI-powered insights",
            theme_color: "#0ea5e9",
            background_color: "#f9fafb",
            display: "standalone",
            start_url: "/",
            orientation: "portrait-primary",
            icons: [
              {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
              {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
              },
            ],
            categories: ["finance", "productivity"],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
