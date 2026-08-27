import db from '../database/db.js';
import { fetchStockData } from '../services/dataCollector.js';

async function main() {
  console.log('🔄 Manually updating fundamental data...');
  const stocks = db.prepare('SELECT symbol, name FROM companies WHERE is_index = 0').all();
  let count = 0;
  for (const comp of stocks) {
    console.log(` Fetching fundamentals for ${comp.name} (${comp.symbol})...`);
    await fetchStockData(comp.symbol);
    count++;
  }
  console.log(`✅ Fundamentals update complete for ${count} companies.`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fundamentals update failed:', err);
  process.exit(1);
});
