import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

let keyPath = '/secrets/key.pem';
let certPath = '/secrets/cert.pem';

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  keyPath = path.join(process.cwd(), 'secrets', 'key.pem');
  certPath = path.join(process.cwd(), 'secrets', 'cert.pem');
}

const httpsOptions = fs.existsSync(keyPath) && fs.existsSync(certPath)
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  : undefined;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['psei.school.com'],
    ...(httpsOptions ? { https: httpsOptions } : {}),
  },
})
