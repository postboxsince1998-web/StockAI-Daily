export function calculateStockHealth(priceRecord, fundamentals) {
  let score = 50;

  const breakdown = {
    profitability: { status: 'Not available from current source', color: 'yellow', text: 'Data unavailable from free source.' },
    growth: { status: 'Not available from current source', color: 'yellow', text: 'Data unavailable from free source.' },
    debt: { status: 'Not available from current source', color: 'yellow', text: 'Data unavailable from free source.' },
    valuation: { status: 'Not available from current source', color: 'yellow', text: 'Data unavailable from free source.' },
    stability: { status: 'Established', color: 'green', text: 'Tracked Indian listed company.' },
    recentTrend: { status: 'Neutral', color: 'yellow', text: 'Market direction context.' }
  };

  if (!fundamentals) {
    if (priceRecord) {
      if (priceRecord.change_percent > 0) {
        score += 10;
        breakdown.recentTrend = { status: 'Positive', color: 'green', text: 'Trading higher in today session.' };
      } else if (priceRecord.change_percent < 0) {
        score -= 5;
        breakdown.recentTrend = { status: 'Negative', color: 'yellow', text: 'Trading lower in today session.' };
      }
    }
    return { score: Math.min(100, Math.max(10, score)), breakdown };
  }

  let totalScore = 0;
  let evaluatedFields = 0;

  // 1. Profitability (ROE)
  if (fundamentals.roe !== null && fundamentals.roe !== undefined) {
    evaluatedFields++;
    const roe = fundamentals.roe;
    if (roe >= 15) {
      totalScore += 25;
      breakdown.profitability = { status: 'Good', color: 'green', text: `Strong return on equity (${roe.toFixed(1)}%).` };
    } else if (roe >= 8) {
      totalScore += 15;
      breakdown.profitability = { status: 'Moderate', color: 'yellow', text: `Moderate profitability (${roe.toFixed(1)}%).` };
    } else {
      totalScore += 5;
      breakdown.profitability = { status: 'Caution', color: 'red', text: `Low return on equity (${roe.toFixed(1)}%).` };
    }
  }

  // 2. Growth
  if (fundamentals.profit_growth !== null && fundamentals.profit_growth !== undefined) {
    evaluatedFields++;
    const pGrowth = fundamentals.profit_growth;
    if (pGrowth > 10) {
      totalScore += 25;
      breakdown.growth = { status: 'Good', color: 'green', text: `Profit expanding (+${pGrowth.toFixed(1)}%).` };
    } else if (pGrowth >= 0) {
      totalScore += 15;
      breakdown.growth = { status: 'Moderate', color: 'yellow', text: 'Stable earnings.' };
    } else {
      totalScore += 5;
      breakdown.growth = { status: 'Declining', color: 'red', text: 'Earnings contracted.' };
    }
  }

  // 3. Debt
  if (fundamentals.debt_to_equity !== null && fundamentals.debt_to_equity !== undefined) {
    evaluatedFields++;
    const dToE = fundamentals.debt_to_equity;
    if (dToE < 0.5) {
      totalScore += 25;
      breakdown.debt = { status: 'Low Debt', color: 'green', text: `Conservative debt-to-equity (${dToE.toFixed(2)}).` };
    } else if (dToE < 1.2) {
      totalScore += 15;
      breakdown.debt = { status: 'Moderate', color: 'yellow', text: `Manageable leverage (${dToE.toFixed(2)}).` };
    } else {
      totalScore += 5;
      breakdown.debt = { status: 'High Debt', color: 'red', text: `High debt load (${dToE.toFixed(2)}).` };
    }
  }

  // 4. Valuation (PE)
  if (fundamentals.pe_ratio !== null && fundamentals.pe_ratio !== undefined) {
    evaluatedFields++;
    const pe = fundamentals.pe_ratio;
    if (pe > 0 && pe <= 30) {
      totalScore += 25;
      breakdown.valuation = { status: 'Reasonable', color: 'green', text: `Balanced P/E ratio (${pe.toFixed(1)}).` };
    } else if (pe > 30 && pe <= 55) {
      totalScore += 15;
      breakdown.valuation = { status: 'Needs Context', color: 'yellow', text: `Premium valuation P/E (${pe.toFixed(1)}).` };
    } else {
      totalScore += 5;
      breakdown.valuation = { status: 'Expensive', color: 'red', text: `High P/E multiple (${pe.toFixed(1)}).` };
    }
  }

  // 5. Recent Trend
  if (priceRecord && priceRecord.change_percent !== undefined) {
    if (priceRecord.change_percent > 0) {
      totalScore += 10;
      breakdown.recentTrend = { status: 'Positive', color: 'green', text: `Gained ${priceRecord.change_percent.toFixed(2)}% today.` };
    } else {
      totalScore += 5;
      breakdown.recentTrend = { status: 'Soft', color: 'yellow', text: `Declined ${priceRecord.change_percent.toFixed(2)}% today.` };
    }
  }

  score = evaluatedFields > 0 ? Math.min(100, Math.max(10, Math.round(totalScore))) : 50;

  return {
    score,
    disclaimer: 'Educational summary score only. Does not constitute financial advice or investment recommendations.',
    breakdown
  };
}
