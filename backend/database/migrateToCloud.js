import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateDataToCloud() {
  const targetUrl = process.env.DATABASE_URL;
  if (!targetUrl || (!targetUrl.startsWith('postgres://') && !targetUrl.startsWith('postgresql://'))) {
    console.error('❌ Please set a valid PostgreSQL DATABASE_URL in your .env file before running migration.');
    process.exit(1);
  }

  console.log('🚀 Starting Data Migration from Local SQLite to Cloud PostgreSQL...');

  const dbPath = path.join(__dirname, '..', 'data', 'stockai.db');
  const sqliteDb = new Database(dbPath);
  const cloudPool = new Pool({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });

  const tables = [
    'companies',
    'daily_prices',
    'historical_prices',
    'fundamentals',
    'quarterly_results',
    'news_articles',
    'stock_events',
    'daily_company_analysis',
    'market_reports',
    'market_indices',
    'market_holidays',
    'data_sources',
    'update_logs'
  ];

  for (const table of tables) {
    try {
      const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all();
      console.log(` 📦 Migrating ${table} (${rows.length} rows)...`);
      if (rows.length === 0) continue;

      for (const row of rows) {
        const keys = Object.keys(row).filter(k => k !== 'id');
        const values = keys.map(k => row[k]);
        const cols = keys.join(', ');
        const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');

        const query = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
        await cloudPool.query(query, values);
      }
    } catch (e) {
      console.warn(` Warning migrating table ${table}:`, e.message);
    }
  }

  console.log('✅ Migration to Cloud Database Completed Successfully!');
  await cloudPool.end();
  process.exit(0);
}

migrateDataToCloud();
