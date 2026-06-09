import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Concept: Vite config.
// What it means: Vite runs the dev server, bundles the app, and applies the React plugin.
// Seen in app: npm.cmd run dev serves http://127.0.0.1:5173.
export default defineConfig({
  plugins: [react()],
  test: {
    // Concept: jsdom test environment.
    // What it means: tests get a browser-like DOM even though they run in Node.
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true
  }
});
