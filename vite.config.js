import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Necessário para compilar caminhos relativos ao acessar offline como EXE
  server: {
    port: 3000,
  },
})
