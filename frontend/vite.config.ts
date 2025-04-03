import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig({
  preview: {
    port: 5173
  },
  plugins: [
    react(), 
    tailwindcss()
  ],
})
