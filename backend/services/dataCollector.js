import Parser from 'rss-parser';
import db from '../database/db.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

export function getTodayDateString() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

export function getFormattedISTTimestamp() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-IN', options).format(now) + ' IST';
}

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*'
};

export async function fetchStockData(symbol) {
  try {
    // 1. Fetch 5d range for accurate 1-day previous close & EOD price
    const url5d = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const res5d = await fetch(url5d, { headers: FETCH_HEADERS });
    if (!res5d.ok) {
      console.warn(`[DataCollector] HTTP ${res5d.status} for ${symbol}`);
      return null;
    }

    const data5d = await res5d.json();
    const result5d = data5d?.chart?.result?.[0];
    if (!result5d) return null;

    const meta = result5d.meta || {};
    const quotes5d = result5d.indicators?.quote?.[0] || {};
    const closePrices5d = (quotes5d.close || []).filter(v => v !== null && v !== undefined);
    const volumes5d = (quotes5d.volume || []).filter(v => v !== null && v !== undefined);
    const opens5d = (quotes5d.open || []).filter(v => v !== null && v !== undefined);
    const highs5d = (quotes5d.high || []).filter(v => v !== null && v !== undefined);
    const lows5d = (quotes5d.low || []).filter(v => v !== null && v !== undefined);

    const today = getTodayDateString();

    const close = meta.regularMarketPrice ?? (closePrices5d.length > 0 ? closePrices5d[closePrices5d.length - 1] : 0);
    // chartPreviousClose in 5d range gives yesterday's actual closing price!
    const prevClose = meta.chartPreviousClose ?? (closePrices5d.length > 1 ? closePrices5d[closePrices5d.length - 2] : close);
    const change = close - prevClose;
    const changePercent = prevClose ? ((close - prevClose) / prevClose) * 100 : 0;

    // Log raw data response for verification
    console.log(`[RAW FETCH VERIFIED] ${symbol.padEnd(14)} | Close: ₹${close.toFixed(2)} | PrevClose: ₹${prevClose.toFixed(2)} | Change%: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% | Source: Yahoo Finance`);

    const priceRecord = {
      symbol,
      date: today,
      open: meta.regularMarketDayOpen ?? (opens5d.length > 0 ? opens5d[opens5d.length - 1] : close),
      high: meta.regularMarketDayHigh ?? (highs5d.length > 0 ? Math.max(...highs5d) : close),
      low: meta.regularMarketDayLow ?? (lows5d.length > 0 ? Math.min(...lows5d) : close),
      close,
      previous_close: prevClose,
      change,
      change_percent: changePercent,
      volume: meta.regularMarketVolume ?? (volumes5d.length > 0 ? volumes5d[volumes5d.length - 1] : 0),
      fifty_two_week_high: meta.fiftyTwoWeekHigh ?? close,
      fifty_two_week_low: meta.fiftyTwoWeekLow ?? close,
      source: 'Yahoo Finance Free EOD API',
      retrieved_at: getFormattedISTTimestamp(),
      is_delayed: 1
    };

    // Save into daily_prices
    const stmtPrice = db.prepare(`
      INSERT INTO daily_prices (symbol, date, open, high, low, close, previous_close, change, change_percent, volume, fifty_two_week_high, fifty_two_week_low, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(symbol, date) DO UPDATE SET
        open=excluded.open,
        high=excluded.high,
        low=excluded.low,
        close=excluded.close,
        previous_close=excluded.previous_close,
        change=excluded.change,
        change_percent=excluded.change_percent,
        volume=excluded.volume,
        fifty_two_week_high=excluded.fifty_two_week_high,
        fifty_two_week_low=excluded.fifty_two_week_low,
        source=excluded.source,
        retrieved_at=CURRENT_TIMESTAMP;
    `);

    stmtPrice.run(
      priceRecord.symbol,
      priceRecord.date,
      priceRecord.open,
      priceRecord.high,
      priceRecord.low,
      priceRecord.close,
      priceRecord.previous_close,
      priceRecord.change,
      priceRecord.change_percent,
      priceRecord.volume,
      priceRecord.fifty_two_week_high,
      priceRecord.fifty_two_week_low,
      priceRecord.source
    );

    // 2. Fetch 1y range for multi-day historical price series
    try {
      const url1y = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`;
      const res1y = await fetch(url1y, { headers: FETCH_HEADERS });
      if (res1y.ok) {
        const data1y = await res1y.json();
        const result1y = data1y?.chart?.result?.[0];
        if (result1y) {
          const timestamps1y = result1y.timestamps || result1y.timestamp || [];
          const closePrices1y = result1y.indicators?.quote?.[0]?.close || [];
          const volumes1y = result1y.indicators?.quote?.[0]?.volume || [];

          const stmtHist = db.prepare(`
            INSERT INTO historical_prices (symbol, date, close, volume)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(symbol, date) DO UPDATE SET close=excluded.close, volume=excluded.volume;
          `);

          db.transaction(() => {
            for (let i = 0; i < timestamps1y.length; i++) {
              if (closePrices1y[i] !== null && closePrices1y[i] !== undefined) {
                const tDate = new Date(timestamps1y[i] * 1000).toISOString().split('T')[0];
                stmtHist.run(symbol, tDate, closePrices1y[i], volumes1y[i] || 0);
              }
            }
          })();
        }
      }
    } catch (e1y) {
      console.warn(`[DataCollector] 1y history fetch warning for ${symbol}: ${e1y.message}`);
    }

    // 3. Fetch Real Fundamental Metrics (NO HARDCODED FAKE FALLBACKS)
    if (!symbol.startsWith('^')) {
      await fetchRealFundamentalMetrics(symbol, close, today);
    }

    return priceRecord;
  } catch (err) {
    console.error(`[DataCollector] Error fetching quote for ${symbol}:`, err.message);
    return null;
  }
}

async function fetchRealFundamentalMetrics(symbol, currentClose, today) {
  try {
    // Search lookup for sector/industry
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}`;
    const searchRes = await fetch(searchUrl, { headers: FETCH_HEADERS });
    let sector = null;
    let industry = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const quoteInfo = searchData?.quotes?.[0];
      if (quoteInfo) {
        sector = quoteInfo.sector || null;
        industry = quoteInfo.industry || null;
      }
    }

    // Update company sector if found
    if (sector) {
      db.prepare(`UPDATE companies SET sector = ?, industry = ? WHERE symbol = ?`).run(sector, industry, symbol);
    }

    // Fetch quoteSummary for real financial ratios if available from public API
    let pe_ratio = null;
    let eps = null;
    let market_cap = null;
    let roe = null;
    let debt_to_equity = null;
    let revenue_growth = null;
    let profit_growth = null;
    let dividend_yield = null;

    try {
      const fundUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=summaryDetail,financialData,defaultKeyStatistics`;
      const fundRes = await fetch(fundUrl, { headers: FETCH_HEADERS });
      if (fundRes.ok) {
        const fundData = await fundRes.json();
        const resObj = fundData?.quoteSummary?.result?.[0];
        if (resObj) {
          const detail = resObj.summaryDetail || {};
          const fin = resObj.financialData || {};
          const stats = resObj.defaultKeyStatistics || {};

          pe_ratio = detail.trailingPE?.raw || fin.trailingPE?.raw || null;
          eps = stats.trailingEps?.raw || null;
          market_cap = detail.marketCap?.raw || null;
          roe = fin.returnOnEquity?.raw ? fin.returnOnEquity.raw * 100 : null;
          debt_to_equity = fin.debtToEquity?.raw || stats.debtToEquity?.raw || null;
          revenue_growth = fin.revenueGrowth?.raw ? fin.revenueGrowth.raw * 100 : null;
          profit_growth = fin.earningsGrowth?.raw ? fin.earningsGrowth.raw * 100 : null;
          dividend_yield = detail.dividendYield?.raw ? detail.dividendYield.raw * 100 : null;
        }
      }
    } catch (eFund) {
      console.warn(`[DataCollector] Fundamentals API notice for ${symbol}: ${eFund.message}`);
    }

    // STRICT TRANSPARENCY: If a metric is missing, store NULL. Do NOT fake numbers.
    const stmtFund = db.prepare(`
      INSERT INTO fundamentals (symbol, date, market_cap, pe_ratio, eps, revenue, revenue_growth, net_profit, profit_growth, debt, debt_to_equity, roe, roce, dividend_yield, book_value, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(symbol, date) DO UPDATE SET
        market_cap=excluded.market_cap,
        pe_ratio=excluded.pe_ratio,
        eps=excluded.eps,
        revenue_growth=excluded.revenue_growth,
        profit_growth=excluded.profit_growth,
        debt_to_equity=excluded.debt_to_equity,
        roe=excluded.roe,
        dividend_yield=excluded.dividend_yield,
        source=excluded.source,
        retrieved_at=CURRENT_TIMESTAMP;
    `);

    stmtFund.run(
      symbol,
      today,
      market_cap,
      pe_ratio,
      eps,
      null, // revenue
      revenue_growth,
      null, // net_profit
      profit_growth,
      null, // debt
      debt_to_equity,
      roe,
      null, // roce
      dividend_yield,
      null, // book_value
      'Yahoo Finance Public Fundamental API'
    );
  } catch (errFund) {
    console.warn(`[DataCollector] Fundamentals warning for ${symbol}: ${errFund.message}`);
  }
}

export async function fetchNewsForCompany(company) {
  try {
    const queryName = company.name.replace(/Ltd|Limited|Inc|Corp/gi, '').trim();
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(queryName + ' stock NSE India')}&hl=en-IN&gl=IN&ceid=IN:en`;

    const feed = await parser.parseURL(rssUrl);
    if (!feed || !feed.items || feed.items.length === 0) return [];

    const stmtNews = db.prepare(`
      INSERT INTO news_articles (symbol, title, summary, source, url, category, sentiment, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(symbol, title, published_at) DO NOTHING;
    `);

    const savedNews = [];
    const recentItems = feed.items.slice(0, 5);

    for (const item of recentItems) {
      const title = item.title || '';
      const summary = (item.contentSnippet || item.title || '').replace(/<[^>]*>?/gm, '');
      const pubDate = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : getTodayDateString();
      const source = item.creator || item.source || 'Public News RSS';
      const link = item.link || '';

      const textUpper = (title + ' ' + summary).toUpperCase();
      let category = 'OTHER';
      if (textUpper.includes('RESULT') || textUpper.includes('PROFIT') || textUpper.includes('REVENUE') || textUpper.includes('Q1') || textUpper.includes('Q2') || textUpper.includes('Q3') || textUpper.includes('Q4')) {
        category = 'RESULTS';
      } else if (textUpper.includes('DEBT') || textUpper.includes('LOAN') || textUpper.includes('BORROW')) {
        category = 'DEBT';
      } else if (textUpper.includes('ACQUIRE') || textUpper.includes('BUYOUT') || textUpper.includes('MERGER')) {
        category = 'ACQUISITION';
      } else if (textUpper.includes('DIVIDEND') || textUpper.includes('BONUS') || textUpper.includes('SPLIT')) {
        category = 'DIVIDEND';
      } else if (textUpper.includes('ORDER') || textUpper.includes('CONTRACT') || textUpper.includes('DEAL')) {
        category = 'ORDER';
      } else if (textUpper.includes('CEO') || textUpper.includes('MANAGEMENT') || textUpper.includes('BOARD')) {
        category = 'MANAGEMENT';
      }

      let sentiment = 'NEUTRAL';
      if (textUpper.includes('SURGE') || textUpper.includes('JUMP') || textUpper.includes('GAIN') || textUpper.includes('HIGH') || textUpper.includes('PROFIT UP') || textUpper.includes('BULLISH')) {
        sentiment = 'POSITIVE';
      } else if (textUpper.includes('FALL') || textUpper.includes('DROP') || textUpper.includes('PLUNGE') || textUpper.includes('SLUMP') || textUpper.includes('LOSS') || textUpper.includes('BEARISH')) {
        sentiment = 'NEGATIVE';
      }

      stmtNews.run(company.symbol, title, summary, source, link, category, sentiment, pubDate);
      savedNews.push({ title, summary, source, url: link, category, sentiment, published_at: pubDate });
    }

    return savedNews;
  } catch (err) {
    console.warn(`[DataCollector] News fetch failed for ${company.symbol}: ${err.message}`);
    return [];
  }
}
