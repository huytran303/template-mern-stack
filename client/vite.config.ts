import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Proxy target follows PORT from the root .env — same source of truth as the server.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: { "/api": `http://localhost:${loadEnv(mode, "..", "").PORT || 3000}` },
  },
}));
