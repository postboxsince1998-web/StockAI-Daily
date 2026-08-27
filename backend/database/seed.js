import db from './db.js';

export function seedDatabase() {
  console.log('🌱 Seeding StockAI Daily database...');

  const insertCompany = db.prepare(`
    INSERT INTO companies (symbol, name, exchange, sector, industry, is_index, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(symbol) DO UPDATE SET
      name=excluded.name,
      sector=excluded.sector,
      industry=excluded.industry;
  `);

  const companies = [
    // Indices
    { symbol: '^NSEI', name: 'NIFTY 50', exchange: 'NSE', sector: 'Index', industry: 'Market Benchmark', is_index: 1, description: 'Benchmark index of Top 50 Indian companies' },
    { symbol: '^BSESN', name: 'SENSEX', exchange: 'BSE', sector: 'Index', industry: 'Market Benchmark', is_index: 1, description: 'Benchmark index of 30 well-established Indian companies' },
    { symbol: '^NSEBANK', name: 'BANK NIFTY', exchange: 'NSE', sector: 'Index', industry: 'Banking Index', is_index: 1, description: 'Benchmark index of top banking stocks in India' },

    // Stocks
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Leading global IT services and consulting company.' },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Oil & Telecom', is_index: 0, description: 'India largest conglomerate spanning energy, retail, and digital services.' },
    { symbol: 'INFY.NS', name: 'Infosys Ltd', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Next-generation digital services and consulting leader.' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'India largest private sector bank by assets.' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'Major private financial services group in India.' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', industry: 'Public Banking', is_index: 0, description: 'India largest public sector bank.' },
    { symbol: 'HCLTECH.NS', name: 'HCL Technologies', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Global technology company aiding digital transformation.' },
    { symbol: 'WIPRO.NS', name: 'Wipro Ltd', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Global information technology and business process service leader.' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro', exchange: 'NSE', sector: 'Infrastructure', industry: 'Engineering & Construction', is_index: 0, description: 'Indian multinational conglomerate operating in EPC projects and manufacturing.' },
    { symbol: 'ITC.NS', name: 'ITC Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Consumer Goods', is_index: 0, description: 'Diversified conglomerate in FMCG, hotels, paperboards, and agribusiness.' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', exchange: 'NSE', sector: 'Telecom', industry: 'Telecommunications', is_index: 0, description: 'Leading telecommunications services provider in Asia and Africa.' },
    { symbol: 'TITAN.NS', name: 'Titan Company', exchange: 'NSE', sector: 'Financial Services', industry: 'Consumer Products', is_index: 0, description: 'Leading jewelry, watches, and eyewear brand under Tata Group.' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', exchange: 'NSE', sector: 'Financial Services', industry: 'NBFC', is_index: 0, description: 'Major non-banking financial company in India.' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India', exchange: 'NSE', sector: 'Auto', industry: 'Automobiles', is_index: 0, description: 'India largest passenger car manufacturer.' },
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', exchange: 'NSE', sector: 'Pharma', industry: 'Pharmaceuticals', is_index: 0, description: 'India largest pharmaceutical company.' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'Third-largest private sector bank in India.' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'Leading private sector banking and financial services provider.' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', exchange: 'NSE', sector: 'Financial Services', industry: 'Paints & Decor', is_index: 0, description: 'India largest paint manufacturer.' },
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', exchange: 'NSE', sector: 'Energy', industry: 'Conglomerate', is_index: 0, description: 'Flagship incubator company of the Adani Group.' },
    { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ', exchange: 'NSE', sector: 'Infrastructure', industry: 'Ports & Logistics', is_index: 0, description: 'India largest commercial port developer and operator.' }
  ];

  for (const c of companies) {
    insertCompany.run(c.symbol, c.name, c.exchange, c.sector, c.industry, c.is_index, c.description);
  }

  // Seed Data Sources
  const insertSource = db.prepare(`
    INSERT INTO data_sources (name, type, status)
    VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET status=excluded.status;
  `);

  insertSource.run('Yahoo Finance (EOD Quotes & Historical)', 'PUBLIC_API', 'ACTIVE');
  insertSource.run('Google News RSS Feeds', 'RSS_FEED', 'ACTIVE');
  insertSource.run('NSE Public Filing Feeds', 'PUBLIC_FEED', 'ACTIVE');
  insertSource.run('StockAI Financial Teacher Engine', 'RULE_BASED_AI', 'ACTIVE');

  // Seed Indian Holidays 2026
  const insertHoliday = db.prepare(`
    INSERT INTO market_holidays (date, description)
    VALUES (?, ?)
    ON CONFLICT(date) DO NOTHING;
  `);

  const holidays = [
    { date: '2026-01-26', description: 'Republic Day' },
    { date: '2026-03-03', description: 'Holi' },
    { date: '2026-03-26', description: 'Id-Ul-Fitr' },
    { date: '2026-04-03', description: 'Good Friday' },
    { date: '2026-04-14', description: 'Dr. Baba Saheb Ambedkar Jayanti' },
    { date: '2026-05-01', description: 'Maharashtra Day' },
    { date: '2026-06-02', description: 'Bakri Id / Id-Ul-Adha' },
    { date: '2026-08-15', description: 'Independence Day' },
    { date: '2026-10-02', description: 'Mahatma Gandhi Jayanti' },
    { date: '2026-10-20', description: 'Dussehra' },
    { date: '2026-11-08', description: 'Diwali Laxmi Pujan' },
    { date: '2026-11-09', description: 'Diwali Balipratipada' },
    { date: '2026-11-24', description: 'Guru Nanak Jayanti' },
    { date: '2026-12-25', description: 'Christmas' }
  ];

  for (const h of holidays) {
    insertHoliday.run(h.date, h.description);
  }

  console.log('✅ Database seeded successfully!');
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('seed')) {
  seedDatabase();
}

