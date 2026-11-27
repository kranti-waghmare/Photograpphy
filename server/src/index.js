import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase, getDatabaseMode } from './config/db.js';
import { seedDatabase } from './seed.js';
import photographersRouter from './routes/photographers.js';
import bookingsRouter from './routes/bookings.js';
import paymentsRouter from './routes/payments.js';
import portfolioRouter from './routes/portfolio.js';
import inquiriesRouter from './routes/inquiries.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']
      : true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    studio: 'Atelier Lumière',
    databaseMode: getDatabaseMode(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/photographers', photographersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/inquiries', inquiriesRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
  });
});

let initPromise = null;

export async function ensureInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDatabase();
      await seedDatabase();
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

async function bootstrap() {
  try {
    await ensureInitialized();
    app.listen(PORT, () => {
      console.log(`[Server] Atelier Lumière API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Bootstrap Error]', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  bootstrap();
}

export default app;
