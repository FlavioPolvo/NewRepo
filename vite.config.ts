import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  // A configuração de 'base' foi ajustada para priorizar VITE_BASE_PATH,
  // ou usar '/scomapi/' como padrão em produção se VITE_BASE_PATH não estiver definido.
  // Em desenvolvimento, continuará como '/'.
  //base: process.env.NODE_ENV === "development" ? "/" : (process.env.VITE_BASE_PATH || "/scomapi/"),
    base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",

  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react(),
    tempo(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});
