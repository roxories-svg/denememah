import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import assistantHandler from './api/assistant.js'

const MAX_API_BODY_BYTES = 4.5 * 1024 * 1024

function localAssistantApiPlugin(apiKey) {
  return {
    name: 'local-assistant-api',
    configureServer(server) {
      if (apiKey && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = apiKey
      }

      server.middlewares.use('/api/assistant', (req, res) => {
        if (req.method !== 'POST') {
          req.body = undefined
          return invokeAssistant()
        }

        const contentLength = Number(req.headers['content-length']) || 0
        if (contentLength > MAX_API_BODY_BYTES) {
          res.statusCode = 413
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: { code: 'payload-too-large' } }))
          return
        }

        const chunks = []
        let bodySize = 0
        let oversized = false
        req.on('data', (chunk) => {
          if (oversized) return
          bodySize += chunk.length
          if (bodySize > MAX_API_BODY_BYTES) {
            oversized = true
            res.statusCode = 413
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: { code: 'payload-too-large' } }))
            return
          }
          chunks.push(chunk)
        })
        req.on('end', () => {
          if (res.writableEnded || oversized) return
          try {
            req.body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: { code: 'invalid-request' } }))
            return
          }
          invokeAssistant()
        })

        async function invokeAssistant() {
          res.status = (status) => {
            res.statusCode = status
            return res
          }
          res.json = (payload) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(payload))
            return res
          }

          try {
            await assistantHandler(req, res)
          } catch (error) {
            console.error('Local assistant API failed:', error?.message)
            if (!res.writableEnded) {
              res.statusCode = 500
              res.json({ error: { code: 'provider-error' } })
            }
          }
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      localAssistantApiPlugin(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY)
    ],
    base: '/', // Vercel ve statik barındırma servisleri için kök dizin tanımı
  }
})
