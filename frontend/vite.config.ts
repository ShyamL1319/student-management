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

import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  build: { sourcemap: 'hidden' },
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  server: {
    allowedHosts: ['edusphere-dev.com'],
    ...(httpsOptions ? { https: httpsOptions } : {}),
  },
})
