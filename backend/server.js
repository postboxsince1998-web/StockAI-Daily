import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import db from './database/db.js';
import { seedDatabase } from './database/seed.js';
import apiRoutes from './routes/api.js';
import { startScheduler } from './services/scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;


// Middleware
app.use(cors());
app.use(express.json());

// Seed database on launch if empty
const count = db.prepare('SELECT COUNT(*) as cnt FROM companies').get();
if (!count || count.cnt === 0) {
  console.log('📦 Database empty on launch. Seeding initial data...');
  seedDatabase();
}

// API Routes
app.use('/api', apiRoutes);

// Serve frontend build if dist folder exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🚀 StockAI Daily Backend Server is Running! Frontend dev server available via Vite.');
  });
}

// Start IST Market Scheduler
startScheduler();

app.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`🟢 StockAI Daily Server running on http://localhost:${PORT}`);
  console.log(`============================================================\n`);
});
