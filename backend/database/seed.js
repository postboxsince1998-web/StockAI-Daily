import db from './db.js';

export async function seedDatabase() {
  console.log('🌱 Seeding StockAI Daily database with expanded Indian Stock Market Universe...');

  const insertCompany = db.prepare(`
    INSERT INTO companies (symbol, name, exchange, sector, industry, is_index, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(symbol) DO UPDATE SET
      name=excluded.name,
      sector=excluded.sector,
      industry=excluded.industry;
  `);

  const companies = [
    // Benchmark Indices
    { symbol: '^NSEI', name: 'NIFTY 50', exchange: 'NSE', sector: 'Index', industry: 'Market Benchmark', is_index: 1, description: 'Benchmark index of Top 50 Indian companies.' },
    { symbol: '^BSESN', name: 'SENSEX', exchange: 'BSE', sector: 'Index', industry: 'Market Benchmark', is_index: 1, description: 'Benchmark index of 30 well-established Indian companies.' },
    { symbol: '^NSEBANK', name: 'BANK NIFTY', exchange: 'NSE', sector: 'Index', industry: 'Banking Index', is_index: 1, description: 'Benchmark index of top banking stocks in India.' },

    // IT & Technology
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Leading global IT services and consulting company.' },
    { symbol: 'INFY.NS', name: 'Infosys Ltd', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Next-generation digital services and consulting leader.' },
    { symbol: 'HCLTECH.NS', name: 'HCL Technologies', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Global technology company aiding digital transformation.' },
    { symbol: 'WIPRO.NS', name: 'Wipro Ltd', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Global IT, consulting, and business process services company.' },
    { symbol: 'TECHM.NS', name: 'Tech Mahindra Ltd', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Digital transformation, consulting, and re-engineering specialist.' },
    { symbol: 'LTIM.NS', name: 'LTIMindtree Ltd', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Global technology consulting and digital solutions company.' },
    { symbol: 'PERSISTENT.NS', name: 'Persistent Systems', exchange: 'NSE', sector: 'IT', industry: 'Software Products', is_index: 0, description: 'Digital engineering and enterprise modernization leader.' },
    { symbol: 'COFORGE.NS', name: 'Coforge Ltd', exchange: 'NSE', sector: 'IT', industry: 'IT Solutions', is_index: 0, description: 'Global IT solutions organization transforming client businesses.' },
    { symbol: 'MPHASIS.NS', name: 'Mphasis Ltd', exchange: 'NSE', sector: 'IT', industry: 'IT Services', is_index: 0, description: 'Applied technology services provider focusing on banking and capital markets.' },
    { symbol: 'TATAELXSI.NS', name: 'Tata Elxsi Ltd', exchange: 'NSE', sector: 'IT', industry: 'Design & Tech', is_index: 0, description: 'Design-led technology service provider for automotive and healthcare.' },

    // Banking & Financial Services
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'India largest private sector bank by assets.' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'Major private financial services group in India.' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', industry: 'Public Banking', is_index: 0, description: 'India largest public sector bank.' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'Third-largest private sector bank in India.' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'Leading private sector banking and financial services provider.' },
    { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'New generation private bank offering commercial and retail banking.' },
    { symbol: 'BANKBARODA.NS', name: 'Bank of Baroda', exchange: 'NSE', sector: 'Banking', industry: 'Public Banking', is_index: 0, description: 'Leading Indian public sector banking and financial services company.' },
    { symbol: 'PNB.NS', name: 'Punjab National Bank', exchange: 'NSE', sector: 'Banking', industry: 'Public Banking', is_index: 0, description: 'Major Indian public sector bank headquartered in New Delhi.' },
    { symbol: 'FEDERALBNK.NS', name: 'Federal Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'Major Indian commercial bank in the private sector.' },
    { symbol: 'IDFCFIRSTB.NS', name: 'IDFC FIRST Bank', exchange: 'NSE', sector: 'Banking', industry: 'Private Banking', is_index: 0, description: 'Fast-growing Indian private sector bank.' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', exchange: 'NSE', sector: 'Financial Services', industry: 'NBFC', is_index: 0, description: 'Major non-banking financial company in India.' },
    { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd', exchange: 'NSE', sector: 'Financial Services', industry: 'Financial Holding', is_index: 0, description: 'Financial services company focused on lending, asset management, and insurance.' },
    { symbol: 'JIOFIN.NS', name: 'Jio Financial Services', exchange: 'NSE', sector: 'Financial Services', industry: 'Fintech & NBFC', is_index: 0, description: 'Digital-first financial services provider under Reliance group.' },
    { symbol: 'CHOLAFIN.NS', name: 'Cholamandalam Investment', exchange: 'NSE', sector: 'Financial Services', industry: 'NBFC', is_index: 0, description: 'Comprehensive financial services provider of the Murugappa Group.' },
    { symbol: 'MUTHOOTFIN.NS', name: 'Muthoot Finance', exchange: 'NSE', sector: 'Financial Services', industry: 'Gold Loans', is_index: 0, description: 'India largest gold loan non-banking financial company.' },
    { symbol: 'SHRIRAMFIN.NS', name: 'Shriram Finance Ltd', exchange: 'NSE', sector: 'Financial Services', industry: 'NBFC', is_index: 0, description: 'Flagship company of Shriram group operating in retail finance.' },
    { symbol: 'CDSL.NS', name: 'Central Depository Services', exchange: 'NSE', sector: 'Financial Services', industry: 'Depository', is_index: 0, description: 'Leading capital market depository in India.' },

    // Energy, Oil & Gas
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Oil & Telecom', is_index: 0, description: 'India largest conglomerate spanning energy, retail, and digital services.' },
    { symbol: 'NTPC.NS', name: 'NTPC Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Power Generation', is_index: 0, description: 'India largest power utility producer.' },
    { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp', exchange: 'NSE', sector: 'Energy', industry: 'Oil Exploration', is_index: 0, description: 'Largest crude oil and natural gas company in India.' },
    { symbol: 'POWERGRID.NS', name: 'Power Grid Corp of India', exchange: 'NSE', sector: 'Energy', industry: 'Power Transmission', is_index: 0, description: 'Central public sector undertaking operating electric power transmission.' },
    { symbol: 'BPCL.NS', name: 'Bharat Petroleum Corp', exchange: 'NSE', sector: 'Energy', industry: 'Oil Refining', is_index: 0, description: 'Major oil refining and petroleum marketing public enterprise.' },
    { symbol: 'IOC.NS', name: 'Indian Oil Corp', exchange: 'NSE', sector: 'Energy', industry: 'Oil Refining', is_index: 0, description: 'Largest commercial oil company in India.' },
    { symbol: 'GAIL.NS', name: 'GAIL (India) Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Natural Gas', is_index: 0, description: 'Largest natural gas processing and distribution company in India.' },
    { symbol: 'TATAPOWER.NS', name: 'Tata Power Company', exchange: 'NSE', sector: 'Energy', industry: 'Power & Solar', is_index: 0, description: 'Integrated power company operating renewable and thermal energy.' },
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Conglomerate', is_index: 0, description: 'Flagship incubator company of the Adani Group.' },
    { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy', exchange: 'NSE', sector: 'Energy', industry: 'Renewables', is_index: 0, description: 'Largest renewable power company in India.' },
    { symbol: 'SUZLON.NS', name: 'Suzlon Energy Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Wind Energy', is_index: 0, description: 'Renewable energy power solution provider specializing in wind power.' },

    // Automobile & Auto Components
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India', exchange: 'NSE', sector: 'Auto', industry: 'Automobiles', is_index: 0, description: 'India largest passenger car manufacturer.' },
    { symbol: 'TMCV.NS', name: 'Tata Motors Ltd', exchange: 'NSE', sector: 'Auto', industry: 'Automobiles & EV', is_index: 0, description: 'Global automotive manufacturer of cars, commercial vehicles, and electric vehicles.' },
    { symbol: 'M&M.NS', name: 'Mahindra & Mahindra', exchange: 'NSE', sector: 'Auto', industry: 'Automobiles & Tractors', is_index: 0, description: 'Leading SUV and tractor manufacturer in India.' },
    { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd', exchange: 'NSE', sector: 'Auto', industry: 'Two & Three Wheelers', is_index: 0, description: 'Global manufacturer of two-wheelers and three-wheelers.' },
    { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd', exchange: 'NSE', sector: 'Auto', industry: 'Two Wheelers', is_index: 0, description: 'World largest manufacturer of motorcycles and scooters.' },
    { symbol: 'EICHERMOT.NS', name: 'Eicher Motors Ltd', exchange: 'NSE', sector: 'Auto', industry: 'Motorcycles & Commercial', is_index: 0, description: 'Parent company of Royal Enfield middleweight motorcycles.' },
    { symbol: 'TVSMOTOR.NS', name: 'TVS Motor Company', exchange: 'NSE', sector: 'Auto', industry: 'Two Wheelers', is_index: 0, description: 'Leading two and three-wheeler manufacturer in India.' },
    { symbol: 'BHARATFORG.NS', name: 'Bharat Forge Ltd', exchange: 'NSE', sector: 'Auto', industry: 'Auto Ancillaries', is_index: 0, description: 'Global leader in automotive forging and defense components.' },
    { symbol: 'MOTHERSON.NS', name: 'Samvardhana Motherson', exchange: 'NSE', sector: 'Auto', industry: 'Auto Components', is_index: 0, description: 'Global automotive wiring harness and component manufacturer.' },

    // Consumer Goods & FMCG
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Consumer Goods', is_index: 0, description: 'India largest fast-moving consumer goods company.' },
    { symbol: 'ITC.NS', name: 'ITC Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Consumer Goods & Agri', is_index: 0, description: 'Diversified conglomerate in FMCG, hotels, paperboards, and agribusiness.' },
    { symbol: 'NESTLEIND.NS', name: 'Nestle India Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Food & Nutrition', is_index: 0, description: 'Leading food and nutrition company in India.' },
    { symbol: 'BRITANNIA.NS', name: 'Britannia Industries', exchange: 'NSE', sector: 'FMCG', industry: 'Bakery & Foods', is_index: 0, description: 'Premier food company specializing in biscuits and bakery products.' },
    { symbol: 'GODREJCP.NS', name: 'Godrej Consumer Products', exchange: 'NSE', sector: 'FMCG', industry: 'Personal Care', is_index: 0, description: 'Leading emerging market consumer goods company.' },
    { symbol: 'DABUR.NS', name: 'Dabur India Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Ayurvedic & Healthcare', is_index: 0, description: 'World largest Ayurvedic and natural healthcare company.' },
    { symbol: 'MARICO.NS', name: 'Marico Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Consumer Products', is_index: 0, description: 'Leading consumer goods company in beauty and wellness.' },

    // Defense & Capital Goods / Infrastructure
    { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd', exchange: 'NSE', sector: 'Infrastructure', industry: 'Engineering & EPC', is_index: 0, description: 'Indian multinational conglomerate operating in EPC projects and manufacturing.' },
    { symbol: 'HAL.NS', name: 'Hindustan Aeronautics', exchange: 'NSE', sector: 'Defense', industry: 'Aerospace & Defense', is_index: 0, description: 'India premier aerospace and defense public enterprise.' },
    { symbol: 'BEL.NS', name: 'Bharat Electronics Ltd', exchange: 'NSE', sector: 'Defense', industry: 'Defense Electronics', is_index: 0, description: 'Navratna PSU manufacturing advanced defense electronics.' },
    { symbol: 'BHEL.NS', name: 'Bharat Heavy Electricals', exchange: 'NSE', sector: 'Infrastructure', industry: 'Power Equipment', is_index: 0, description: 'Largest power generation equipment manufacturer in India.' },
    { symbol: 'ABB.NS', name: 'ABB India Ltd', exchange: 'NSE', sector: 'Capital Goods', industry: 'Automation & Power', is_index: 0, description: 'Technology leader in electrification and automation.' },
    { symbol: 'SIEMENS.NS', name: 'Siemens Ltd', exchange: 'NSE', sector: 'Capital Goods', industry: 'Industrial Automation', is_index: 0, description: 'Technology company focusing on industry, infrastructure, and transport.' },
    { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ', exchange: 'NSE', sector: 'Infrastructure', industry: 'Ports & Logistics', is_index: 0, description: 'India largest commercial port developer and operator.' },
    { symbol: 'IRFC.NS', name: 'Indian Railway Finance Corp', exchange: 'NSE', sector: 'Infrastructure', industry: 'Railway Finance', is_index: 0, description: 'Dedicated market borrowing arm of the Indian Railways.' },
    { symbol: 'RAILTEL.NS', name: 'RailTel Corp of India', exchange: 'NSE', sector: 'Infrastructure', industry: 'Telecom & Infra', is_index: 0, description: 'Neutral telecom infrastructure provider of Indian Railways.' },

    // Healthcare & Pharmaceuticals
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', exchange: 'NSE', sector: 'Pharma', industry: 'Pharmaceuticals', is_index: 0, description: 'India largest pharmaceutical company.' },
    { symbol: 'CIPLA.NS', name: 'Cipla Ltd', exchange: 'NSE', sector: 'Pharma', industry: 'Pharmaceuticals', is_index: 0, description: 'Global pharmaceutical company focused on respiratory healthcare.' },
    { symbol: 'DRREDDY.NS', name: 'Dr Reddys Laboratories', exchange: 'NSE', sector: 'Pharma', industry: 'Pharmaceuticals', is_index: 0, description: 'Multinational pharmaceutical company offering generics and active ingredients.' },
    { symbol: 'DIVISLAB.NS', name: 'Divis Laboratories', exchange: 'NSE', sector: 'Pharma', industry: 'API Manufacturer', is_index: 0, description: 'Leading active pharmaceutical ingredients (API) manufacturer.' },
    { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise', exchange: 'NSE', sector: 'Healthcare', industry: 'Hospitals', is_index: 0, description: 'Largest integrated healthcare provider network in India.' },
    { symbol: 'MANKIND.NS', name: 'Mankind Pharma Ltd', exchange: 'NSE', sector: 'Pharma', industry: 'Formulations', is_index: 0, description: 'Leading domestic pharmaceutical company in consumer healthcare.' },
    { symbol: 'MAXHEALTH.NS', name: 'Max Healthcare Institute', exchange: 'NSE', sector: 'Healthcare', industry: 'Hospitals', is_index: 0, description: 'Major healthcare provider operating premium network hospitals.' },

    // Consumer New-Age & Retail
    { symbol: 'POLICYBZR.NS', name: 'PB Fintech (PolicyBazaar)', exchange: 'NSE', sector: 'Consumer Services', industry: 'Insurtech & Fintech', is_index: 0, description: 'Leading online insurance and financial marketplace platform.' },

    { symbol: 'PAYTM.NS', name: 'One97 Communications (Paytm)', exchange: 'NSE', sector: 'Financial Services', industry: 'Fintech', is_index: 0, description: 'Pioneer digital payments and financial technology platform.' },
    { symbol: 'DMART.NS', name: 'Avenue Supermarts (DMart)', exchange: 'NSE', sector: 'Retail', industry: 'Supermarkets', is_index: 0, description: 'India largest discount supermarket chain.' },
    { symbol: 'TITAN.NS', name: 'Titan Company Ltd', exchange: 'NSE', sector: 'Consumer Goods', industry: 'Jewelry & Watches', is_index: 0, description: 'Leading jewelry, watches, and eyewear brand under Tata Group.' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', exchange: 'NSE', sector: 'Consumer Goods', industry: 'Paints & Decor', is_index: 0, description: 'India largest paint manufacturer.' },
    { symbol: 'TRENT.NS', name: 'Trent Ltd', exchange: 'NSE', sector: 'Retail', industry: 'Fashion Retail', is_index: 0, description: 'Retail arm of Tata Group operating Westside and Zudio chains.' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', exchange: 'NSE', sector: 'Telecom', industry: 'Telecommunications', is_index: 0, description: 'Leading telecommunications services provider in Asia and Africa.' }
  ];

  for (const c of companies) {
    await insertCompany.run(c.symbol, c.name, c.exchange, c.sector, c.industry, c.is_index, c.description);
  }

  // Seed Data Sources
  const insertSource = db.prepare(`
    INSERT INTO data_sources (name, type, status)
    VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET status=excluded.status;
  `);

  await insertSource.run('Yahoo Finance (EOD Quotes & Historical)', 'PUBLIC_API', 'ACTIVE');
  await insertSource.run('Google News RSS Feeds', 'RSS_FEED', 'ACTIVE');
  await insertSource.run('NSE Public Filing Feeds', 'PUBLIC_FEED', 'ACTIVE');
  await insertSource.run('StockAI Financial Teacher Engine', 'RULE_BASED_AI', 'ACTIVE');

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
    await insertHoliday.run(h.date, h.description);
  }

  console.log(`✅ Database seeded successfully with ${companies.length} tracked companies & benchmark indices!`);
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('seed')) {
  seedDatabase().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
