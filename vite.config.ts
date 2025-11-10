import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

// Nodig omdat __dirname niet standaard bestaat in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => ({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          (await import("@replit/vite-plugin-cartographer")).cartographer(),
          (await import("@replit/vite-plugin-dev-banner")).devBanner(),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Performance optimizations
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'date-vendor': ['date-fns'],
          'ui-vendor': ['lucide-react'],
          'router-vendor': ['wouter'],
          'query-vendor': ['@tanstack/react-query'],
          
          // Feature chunks
          'todo-features': [
            './src/app/features/todo/LiquidTimeline.tsx',
            './src/app/features/todo/AllDayTasks.tsx',
            './src/app/features/todo/AddTask.tsx',
          ],
          'calendar-features': [
            './src/app/features/calendar/CalendarView.tsx',
            './src/app/features/calendar/EventList.tsx',
          ],
          'reminder-features': [
            './src/app/features/reminders/WaterIntakeFeature.tsx',
            './src/app/features/reminders/MedicationTracker.tsx',
          ],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit (we have good code splitting now)
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173, 
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'date-fns',
      'wouter',
      '@tanstack/react-query',
    ],
  },
}));