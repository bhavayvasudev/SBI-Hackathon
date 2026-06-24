import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { seedAnalytics } from './src/data/seed.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seedAnalytics();
  app.listen(PORT, () => {
    console.log(`\n🚀 HyperOne API running at http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
