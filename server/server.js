import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express()

// Surface missing configuration in the logs. A server that crashes on boot (or on a
// missing DATABASE_URL) never applies CORS headers, which the browser reports as an
// opaque "Network Error" — so make the real cause visible in the deploy logs.
const requiredEnv = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'CLERK_PUBLISHABLE_KEY',
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

// Never let a misconfigured add-on take the whole process down at cold start.
try {
  await connectCloudinary()
} catch (error) {
  console.error('Cloudinary configuration failed:', error.message)
}

// Behind Vercel (or any proxy) the client IP arrives in X-Forwarded-For. Trust one
// hop so rate limiting keys on the real caller instead of the proxy.
app.set('trust proxy', 1)

// Security headers. This API only returns JSON, so the defaults are safe as-is.
app.use(helmet())

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

// Bound the JSON body so an oversized payload is rejected before it reaches a handler.
app.use(express.json({ limit: '1mb' }))

// --- Public routes (no auth) ---
// Mounted before Clerk on purpose: if the auth provider is misconfigured, the
// health check is exactly the endpoint you need to still answer.
app.get('/', (req, res) => res.send('Server is live !'))

// Health check for uptime monitoring. Reports only whether each secret is present —
// never the values themselves.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    config: {
      database: Boolean(process.env.DATABASE_URL),
      clerk: Boolean(process.env.CLERK_SECRET_KEY),
      cloudinary: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      gemini: Boolean(process.env.GEMINI_API_KEY),
    },
  })
})

// --- Rate limiting ---
// Applied before auth so unauthenticated floods are throttled too.
// Note: the store is per-instance, so on serverless this bounds each warm instance
// rather than the fleet — move to a shared store (Redis) if you need a global cap.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})

// AI routes cost money per call, so they get a tighter budget.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests. Please slow down and try again shortly.' },
})

app.use('/api', apiLimiter)
app.use('/api/ai', aiLimiter)

// --- Protected API ---
// Clerk is scoped to /api so unknown non-API paths still fall through to the
// JSON 404 below even if auth is misconfigured.
app.use('/api', clerkMiddleware())
app.use('/api', requireAuth())
app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

// --- Error handling (must be last) ---
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

// Log rather than die silently; an uncaught exception leaves the process in an
// unknown state, so exit and let the platform restart it.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  process.exit(1)
})

// Finish in-flight requests before exiting on a deploy/scale-down signal.
const shutdown = (signal) => () => {
  console.log(`${signal} received — shutting down gracefully.`)
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', shutdown('SIGTERM'))
process.on('SIGINT', shutdown('SIGINT'))

export default app;
