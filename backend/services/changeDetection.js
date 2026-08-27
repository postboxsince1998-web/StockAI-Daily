import db from '../database/db.js';

export function runChangeDetection(symbol, priceRecord, prevPriceRecord, fundamentals, newsArticles = []) {
  const events = [];

  const stmtEvent = db.prepare(`
    INSERT INTO stock_events (symbol, event_type, importance, description, source)
    VALUES (?, ?, ?, ?, ?)
  `);

  if (!priceRecord) return events;

  const changePct = priceRecord.change_percent || 0;
  const absChange = Math.abs(changePct);

  // 1. Large Price Movement
  if (absChange >= 3.0) {
    const importance = absChange >= 5.0 ? 'HIGH' : 'MEDIUM';
    const direction = changePct > 0 ? 'gained' : 'dropped';
    const desc = `Large price movement: Stock ${direction} ${changePct.toFixed(2)}% today.`;
    stmtEvent.run(symbol, 'PRICE_MOVEMENT', importance, desc, 'ChangeDetectionService');
    events.push({ symbol, event_type: 'PRICE_MOVEMENT', importance, description: desc });
  }

  // 2. 52-Week High / Low
  if (priceRecord.high && priceRecord.fifty_two_week_high && priceRecord.high >= priceRecord.fifty_two_week_high * 0.995) {
    const desc = `Stock traded near or at a new 52-week high of ₹${priceRecord.fifty_two_week_high.toFixed(2)}.`;
    stmtEvent.run(symbol, '52W_HIGH', 'HIGH', desc, 'ChangeDetectionService');
    events.push({ symbol, event_type: '52W_HIGH', importance: 'HIGH', description: desc });
  } else if (priceRecord.low && priceRecord.fifty_two_week_low && priceRecord.low <= priceRecord.fifty_two_week_low * 1.005) {
    const desc = `Stock traded near or at a new 52-week low of ₹${priceRecord.fifty_two_week_low.toFixed(2)}.`;
    stmtEvent.run(symbol, '52W_LOW', 'HIGH', desc, 'ChangeDetectionService');
    events.push({ symbol, event_type: '52W_LOW', importance: 'HIGH', description: desc });
  }

  // 3. Volume Spikes
  if (priceRecord.volume && prevPriceRecord && prevPriceRecord.volume) {
    if (priceRecord.volume > prevPriceRecord.volume * 1.8) {
      const desc = `Trading volume spiked over 80% higher compared to the previous trading session.`;
      stmtEvent.run(symbol, 'VOLUME_SPIKE', 'MEDIUM', desc, 'ChangeDetectionService');
      events.push({ symbol, event_type: 'VOLUME_SPIKE', importance: 'MEDIUM', description: desc });
    }
  }

  // 4. Fundamental Shifts
  if (fundamentals) {
    if (fundamentals.profit_growth && fundamentals.profit_growth > 15) {
      const desc = `Strong net profit growth reported at +${fundamentals.profit_growth.toFixed(1)}%.`;
      stmtEvent.run(symbol, 'PROFIT_GROWTH', 'HIGH', desc, 'ChangeDetectionService');
      events.push({ symbol, event_type: 'PROFIT_GROWTH', importance: 'HIGH', description: desc });
    }
    if (fundamentals.debt_to_equity && fundamentals.debt_to_equity < 0.3) {
      const desc = `Low debt-to-equity ratio (${fundamentals.debt_to_equity.toFixed(2)}) indicates conservative financial leverage.`;
      stmtEvent.run(symbol, 'LOW_DEBT', 'LOW', desc, 'ChangeDetectionService');
      events.push({ symbol, event_type: 'LOW_DEBT', importance: 'LOW', description: desc });
    }
  }

  // 5. Important News Events
  for (const news of newsArticles) {
    if (news.category === 'RESULTS' || news.category === 'ACQUISITION' || news.category === 'DEBT' || news.category === 'ORDER') {
      const desc = `Important news (${news.category}): ${news.title}`;
      stmtEvent.run(symbol, 'NEWS_EVENT', 'MEDIUM', desc, 'ChangeDetectionService');
      events.push({ symbol, event_type: 'NEWS_EVENT', importance: 'MEDIUM', description: desc });
    }
  }

  return events;
}
