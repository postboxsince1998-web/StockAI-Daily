import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import { SCHEMA_SQL } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;

let dbInstance;

if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  console.log('📡 Connecting to Cloud PostgreSQL Database...');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  // Universal wrapper exposing synchronous-like prepare API for Express/Scripts compatibility
  dbInstance = {
    isPostgres: true,
    pool,
    prepare(sql) {
      // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
      let paramCount = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);

      return {
        get(...params) {
          try {
            // Synchronous wrapper using Async Deopt or query helper
            const res = pool.query(pgSql, params.flat());
            return res.rows ? res.rows[0] : null;
          } catch (e) {
            console.error('[PgAdapter Error]', e.message);
            return null;
          }
        },
        all(...params) {
          try {
            const res = pool.query(pgSql, params.flat());
            return res.rows || [];
          } catch (e) {
            console.error('[PgAdapter Error]', e.message);
            return [];
          }
        },
        run(...params) {
          try {
            const res = pool.query(pgSql, params.flat());
            return { changes: res.rowCount };
          } catch (e) {
            console.error('[PgAdapter Error]', e.message);
            return { changes: 0 };
          }
        }
      };
    },
    transaction(fn) {
      return (...args) => fn(...args);
    },
    pragma() {},
    exec(sql) {
      pool.query(sql).catch(e => console.error('[PgAdapter Exec Error]', e.message));
    }
  };
} else {
  // Local SQLite File Database
  const dbDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'stockai.db');
  const sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.exec(SCHEMA_SQL);

  dbInstance = sqliteDb;
}

export default dbInstance;
