import dotenv from 'dotenv';
dotenv.config();

/**
 * Built-in Rule-Based Financial Teacher AI Engine
 * Converts raw structured stock metrics into simple, friendly English explanations.
 */
function generateTeacherCompanyAnalysis(company, priceRecord, fundamentals, events, newsList) {
  const symbolClean = company.name || company.symbol;
  const changePct = priceRecord ? (priceRecord.change_percent || 0) : 0;
  const priceStr = priceRecord ? `₹${priceRecord.close?.toFixed(2)}` : 'N/A';
  const direction = changePct >= 0 ? 'gained' : 'fell';
  const absPctStr = Math.abs(changePct).toFixed(2) + '%';

  // Section 1: Summary / What Happened
  let summary = `${symbolClean} (${company.symbol.replace('.NS', '')}) ${direction} by ${absPctStr} today, closing at ${priceStr}. `;
  if (Math.abs(changePct) > 2.5) {
    summary += `This represents a notable single-day price movement in today's trading session. `;
  } else {
    summary += `The stock traded within a typical daily price range. `;
  }

  // Section 2: Important Changes
  let important_changes = `Today's closing price was ${priceStr} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%). `;
  if (priceRecord?.volume) {
    important_changes += `Trading volume reached ${(priceRecord.volume / 100000).toFixed(2)} Lakh shares. Volume means the total number of shares traded between buyers and sellers today. `;
  }
  if (events && events.length > 0) {
    important_changes += `Key event detected: ${events[0].description} `;
  }

  // Section 3: Fundamental Summary
  let fundamental_summary = 'Fundamentals explain the core financial health of the business: ';
  if (fundamentals) {
    if (fundamentals.pe_ratio) {
      fundamental_summary += `The company currently has a Price-to-Earnings (P/E) ratio of ${fundamentals.pe_ratio.toFixed(1)}. (P/E compares the stock price to how much profit the company makes per share). `;
    }
    if (fundamentals.revenue_growth !== null && fundamentals.revenue_growth !== undefined) {
      fundamental_summary += `Revenue growth is at ${fundamentals.revenue_growth >= 0 ? '+' : ''}${fundamentals.revenue_growth.toFixed(1)}%. `;
    }
    if (fundamentals.debt_to_equity !== null && fundamentals.debt_to_equity !== undefined) {
      const debtDesc = fundamentals.debt_to_equity < 0.5 ? 'low debt' : 'moderate debt';
      fundamental_summary += `The company maintains ${debtDesc} relative to its equity. `;
    }
  } else {
    fundamental_summary += 'Detailed financial fundamental data is currently being updated from public records.';
  }

  // Section 4: News Summary
  let news_summary = 'Recent news highlights: ';
  if (newsList && newsList.length > 0) {
    const topNews = newsList.slice(0, 3);
    news_summary += topNews.map(n => `• ${n.title} (${n.source})`).join(' ');
  } else {
    news_summary += 'No major breaking news reported for this company in today session.';
  }

  // Section 5: Risk Summary
  let risk_summary = `Here is what beginners should keep in mind: Stock prices change daily due to market sentiment, supply and demand, and broader sector trends. A single day move (+${absPctStr}) does not guarantee future direction. Always examine long-term fundamentals rather than short-term price swings.`;

  return {
    summary,
    important_changes,
    risk_summary,
    fundamental_summary,
    news_summary
  };
}

/**
 * Built-in Financial Teacher Engine for Daily Market Overview
 */
function generateTeacherMarketReport(date, indices, gainers, losers, sectors, topNews) {
  const nifty = indices.find(i => i.symbol === '^NSEI');
  const sensex = indices.find(i => i.symbol === '^BSESN');
  const bankNifty = indices.find(i => i.symbol === '^NSEBANK');

  const niftyChange = nifty ? nifty.change_percent : 0;
  const sensexChange = sensex ? sensex.change_percent : 0;

  const marketMood = niftyChange >= 0.5 ? 'strong bullish momentum' : niftyChange <= -0.5 ? 'cautious selling pressure' : 'consolidating in a narrow range';

  const title = `Indian Market Daily Report - ${date}`;

  const summary = `The Indian stock market closed today with ${marketMood}. NIFTY 50 ended at ${nifty ? nifty.close?.toFixed(2) : 'N/A'} (${niftyChange >= 0 ? '+' : ''}${niftyChange?.toFixed(2)}%), while SENSEX closed at ${sensex ? sensex.close?.toFixed(2) : 'N/A'} (${sensexChange >= 0 ? '+' : ''}${sensexChange?.toFixed(2)}%).`;

  const market_overview = `Here is what happened today: Benchmark indices experienced active participation across sectors. ${niftyChange >= 0 ? 'Buying interest in major blue-chip stocks helped lift the overall market index.' : 'Selling pressure in key heavyweights kept benchmark indices under pressure.'} Remember: Index movements represent the collective performance of the top listed companies.`;

  const top_gainers = JSON.stringify(gainers.slice(0, 5));
  const top_losers = JSON.stringify(losers.slice(0, 5));

  const strongest_sectors = JSON.stringify(sectors.filter(s => s.change_percent > 0).slice(0, 3));
  const weakest_sectors = JSON.stringify(sectors.filter(s => s.change_percent < 0).slice(0, 3));

  const important_news = JSON.stringify(topNews.slice(0, 5));

  const fundamental_changes = `Quarterly corporate financial disclosures continue to show strong operational resilience across major IT, Banking, and Consumer companies.`;

  const stocks_to_watch = JSON.stringify(gainers.concat(losers).slice(0, 5).map(s => ({
    symbol: s.symbol,
    reason: `Significant price change today (${s.change_percent >= 0 ? '+' : ''}${s.change_percent?.toFixed(2)}%).`
  })));

  const one_minute_summary = `⚡ TODAY IN 1 MINUTE:
1. Benchmarks: NIFTY (${niftyChange >= 0 ? '+' : ''}${niftyChange?.toFixed(2)}%), SENSEX (${sensexChange >= 0 ? '+' : ''}${sensexChange?.toFixed(2)}%).
2. Top Mover: ${gainers[0] ? `${gainers[0].symbol} (${gainers[0].change_percent >= 0 ? '+' : ''}${gainers[0].change_percent?.toFixed(2)}%)` : 'Market active'}.
3. Sector Focus: Active trading across IT and Financial services.
4. Reminder: Educational market overview only. Price movements reflect daily supply and demand.`;

  return {
    title,
    summary,
    market_overview,
    top_gainers,
    top_losers,
    strongest_sectors,
    weakest_sectors,
    important_news,
    fundamental_changes,
    stocks_to_watch,
    one_minute_summary
  };
}

export async function generateCompanyAnalysis(company, priceRecord, fundamentals, events, newsList) {
  // Use built-in Teacher AI Engine (100% free, reliable, no API key dependency)
  return generateTeacherCompanyAnalysis(company, priceRecord, fundamentals, events, newsList);
}

export async function generateMarketReport(date, indices, gainers, losers, sectors, topNews) {
  return generateTeacherMarketReport(date, indices, gainers, losers, sectors, topNews);
}
