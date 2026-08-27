import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, ShieldCheck, Activity, Newspaper, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DataSourceBadge from '../components/DataSourceBadge';

export default function StockDetail({ symbol, onBack }) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    fetch(`/api/companies/${encodeURIComponent(symbol)}`)
      .then(res => res.json())
      .then(d => {
        if (d.success) setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [symbol]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading {symbol} detailed analysis...</div>;
  }

  if (!data || !data.company) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Company Information Unavailable</h2>
        <button onClick={onBack} style={{ marginTop: 16, padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>Back</button>
      </div>
    );
  }

  const { company, price, multiPeriodChanges, history, fundamentals, news, events, health, aiAnalysis } = data;
  const changePct = price?.change_percent || 0;
  const isPositive = changePct >= 0;

  // Simple SVG sparkline graph renderer for historical prices
  const renderSparkline = () => {
    if (!history || history.length < 2) return null;
    const closes = history.map(h => h.close).filter(Boolean);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;

    const width = 600;
    const height = 140;

    const points = closes.map((val, idx) => {
      const x = (idx / (closes.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 20) - 10;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="card" style={{ padding: 16, margin: '20px 0' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>30-Day Historical Price Trend</div>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '140px', overflow: 'visible' }}>
          <polyline
            fill="none"
            stroke={isPositive ? '#10B981' : '#F43F5E'}
            strokeWidth="3"
            points={points}
          />
        </svg>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--accent-cyan)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 16
        }}
      >
        <ArrowLeft size={18} /> Back to List
      </button>

      {/* Main Stock Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#FFF' }}>{company.name}</h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {company.symbol.replace('.NS', '')} • {company.exchange} • {company.sector}
            </div>
          </div>

          <div className={`badge ${isPositive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '1rem', padding: '6px 14px' }}>
            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {isPositive ? '+' : ''}{changePct.toFixed(2)}% Today
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>CURRENT CLOSING PRICE</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>₹{price?.close ? price.close.toFixed(2) : 'N/A'}</div>
        </div>

        {/* Multi-Period Performance */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>Multi-Period Returns</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Today</div>
              <div style={{ fontWeight: 800, color: changePct >= 0 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>{changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>This Week</div>
              <div style={{ fontWeight: 800, color: (multiPeriodChanges?.thisWeek || 0) >= 0 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                {(multiPeriodChanges?.thisWeek || 0) >= 0 ? '+' : ''}{(multiPeriodChanges?.thisWeek || 0).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>This Month</div>
              <div style={{ fontWeight: 800, color: (multiPeriodChanges?.thisMonth || 0) >= 0 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                {(multiPeriodChanges?.thisMonth || 0) >= 0 ? '+' : ''}{(multiPeriodChanges?.thisMonth || 0).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>3 Months</div>
              <div style={{ fontWeight: 800, color: (multiPeriodChanges?.threeMonths || 0) >= 0 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                {(multiPeriodChanges?.threeMonths || 0) >= 0 ? '+' : ''}{(multiPeriodChanges?.threeMonths || 0).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>1 Year</div>
              <div style={{ fontWeight: 800, color: (multiPeriodChanges?.oneYear || 0) >= 0 ? 'var(--accent-emerald)' : 'var(--accent-red)' }}>
                {(multiPeriodChanges?.oneYear || 0) >= 0 ? '+' : ''}{(multiPeriodChanges?.oneYear || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerBanner />
      <DataSourceBadge
        status={data?.data_status || 'REAL DATA'}
        source={data?.data_source || 'Yahoo Finance Free EOD API'}
        period={data?.data_period || price?.date}
        retrievedAt={data?.retrieved_at || price?.retrieved_at}
        latency={data?.latency_label || 'DELAYED DATA (End of Day)'}
      />


      {/* Price Trend Chart */}
      {renderSparkline()}

      {/* What Changed Today? */}
      <div className="card" style={{ margin: '20px 0' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-cyan)', marginBottom: 12 }}>
          <Activity size={20} /> What Changed Today?
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#FFF' }}>
          {aiAnalysis?.important_changes || `${company.name} traded at ₹${price?.close} today with active volume.`}
        </p>

        {events && events.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Detected Events:</div>
            {events.map((ev, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 'var(--radius-sm)', marginBottom: 6, fontSize: '0.85rem' }}>
                • <strong>[{ev.importance}]</strong> {ev.description}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Health Educational Score */}
      <div className="card" style={{ margin: '20px 0' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-cyan)', marginBottom: 12 }}>
          <ShieldCheck size={22} /> Educational Stock Health
        </h3>

        <div className="health-score-container">
          <div className="health-gauge">
            <span className="health-num">{health?.score || 70}</span>
            <span className="health-label">/ 100</span>
          </div>

          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>Health Score: {health?.score || 70}/100</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', marginTop: 4 }}>
              Educational summary score based on debt, profitability, and growth. Not an investment recommendation.
            </div>
          </div>
        </div>

        {health?.breakdown && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 16 }}>
            {Object.entries(health.breakdown).map(([key, item]) => (
              <div key={key} style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8rem', textTransform: uppercaseLetter, color: 'var(--text-muted)' }}>{key}</span>
                  <span className={`badge badge-${item.color}`}>{item.status}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#FFF' }}>{item.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fundamentals Translated */}
      <div className="card" style={{ margin: '20px 0' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-purple)', marginBottom: 12 }}>
          <FileText size={20} /> Beginner Fundamentals Breakdown
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#FFF' }}>
          {aiAnalysis?.fundamental_summary || 'Fundamentals show sales, profit, and debt health.'}
        </p>

        {fundamentals ? (
          <div className="grid-3" style={{ marginTop: 16 }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>VALUATION (P/E RATIO)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {fundamentals.pe_ratio !== null && fundamentals.pe_ratio !== undefined ? fundamentals.pe_ratio.toFixed(1) : 'Not available'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {fundamentals.pe_ratio !== null && fundamentals.pe_ratio !== undefined ? (fundamentals.pe_ratio > 30 ? '🟡 Premium valuation' : '🟢 Balanced valuation') : 'Not available from current source'}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>PROFIT GROWTH</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {fundamentals.profit_growth !== null && fundamentals.profit_growth !== undefined ? `${fundamentals.profit_growth >= 0 ? '+' : ''}${fundamentals.profit_growth.toFixed(1)}%` : 'Not available'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {fundamentals.profit_growth !== null && fundamentals.profit_growth !== undefined ? (fundamentals.profit_growth >= 0 ? '🟢 Earnings expanding' : '🔴 Earnings contracted') : 'Not available from current source'}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>DEBT TO EQUITY</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {fundamentals.debt_to_equity !== null && fundamentals.debt_to_equity !== undefined ? fundamentals.debt_to_equity.toFixed(2) : 'Not available'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {fundamentals.debt_to_equity !== null && fundamentals.debt_to_equity !== undefined ? (fundamentals.debt_to_equity < 0.5 ? '🟢 Low debt' : '🟡 Moderate debt') : 'Not available from current source'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Fundamental ratios not available from current free source.
          </div>
        )}

      </div>

      {/* News Feed */}
      {news && news.length > 0 && (
        <div className="card" style={{ margin: '20px 0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Newspaper size={20} color="var(--accent-cyan)" /> Recent News Headlines
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {news.map((item, idx) => (
              <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFF', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source: {item.source} • {item.published_at}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const uppercaseLetter = 'uppercase';
