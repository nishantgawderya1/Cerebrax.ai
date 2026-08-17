import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkClient, clerkMiddleware, requireAuth } from '@clerk/express';
import { auth } from './middlewares/auth.js';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express()

// Surface missing configuration in the logs. A server that crashes on boot (or on a
// missing DATABASE_URL) never applies CORS headers, which the browser reports as an
// opaque "Network Error" — so make the real cause visible in the deploy logs.
const requiredEnv = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'GEMINI_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FRONTEND_URL',
]
const missingEnv = requiredEnv.filter((key) => !process.env[key])
if (missingEnv.length) {
  console.warn('⚠️  Missing environment variables:', missingEnv.join(', '))
}

await connectCloudinary()

// Restrict CORS to the configured frontend origin(s), while staying resilient to the
// deployment mistakes that most often surface as a browser "Network Error": a trailing
// slash / casing mismatch in FRONTEND_URL, or a Vercel preview URL that differs from the
// production domain. Set FRONTEND_URL in production (comma-separated for multiple origins);
// it falls back to the local Vite dev server.
const normalizeOrigin = (origin) => (origin || '').trim().replace(/\/+$/, '').toLowerCase()

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(normalizeOrigin(origin))) return true
  // Allow this project's own Vercel production + preview deployments by default.
  try {
    return /(^|\.)vercel\.app$/.test(new URL(origin).hostname)
  } catch {
    return false
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, health checks, server-to-server) are allowed.
      if (!origin || isAllowedOrigin(origin)) return callback(null, true)
      console.warn(`CORS: blocked origin "${origin}" — add it to FRONTEND_URL.`)
      return callback(null, false)
    },
    credentials: true,
  })
)

console.log('CORS allowed origins:', allowedOrigins.join(', ') || '(none configured)')
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) =>res.send('Server is live !'))

app.use(requireAuth())
app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})