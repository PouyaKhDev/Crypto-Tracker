import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "../static/frontend", // Output to Django's static directory
    emptyOutDir: true, // Clean the folder before each build
    rollupOptions: {
      input: {
        main: "./main.js", // entry point
      },
      output: {
        // Remove hashes so Django templates can easily reference the files
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
