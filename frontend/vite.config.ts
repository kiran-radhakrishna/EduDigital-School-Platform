import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              priority: 2,
            },
            {
              name: 'vendor-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 2,
            },
            {
              name: 'vendor-forms',
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              priority: 2,
            },
          ],
        },
      },
    },
  },
})
