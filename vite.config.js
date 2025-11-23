import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler", // 使用现代编译器 API，消除 legacy-js-api 警告
        silenceDeprecations: ["import", "legacy-js-api"], // 静默弃用警告
      },
    },
  },
  server: {
    port: 8081,
    host: "0.0.0.0",
    open: true,
    hmr: true, // 启用热模块替换
    watch: {
      usePolling: true, // 在某些系统上需要使用轮询
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // esbuild: {
  //   drop: ["console", "debugger"],
  // },
  build: {
    watch: {
      // 监听文件变化
      include: "src/**",
    },
    minify: "terser",
  },
});
