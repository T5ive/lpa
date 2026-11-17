/// <reference types="vitest/config" />
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * GitHub Pages ไม่มี SPA rewrite — copy index.html เป็น 404.html
 * เพื่อให้ refresh ที่ deep link (เช่น /lpa/history) ยังโหลดแอปและ client-route ต่อได้
 */
function ghPagesSpaFallback(): PluginOption {
  return {
    name: "gh-pages-spa-fallback",
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, "dist");
      const source = path.join(distDir, "index.html");
      if (existsSync(source)) {
        copyFileSync(source, path.join(distDir, "404.html"));
      }
    },
  };
}

// CI ส่ง VITE_BASE=/lpa/ สำหรับ GitHub Pages (โปรเจกต์ไซต์อยู่ใต้ path /lpa/)
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss(), ghPagesSpaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
