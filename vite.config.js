import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path matches the GitHub Pages project-site convention:
// https://<username>.github.io/<repo-name>/
// Change this if you deploy under a custom domain (e.g. training.minetrans.co.za)
export default defineConfig({
  plugins: [react()],
  base: '/MineTrans-Training-Course/',
})
