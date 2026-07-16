import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkClient, clerkMiddleware, requireAuth } from '@clerk/express';
import { auth } from './middlewares/auth.js';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express()

await connectCloudinary()

// Restrict CORS to the configured frontend origin(s).
// Set FRONTEND_URL in production (comma-separated for multiple origins);
// falls back to the local Vite dev server.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins, credentials: true }))
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