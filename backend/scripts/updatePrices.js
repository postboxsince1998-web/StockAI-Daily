import db from '../database/db.js';
import { fetchStockData } from '../services/dataCollector.js';

async function main() {
  console.log('🔄 Manually updating stock prices from Yahoo Finance...');
  const companies = db.prepare('SELECT symbol, name FROM companies').all();
  let count = 0;
  for (const c of companies) {
    console.log(` Fetching price for ${c.name} (${c.symbol})...`);
    const p = await fetchStockData(c.symbol);
    if (p) count++;
  }
  console.log(`✅ Price update complete. Updated ${count} symbols.`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Price update failed:', err);
  process.exit(1);
});
