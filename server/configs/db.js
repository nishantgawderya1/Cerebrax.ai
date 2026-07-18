import {neon} from '@neondatabase/serverless'

// If DATABASE_URL is missing/invalid, neon() can throw at import time. On Vercel that
// crashes the whole serverless function during cold start, so no route — not even CORS —
// ever runs, and the browser only sees a generic "Network Error". Guard the init so the
// app still boots and returns a clear, CORS-headed error at query time instead.
let sql;

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set — database queries will fail until it is configured.');
  sql = () => {
    throw new Error('Database is not configured (missing DATABASE_URL).');
  };
} else {
  try {
    sql = neon(`${process.env.DATABASE_URL}`);
  } catch (error) {
    console.error('Failed to initialize the database client:', error.message);
    sql = () => {
      throw new Error('Database is not configured (invalid DATABASE_URL).');
    };
  }
}

export default sql;