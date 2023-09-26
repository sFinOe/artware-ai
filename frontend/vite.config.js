// vite.config.js
import react from "@vitejs/plugin-react";
import eslint from "@rollup/plugin-eslint";
import path from "path";

export default {
  plugins: [
    react(),
    {
      ...eslint({
        include: ["src/**/*.+(js|jsx|ts|tsx)"],
        exclude: ["node_modules/**", "dist/**"],
      }),
      enforce: "pre",
    },
  ],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@config": path.resolve(__dirname, "src/config"),
      "@api": path.resolve(__dirname, "src/api"),
      "@routing": path.resolve(__dirname, "src/routing"),
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://backend:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 80,
  },
};
