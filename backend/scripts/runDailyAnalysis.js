import db from '../database/db.js';
import { fetchStockData, fetchNewsForCompany, getTodayDateString } from '../services/dataCollector.js';
import { runChangeDetection } from '../services/changeDetection.js';
import { calculateStockHealth } from '../services/stockHealth.js';
import { generateCompanyAnalysis, generateMarketReport } from '../services/aiService.js';
import { seedDatabase } from '../database/seed.js';

export async function runDailyAnalysisPipeline(forceRun = false) {
  const todayStr = getTodayDateString();
  console.log(`\n============================================================`);
  console.log(`🚀 Starting Daily StockAI Analysis Pipeline for ${todayStr}`);
  console.log(`============================================================\n`);

  // 1. Check Weekend / Holiday
  const todayDateObj = new Date(todayStr);
  const dayOfWeek = todayDateObj.getDay(); // 0 = Sun, 6 = Sat
  if (!forceRun && (dayOfWeek === 0 || dayOfWeek === 6)) {
    console.log(`📅 Today (${todayStr}) is a weekend. Daily market analysis skipped.`);
    return { status: 'SKIPPED_WEEKEND', message: 'Weekend trading holiday' };
  }

  const holidayRow = await db.prepare(`SELECT description FROM market_holidays WHERE date = ?`).get(todayStr);
  if (!forceRun && holidayRow) {
    console.log(`🎉 Today (${todayStr}) is an Indian Market Holiday: ${holidayRow.description}. Analysis skipped.`);
    return { status: 'SKIPPED_HOLIDAY', message: holidayRow.description };
  }

  let companiesAnalysedCount = 0;
  let newsCollectedCount = 0;
  let eventsDetectedCount = 0;
  let aiSummariesCount = 0;

  // 2. Fetch Companies Universe (Auto-seed if database empty)
  let companies = (await db.prepare(`SELECT * FROM companies`).all()) || [];
  if (companies.length === 0) {
    console.log('🌱 Companies table empty. Auto-seeding tracked company universe...');
    await seedDatabase();
    companies = (await db.prepare(`SELECT * FROM companies`).all()) || [];
  }

  const indices = companies.filter(c => c.is_index === 1);
  const stocks = companies.filter(c => c.is_index === 0);

  console.log(`📊 Processing ${indices.length} indices and ${stocks.length} tracked companies...`);

  // 3. Process Indices
  const indexResults = [];
  for (const idx of indices) {
    console.log(`  📈 Fetching Index: ${idx.name} (${idx.symbol})...`);
    const pRecord = await fetchStockData(idx.symbol);
    if (pRecord) {
      await db.prepare(`
        INSERT INTO market_indices (symbol, name, date, close, previous_close, change, change_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(symbol, date) DO UPDATE SET
          close=excluded.close,
          previous_close=excluded.previous_close,
          change=excluded.change,
          change_percent=excluded.change_percent,
          retrieved_at=CURRENT_TIMESTAMP;
      `).run(pRecord.symbol, idx.name, todayStr, pRecord.close, pRecord.previous_close, pRecord.change, pRecord.change_percent);
      indexResults.push(pRecord);
    }
  }

  // 4. Process Stocks
  const stockPriceRecords = [];
  const allNewsList = [];
  const sectorPerformanceMap = {};

  for (const comp of stocks) {
    console.log(`  🏢 Processing ${comp.name} (${comp.symbol}) [Sector: ${comp.sector}]...`);

    // Price EOD
    const priceRecord = await fetchStockData(comp.symbol);
    if (!priceRecord) continue;
    stockPriceRecords.push({ ...priceRecord, name: comp.name, sector: comp.sector });
    companiesAnalysedCount++;

    // Track sector aggregated changes
    if (!sectorPerformanceMap[comp.sector]) {
      sectorPerformanceMap[comp.sector] = { totalChange: 0, count: 0, stocks: [] };
    }
    sectorPerformanceMap[comp.sector].totalChange += priceRecord.change_percent || 0;
    sectorPerformanceMap[comp.sector].count += 1;
    sectorPerformanceMap[comp.sector].stocks.push(comp.symbol);

    // Get previous price record for volume/price change comparisons
    const prevPriceRecord = await db.prepare(`
      SELECT * FROM daily_prices WHERE symbol = ? AND date < ? ORDER BY date DESC LIMIT 1
    `).get(comp.symbol, todayStr);

    // Fetch Fundamentals
    const fundamentals = await db.prepare(`
      SELECT * FROM fundamentals WHERE symbol = ? ORDER BY date DESC LIMIT 1
    `).get(comp.symbol);

    // Fetch News RSS
    const newsArticles = await fetchNewsForCompany(comp);
    newsCollectedCount += newsArticles.length;
    allNewsList.push(...newsArticles);

    // Detect Changes & Events
    const detectedEvents = await runChangeDetection(comp.symbol, priceRecord, prevPriceRecord, fundamentals, newsArticles);
    eventsDetectedCount += detectedEvents.length;

    // Calculate Stock Health Score
    const healthResult = calculateStockHealth(priceRecord, fundamentals);

    // Generate AI Company Analysis
    const aiAnalysis = await generateCompanyAnalysis(comp, priceRecord, fundamentals, detectedEvents, newsArticles);
    aiSummariesCount++;

    // Save Daily Company Analysis
    await db.prepare(`
      INSERT INTO daily_company_analysis (symbol, date, summary, important_changes, risk_summary, fundamental_summary, news_summary, health_score, health_breakdown)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(symbol, date) DO UPDATE SET
        summary=excluded.summary,
        important_changes=excluded.important_changes,
        risk_summary=excluded.risk_summary,
        fundamental_summary=excluded.fundamental_summary,
        news_summary=excluded.news_summary,
        health_score=excluded.health_score,
        health_breakdown=excluded.health_breakdown,
        created_at=CURRENT_TIMESTAMP;
    `).run(
      comp.symbol,
      todayStr,
      aiAnalysis.summary,
      aiAnalysis.important_changes,
      aiAnalysis.risk_summary,
      aiAnalysis.fundamental_summary,
      aiAnalysis.news_summary,
      healthResult.score,
      JSON.stringify(healthResult.breakdown)
    );

    // Micro-delay between requests for rate-limit safety
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // 5. Calculate Sector Performance
  const sectorList = Object.keys(sectorPerformanceMap).map(sec => ({
    sector: sec,
    change_percent: parseFloat((sectorPerformanceMap[sec].totalChange / sectorPerformanceMap[sec].count).toFixed(2)),
    stockCount: sectorPerformanceMap[sec].count
  })).sort((a, b) => b.change_percent - a.change_percent);

  // 6. Calculate Top Gainers & Losers
  const sortedByChange = [...stockPriceRecords].sort((a, b) => b.change_percent - a.change_percent);
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = [...sortedByChange].reverse().slice(0, 5);

  // 7. Generate Daily Market Report
  console.log(`\n📰 Generating Aggregated Daily Market Report...`);
  const marketReportData = await generateMarketReport(todayStr, indexResults, topGainers, topLosers, sectorList, allNewsList);

  await db.prepare(`
    INSERT INTO market_reports (date, title, summary, market_overview, top_gainers, top_losers, strongest_sectors, weakest_sectors, important_news, fundamental_changes, stocks_to_watch, one_minute_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      title=excluded.title,
      summary=excluded.summary,
      market_overview=excluded.market_overview,
      top_gainers=excluded.top_gainers,
      top_losers=excluded.top_losers,
      strongest_sectors=excluded.strongest_sectors,
      weakest_sectors=excluded.weakest_sectors,
      important_news=excluded.important_news,
      fundamental_changes=excluded.fundamental_changes,
      stocks_to_watch=excluded.stocks_to_watch,
      one_minute_summary=excluded.one_minute_summary,
      created_at=CURRENT_TIMESTAMP;
  `).run(
    todayStr,
    marketReportData.title,
    marketReportData.summary,
    marketReportData.market_overview,
    marketReportData.top_gainers,
    marketReportData.top_losers,
    marketReportData.strongest_sectors,
    marketReportData.weakest_sectors,
    marketReportData.important_news,
    marketReportData.fundamental_changes,
    marketReportData.stocks_to_watch,
    marketReportData.one_minute_summary
  );

  // 8. Record Execution Log
  const logMsg = `Completed Daily Analysis Pipeline for ${todayStr}. Analysed ${companiesAnalysedCount} companies, fetched ${newsCollectedCount} news articles, detected ${eventsDetectedCount} events, generated ${aiSummariesCount} AI summaries.`;
  await db.prepare(`
    INSERT INTO update_logs (status, companies_analysed, news_collected, events_detected, ai_summaries_generated, log_message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Completed', companiesAnalysedCount, newsCollectedCount, eventsDetectedCount, aiSummariesCount, logMsg);

  console.log(`\n============================================================`);
  console.log(`✅ Daily StockAI Analysis Pipeline Completed Successfully!`);
  console.log(logMsg);
  console.log(`============================================================\n`);

  return {
    status: 'Completed',
    date: todayStr,
    companiesAnalysed: companiesAnalysedCount,
    newsCollected: newsCollectedCount,
    eventsDetected: eventsDetectedCount,
    aiSummariesGenerated: aiSummariesCount
  };
}

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].includes('runDailyAnalysis')) {
  runDailyAnalysisPipeline(true).then(() => process.exit(0)).catch(err => {
    console.error('❌ Daily Analysis Failed:', err);
    process.exit(1);
  });
}
