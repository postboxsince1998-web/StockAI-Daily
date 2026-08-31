// Database Schema Definitions for StockAI Daily (SQLite & PostgreSQL Compatible)

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  exchange TEXT DEFAULT 'NSE',
  sector TEXT NOT NULL,
  industry TEXT,
  is_index INTEGER DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  open REAL,
  high REAL,
  low REAL,
  close REAL,
  previous_close REAL,
  change REAL,
  change_percent REAL,
  volume INTEGER,
  fifty_two_week_high REAL,
  fifty_two_week_low REAL,
  source TEXT NOT NULL,
  retrieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS historical_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  close REAL NOT NULL,
  volume INTEGER,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS fundamentals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  market_cap REAL,
  pe_ratio REAL,
  eps REAL,
  revenue REAL,
  revenue_growth REAL,
  net_profit REAL,
  profit_growth REAL,
  debt REAL,
  debt_to_equity REAL,
  roe REAL,
  roce REAL,
  dividend_yield REAL,
  book_value REAL,
  source TEXT NOT NULL,
  retrieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS quarterly_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  period TEXT NOT NULL,
  revenue REAL,
  profit REAL,
  eps REAL,
  revenue_change_pct REAL,
  profit_change_pct REAL,
  comparison_type TEXT CHECK(comparison_type IN ('YoY', 'QoQ')),
  report_date TEXT,
  source TEXT,
  UNIQUE(symbol, period)
);

CREATE TABLE IF NOT EXISTS news_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'OTHER',
  sentiment TEXT DEFAULT 'NEUTRAL',
  published_at TEXT NOT NULL,
  retrieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, title, published_at)
);

CREATE TABLE IF NOT EXISTS stock_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  event_type TEXT NOT NULL,
  importance TEXT CHECK(importance IN ('LOW', 'MEDIUM', 'HIGH')),
  description TEXT NOT NULL,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'ChangeDetectionService'
);

CREATE TABLE IF NOT EXISTS daily_company_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  summary TEXT NOT NULL,
  important_changes TEXT,
  risk_summary TEXT,
  fundamental_summary TEXT,
  news_summary TEXT,
  health_score INTEGER,
  health_breakdown TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS market_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  market_overview TEXT NOT NULL,
  top_gainers TEXT NOT NULL,
  top_losers TEXT NOT NULL,
  strongest_sectors TEXT NOT NULL,
  weakest_sectors TEXT NOT NULL,
  important_news TEXT NOT NULL,
  fundamental_changes TEXT NOT NULL,
  stocks_to_watch TEXT NOT NULL,
  one_minute_summary TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_indices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  close REAL NOT NULL,
  previous_close REAL,
  change REAL,
  change_percent REAL,
  retrieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS market_holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  last_accessed DATETIME
);

CREATE TABLE IF NOT EXISTS update_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL,
  companies_analysed INTEGER DEFAULT 0,
  news_collected INTEGER DEFAULT 0,
  events_detected INTEGER DEFAULT 0,
  ai_summaries_generated INTEGER DEFAULT 0,
  log_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_daily_prices_symbol_date ON daily_prices(symbol, date);
CREATE INDEX IF NOT EXISTS idx_historical_prices_symbol_date ON historical_prices(symbol, date);
CREATE INDEX IF NOT EXISTS idx_news_symbol_date ON news_articles(symbol, published_at);
CREATE INDEX IF NOT EXISTS idx_stock_events_symbol ON stock_events(symbol);
CREATE INDEX IF NOT EXISTS idx_company_analysis_symbol_date ON daily_company_analysis(symbol, date);
`;

export const PG_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  exchange TEXT DEFAULT 'NSE',
  sector TEXT NOT NULL,
  industry TEXT,
  is_index INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_prices (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  open DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  close DOUBLE PRECISION,
  previous_close DOUBLE PRECISION,
  change DOUBLE PRECISION,
  change_percent DOUBLE PRECISION,
  volume BIGINT,
  fifty_two_week_high DOUBLE PRECISION,
  fifty_two_week_low DOUBLE PRECISION,
  source TEXT NOT NULL,
  retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS historical_prices (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  close DOUBLE PRECISION NOT NULL,
  volume BIGINT,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS fundamentals (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  market_cap DOUBLE PRECISION,
  pe_ratio DOUBLE PRECISION,
  eps DOUBLE PRECISION,
  revenue DOUBLE PRECISION,
  revenue_growth DOUBLE PRECISION,
  net_profit DOUBLE PRECISION,
  profit_growth DOUBLE PRECISION,
  debt DOUBLE PRECISION,
  debt_to_equity DOUBLE PRECISION,
  roe DOUBLE PRECISION,
  roce DOUBLE PRECISION,
  dividend_yield DOUBLE PRECISION,
  book_value DOUBLE PRECISION,
  source TEXT NOT NULL,
  retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS quarterly_results (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  period TEXT NOT NULL,
  revenue DOUBLE PRECISION,
  profit DOUBLE PRECISION,
  eps DOUBLE PRECISION,
  revenue_change_pct DOUBLE PRECISION,
  profit_change_pct DOUBLE PRECISION,
  comparison_type TEXT CHECK(comparison_type IN ('YoY', 'QoQ')),
  report_date TEXT,
  source TEXT,
  UNIQUE(symbol, period)
);

CREATE TABLE IF NOT EXISTS news_articles (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'OTHER',
  sentiment TEXT DEFAULT 'NEUTRAL',
  published_at TEXT NOT NULL,
  retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, title, published_at)
);

CREATE TABLE IF NOT EXISTS stock_events (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  event_type TEXT NOT NULL,
  importance TEXT CHECK(importance IN ('LOW', 'MEDIUM', 'HIGH')),
  description TEXT NOT NULL,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'ChangeDetectionService'
);

CREATE TABLE IF NOT EXISTS daily_company_analysis (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  summary TEXT NOT NULL,
  important_changes TEXT,
  risk_summary TEXT,
  fundamental_summary TEXT,
  news_summary TEXT,
  health_score INTEGER,
  health_breakdown TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS market_reports (
  id SERIAL PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  market_overview TEXT NOT NULL,
  top_gainers TEXT NOT NULL,
  top_losers TEXT NOT NULL,
  strongest_sectors TEXT NOT NULL,
  weakest_sectors TEXT NOT NULL,
  important_news TEXT NOT NULL,
  fundamental_changes TEXT NOT NULL,
  stocks_to_watch TEXT NOT NULL,
  one_minute_summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_indices (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  close DOUBLE PRECISION NOT NULL,
  previous_close DOUBLE PRECISION,
  change DOUBLE PRECISION,
  change_percent DOUBLE PRECISION,
  retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS market_holidays (
  id SERIAL PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_sources (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  last_accessed TIMESTAMP
);

CREATE TABLE IF NOT EXISTS update_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL,
  companies_analysed INTEGER DEFAULT 0,
  news_collected INTEGER DEFAULT 0,
  events_detected INTEGER DEFAULT 0,
  ai_summaries_generated INTEGER DEFAULT 0,
  log_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_daily_prices_symbol_date ON daily_prices(symbol, date);
CREATE INDEX IF NOT EXISTS idx_historical_prices_symbol_date ON historical_prices(symbol, date);
CREATE INDEX IF NOT EXISTS idx_news_symbol_date ON news_articles(symbol, published_at);
CREATE INDEX IF NOT EXISTS idx_stock_events_symbol ON stock_events(symbol);
CREATE INDEX IF NOT EXISTS idx_company_analysis_symbol_date ON daily_company_analysis(symbol, date);
`;
