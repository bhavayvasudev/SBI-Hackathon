import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { seedAnalytics } from './src/data/seed.js';

// ─── Startup environment validation ───────────────────────────────────────────
// Fail fast with a clear error rather than silently running with missing/weak config.
(function validateEnv() {
  const required = ['JWT_SECRET', 'MONGODB_URI', 'GEMINI_API_KEY', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`[startup] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[startup] Copy server/.env.example to server/.env and fill in all values.');
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error('[startup] JWT_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 48');
    process.exit(1);
  }
})();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seedAnalytics();
  app.listen(PORT, () => {
    console.log(`\n HyperOne API running at http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
