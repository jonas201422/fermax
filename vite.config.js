import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        impressum: resolve(__dirname, "impressum/index.html"),
        datenschutz: resolve(__dirname, "datenschutz/index.html")
      }
    }
  }
});
