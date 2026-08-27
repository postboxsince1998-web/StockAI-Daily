import db from '../database/db.js';
import { fetchNewsForCompany } from '../services/dataCollector.js';

async function main() {
  console.log('🔄 Manually updating news feeds...');
  const stocks = db.prepare('SELECT * FROM companies WHERE is_index = 0').all();
  let totalNews = 0;
  for (const comp of stocks) {
    console.log(` Fetching news for ${comp.name}...`);
    const news = await fetchNewsForCompany(comp);
    totalNews += news.length;
  }
  console.log(`✅ News update complete. Fetched ${totalNews} articles.`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ News update failed:', err);
  process.exit(1);
});
