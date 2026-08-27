import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, TrendingUp, Newspaper, ChevronRight } from 'lucide-react';
import MarketIndexStrip from '../components/MarketIndexStrip';
import StockCard from '../components/StockCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DataSourceBadge from '../components/DataSourceBadge';


export default function Home({ onNavigate, onSelectStock }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/market/today')
      .then(res => res.json())
      .then(d => {
        if (d.success) setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch home data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,242,254,0.1), rgba(139,92,246,0.15))', borderColor: 'rgba(0,242,254,0.3)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--accent-cyan)' }}>
          <Sparkles size={20} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: uppercaseLetter }}>Market Closing Wrap</span>
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Good Evening 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Here's what happened in the Indian stock market today.</p>

        <button
          onClick={() => onNavigate('today')}
          style={{
            marginTop: 18,
            padding: '12px 24px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            color: '#000',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          Read Today's Market Report <ArrowRight size={18} />
        </button>
      </div>

      <DisclaimerBanner />
      <DataSourceBadge
        status={data?.data_status || 'REAL DATA'}
        source={data?.data_source || 'Yahoo Finance Free EOD API'}
        period={data?.data_period || data?.date}
        retrievedAt={data?.retrieved_at}
        latency={data?.latency_label || 'DELAYED DATA (End of Day)'}
      />


      {/* Benchmark Indices */}
      <h2 style={{ fontSize: '1.2rem', margin: '24px 0 12px' }}>Today's Market Benchmarks</h2>
      <MarketIndexStrip indices={data?.indices} />

      {/* Today's Biggest Changes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 16px' }}>
        <h2>Today's Biggest Movers</h2>
        <span onClick={() => onNavigate('explore')} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
          Explore All <ChevronRight size={16} />
        </span>
      </div>

      <div className="grid-3">
        {data?.topGainers?.slice(0, 3).map(stock => (
          <StockCard key={stock.symbol} stock={stock} onClick={onSelectStock} />
        ))}
      </div>

      {/* Important News Feed */}
      <div style={{ margin: '36px 0 20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Newspaper size={20} color="var(--accent-purple)" />
          Important Company News Today
        </h2>

        <div className="grid-2">
          {data?.recentNews?.slice(0, 4).map((news, idx) => (
            <div key={idx} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: 4 }}>
                {news.company_name} • {news.category}
              </div>
              <h4 style={{ fontSize: '0.95rem', color: '#FFF', marginBottom: 8, lineHeight: 1.4 }}>{news.title}</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source: {news.source}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const uppercaseLetter = 'uppercase';
