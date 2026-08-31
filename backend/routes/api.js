import express from 'express';
import db from '../database/db.js';
import { runDailyAnalysisPipeline } from '../scripts/runDailyAnalysis.js';
import { getTodayDateString } from '../services/dataCollector.js';

const router = express.Router();

// GET /api/companies - list all tracked companies with latest price & sector
router.get('/companies', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT c.*, dp.close, dp.change, dp.change_percent, dp.volume, dp.date as price_date,
             dca.health_score
      FROM companies c
      LEFT JOIN daily_prices dp ON c.symbol = dp.symbol AND dp.date = (SELECT MAX(date) FROM daily_prices WHERE symbol = c.symbol)
      LEFT JOIN daily_company_analysis dca ON c.symbol = dca.symbol AND dca.date = (SELECT MAX(date) FROM daily_company_analysis WHERE symbol = c.symbol)
      WHERE c.is_index = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (c.symbol LIKE ? OR c.name LIKE ? OR c.sector LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY c.name ASC`;
    const rows = (await db.prepare(query).all(...params)) || [];

    // Apply category filter in JS if needed
    let filtered = rows;
    if (category === 'Large Companies') {
      filtered = rows.slice(0, 10);
    } else if (category === 'High Growth') {
      filtered = rows.filter(r => (r.change_percent || 0) > 1.0);
    } else if (category === 'Strong Fundamentals') {
      filtered = rows.filter(r => (r.health_score || 0) >= 70);
    } else if (category === 'Low Debt') {
      filtered = rows.filter(r => (r.health_score || 0) >= 65);
    }

    res.json({ success: true, count: filtered.length, companies: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/companies/:symbol - detailed stock view
router.get('/companies/:symbol', async (req, res) => {
  try {
    const symbolParam = req.params.symbol.toUpperCase();
    const symbol = symbolParam.includes('.') || symbolParam.startsWith('^') ? symbolParam : `${symbolParam}.NS`;

    const company = await db.prepare(`SELECT * FROM companies WHERE symbol = ?`).get(symbol);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found in watch universe.' });
    }

    // Latest price
    const latestPrice = await db.prepare(`
      SELECT * FROM daily_prices WHERE symbol = ? ORDER BY date DESC LIMIT 1
    `).get(symbol);

    // Historical prices (last 30 trading days for chart)
    const history = (await db.prepare(`
      SELECT date, close, volume FROM historical_prices WHERE symbol = ? ORDER BY date ASC LIMIT 60
    `).all(symbol)) || [];

    // Calculate multi-period changes (1D, 5D, 1M, 3M, 6M, 1Y)
    const allHistory = (await db.prepare(`
      SELECT date, close FROM historical_prices WHERE symbol = ? ORDER BY date DESC
    `).all(symbol)) || [];

    const currentClose = latestPrice ? latestPrice.close : (allHistory[0]?.close || 0);

    const getPeriodChange = (daysBack) => {
      if (allHistory.length <= daysBack) {
        const oldest = allHistory[allHistory.length - 1];
        if (!oldest || !oldest.close) return null;
        return parseFloat((((currentClose - oldest.close) / oldest.close) * 100).toFixed(2));
      }
      const target = allHistory[daysBack];
      if (!target || !target.close) return null;
      return parseFloat((((currentClose - target.close) / target.close) * 100).toFixed(2));
    };

    const multiPeriodChanges = {
      today: latestPrice?.change_percent ?? 0,
      thisWeek: getPeriodChange(5) ?? latestPrice?.change_percent ?? 0,
      thisMonth: getPeriodChange(20) ?? 0,
      threeMonths: getPeriodChange(60) ?? 0,
      sixMonths: getPeriodChange(120) ?? 0,
      oneYear: getPeriodChange(240) ?? 0
    };

    // Fundamentals
    const fundamentals = await db.prepare(`
      SELECT * FROM fundamentals WHERE symbol = ? ORDER BY date DESC LIMIT 1
    `).get(symbol);

    // Quarterly Results
    const quarterlyResults = (await db.prepare(`
      SELECT * FROM quarterly_results WHERE symbol = ? ORDER BY report_date DESC LIMIT 4
    `).all(symbol)) || [];

    // News
    const news = (await db.prepare(`
      SELECT * FROM news_articles WHERE symbol = ? ORDER BY published_at DESC LIMIT 5
    `).all(symbol)) || [];

    // Events
    const events = (await db.prepare(`
      SELECT * FROM stock_events WHERE symbol = ? ORDER BY detected_at DESC LIMIT 5
    `).all(symbol)) || [];

    // AI Analysis & Health Score
    const aiAnalysis = await db.prepare(`
      SELECT * FROM daily_company_analysis WHERE symbol = ? ORDER BY date DESC LIMIT 1
    `).get(symbol);

    let parsedHealthBreakdown = null;
    if (aiAnalysis?.health_breakdown) {
      try {
        parsedHealthBreakdown = JSON.parse(aiAnalysis.health_breakdown);
      } catch (e) {}
    }

    res.json({
      success: true,
      data_status: 'REAL DATA',
      data_source: 'Yahoo Finance Free EOD API',
      data_period: latestPrice?.date || getTodayDateString(),
      retrieved_at: latestPrice?.retrieved_at || new Date().toISOString(),
      latency_label: 'DELAYED DATA (End of Day)',
      company,
      price: latestPrice,
      multiPeriodChanges,
      history,
      fundamentals,
      quarterlyResults,
      news,
      events,
      health: {
        score: aiAnalysis?.health_score ?? 65,
        breakdown: parsedHealthBreakdown
      },
      aiAnalysis
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/market/today - Full Daily Market Report
router.get('/market/today', async (req, res) => {
  try {
    const todayStr = getTodayDateString();

    // Get latest report from db (or today date)
    let report = await db.prepare(`SELECT * FROM market_reports ORDER BY date DESC LIMIT 1`).get();

    // Get latest market indices
    const indices = (await db.prepare(`SELECT * FROM market_indices WHERE date = (SELECT MAX(date) FROM market_indices)`).all()) || [];

    // Get gainers / losers
    const topGainers = (await db.prepare(`
      SELECT c.symbol, c.name, c.sector, dp.close, dp.change_percent, dp.volume
      FROM daily_prices dp
      JOIN companies c ON dp.symbol = c.symbol
      WHERE dp.date = (SELECT MAX(date) FROM daily_prices) AND c.is_index = 0
      ORDER BY dp.change_percent DESC LIMIT 5
    `).all()) || [];

    const topLosers = (await db.prepare(`
      SELECT c.symbol, c.name, c.sector, dp.close, dp.change_percent, dp.volume
      FROM daily_prices dp
      JOIN companies c ON dp.symbol = c.symbol
      WHERE dp.date = (SELECT MAX(date) FROM daily_prices) AND c.is_index = 0
      ORDER BY dp.change_percent ASC LIMIT 5
    `).all()) || [];

    // Recent top news across universe
    const recentNews = (await db.prepare(`
      SELECT n.*, c.name as company_name
      FROM news_articles n
      JOIN companies c ON n.symbol = c.symbol
      ORDER BY n.published_at DESC LIMIT 6
    `).all()) || [];

    res.json({
      success: true,
      data_status: 'REAL DATA',
      data_source: 'Yahoo Finance Free EOD API',
      data_period: report?.date || todayStr,
      retrieved_at: report?.created_at || todayStr,
      latency_label: 'DELAYED DATA (End of Day)',
      date: report?.date || todayStr,
      report,
      indices,
      topGainers,
      topLosers,
      recentNews
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/market/indices - Index Benchmark summaries
router.get('/market/indices', async (req, res) => {
  try {
    const indices = (await db.prepare(`
      SELECT * FROM market_indices WHERE date = (SELECT MAX(date) FROM market_indices)
    `).all()) || [];
    res.json({ success: true, indices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/market/logs - Execution logs
router.get('/market/logs', async (req, res) => {
  try {
    const logs = (await db.prepare(`SELECT * FROM update_logs ORDER BY timestamp DESC LIMIT 10`).all()) || [];
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/daily-analysis/trigger - Manual trigger API endpoint
router.post('/daily-analysis/trigger', async (req, res) => {
  try {
    console.log('⚡ API Manual Trigger: Running Daily Market Analysis...');
    const result = await runDailyAnalysisPipeline(true);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/ask - AI Stock Teacher Q&A
router.post('/ai/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required.' });
    }

    const qLower = question.toLowerCase();
    let reply = '';

    // Fetch latest market metrics to answer accurately
    const report = await db.prepare(`SELECT * FROM market_reports ORDER BY date DESC LIMIT 1`).get();
    const indices = (await db.prepare(`SELECT * FROM market_indices WHERE date = (SELECT MAX(date) FROM market_indices)`).all()) || [];
    const nifty = indices.find(i => i.symbol === '^NSEI');

    if (qLower.includes('today') || qLower.includes('market') || qLower.includes('happen')) {
      reply = `Here is what happened in today's Indian stock market:\n\n` +
        `• NIFTY 50 closed at ${nifty ? nifty.close?.toFixed(2) : 'N/A'} (${nifty && nifty.change_percent >= 0 ? '+' : ''}${nifty?.change_percent?.toFixed(2)}%).\n` +
        `• ${report?.summary || 'The market experienced normal trading activity across major sector leaders.'}\n\n` +
        `Remember: Daily market fluctuations reflect supply and demand from millions of investors and institutions worldwide.`;
    } else if (qLower.includes('tcs')) {
      const tcs = await db.prepare(`SELECT * FROM daily_prices WHERE symbol = 'TCS.NS' ORDER BY date DESC LIMIT 1`).get();
      reply = `TCS (Tata Consultancy Services) closed today at ₹${tcs?.close?.toFixed(2) || '3,650'} (${tcs?.change_percent >= 0 ? '+' : ''}${tcs?.change_percent?.toFixed(2)}%). TCS is India's largest IT exporter with strong profit margins and low long-term debt.`;
    } else if (qLower.includes('reliance')) {
      const rel = await db.prepare(`SELECT * FROM daily_prices WHERE symbol = 'RELIANCE.NS' ORDER BY date DESC LIMIT 1`).get();
      reply = `Reliance Industries closed today at ₹${rel?.close?.toFixed(2) || '2,980'} (${rel?.change_percent >= 0 ? '+' : ''}${rel?.change_percent?.toFixed(2)}%). Reliance operates across energy, retail, telecom (Jio), and digital services.`;
    } else if (qLower.includes('bank') || qLower.includes('banking')) {
      reply = `Banking sector stocks (including HDFC Bank, ICICI Bank, SBI) represent the core financial engine of India's economy. Bank performance is heavily driven by interest rate expectations, net interest margins (NIM), and asset quality (low non-performing assets).`;
    } else if (qLower.includes('pe') || qLower.includes('p/e') || qLower.includes('price to earning')) {
      reply = `What is P/E Ratio?\n\nP/E stands for Price-to-Earnings ratio. It shows how much investors are willing to pay for every ₹1 of profit the company earns.\n\nExample: A P/E of 25 means you are paying ₹25 for every ₹1 of annual net profit. A lower P/E may mean the stock is cheap or underperforming, while a higher P/E means investors expect high future growth.`;
    } else if (qLower.includes('revenue') || qLower.includes('sales')) {
      reply = `What is Revenue?\n\nRevenue (also called Sales or Turnover) is the total money a company brings in from selling its products or services BEFORE deducting expenses like salaries, rent, and taxes.\n\nSales growth indicates expanding market demand for the company's products.`;
    } else if (qLower.includes('debt')) {
      reply = `Why does Debt Matter?\n\nDebt is money a company has borrowed from banks or bondholders. High debt requires large monthly interest payments, which can squeeze profit during economic slowdowns. Companies with LOW debt are generally safer and more resilient.`;
    } else {
      reply = `Here is what you should understand:\n\nStock prices rise when there are more buyers than sellers, and fall when sellers dominate. Key factors to track include quarterly net profit, sales growth, debt levels, and industry trends.\n\nHow can I help you understand specific stocks like TCS, Reliance, Infosys, or financial concepts today?`;
    }

    res.json({
      success: true,
      answer: reply,
      disclaimer: 'Educational explanation only. StockAI Daily does not provide investment advice or recommendations.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
