import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const root = path.resolve(import.meta.dirname, "../..");
export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.join(root, "client/src"), "@shared": path.join(root, "shared") } },
  build: {
    outDir: path.join(root, "dist-ds"),
    emptyOutDir: true,
    cssFileName: "style",
    lib: { entry: path.join(root, ".design-sync/lib-build/entry.ts"), formats: ["es"], fileName: () => "index.es.js" },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] },
  },
});
