import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import { SCHEMA_SQL, PG_SCHEMA_SQL } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;

let dbInstance;

if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  console.log('📡 Connecting to Supabase Cloud PostgreSQL Database...');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  dbInstance = {
    isPostgres: true,
    pool,
    async initDb() {
      try {
        await pool.query(PG_SCHEMA_SQL);
        console.log('✅ Supabase PostgreSQL Schema verified successfully.');
      } catch (err) {
        console.warn('⚠️ Supabase Schema Init Notice:', err.message);
      }
    },
    prepare(sql) {
      let paramIndex = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`);

      return {
        async get(...params) {
          try {
            const flatParams = params.flat();
            const res = await pool.query(pgSql, flatParams);
            return res.rows[0] || null;
          } catch (err) {
            console.error('[PostgreSQL Get Error]', err.message);
            return null;
          }
        },
        async all(...params) {
          try {
            const flatParams = params.flat();
            const res = await pool.query(pgSql, flatParams);
            return res.rows || [];
          } catch (err) {
            console.error('[PostgreSQL All Error]', err.message);
            return [];
          }
        },
        async run(...params) {
          try {
            const flatParams = params.flat();
            const res = await pool.query(pgSql, flatParams);
            return { changes: res.rowCount };
          } catch (err) {
            console.error('[PostgreSQL Run Error]', err.message);
            return { changes: 0 };
          }
        }
      };
    },
    transaction(fn) {
      return async (...args) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await fn(...args);
          await client.query('COMMIT');
          return result;
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      };
    },
    pragma() {},
    exec(sql) {
      return pool.query(sql);
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

  dbInstance = {
    isPostgres: false,
    sqliteDb,
    async initDb() {
      sqliteDb.exec(SCHEMA_SQL);
    },
    prepare(sql) {
      const stmt = sqliteDb.prepare(sql);
      return {
        async get(...params) {
          return stmt.get(...params.flat());
        },
        async all(...params) {
          return stmt.all(...params.flat());
        },
        async run(...params) {
          return stmt.run(...params.flat());
        }
      };
    },
    transaction(fn) {
      return sqliteDb.transaction(fn);
    },
    pragma(p) {
      return sqliteDb.pragma(p);
    },
    exec(sql) {
      return sqliteDb.exec(sql);
    }
  };
}

export default dbInstance;
