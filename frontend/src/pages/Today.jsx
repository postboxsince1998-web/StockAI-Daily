import React, { useEffect, useState } from 'react';
import { Calendar, Bot, TrendingUp, TrendingDown, Layers, Zap, Eye, RefreshCw } from 'lucide-react';
import MarketIndexStrip from '../components/MarketIndexStrip';
import StockCard from '../components/StockCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DataSourceBadge from '../components/DataSourceBadge';

export default function Today({ onSelectStock }) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    fetch('/api/market/today')
      .then(res => res.json())
      .then(d => {
        if (d.success) setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading today report:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualTrigger = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/daily-analysis/trigger', { method: 'POST' });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading Today's Market Analysis...</div>;
  }

  const report = data?.report;
  const strongestSectors = report?.strongest_sectors ? JSON.parse(report.strongest_sectors) : [];
  const weakestSectors = report?.weakest_sectors ? JSON.parse(report.weakest_sectors) : [];
  const stocksToWatch = report?.stocks_to_watch ? JSON.parse(report.stocks_to_watch) : [];

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 4 }}>Today's Market</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Calendar size={16} />
            <span>Market Closing Report • {data?.date}</span>
          </div>
        </div>

        <button
          onClick={handleManualTrigger}
          disabled={refreshing}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border-color)',
            color: '#FFF',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Updating...' : 'Refresh Analysis'}
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


      {/* Market Overview Benchmarks */}
      <h3 style={{ fontSize: '1.1rem', margin: '20px 0 10px', color: 'var(--text-muted)' }}>Benchmark Index Overview</h3>
      <MarketIndexStrip indices={data?.indices} />

      {/* Today in One Minute Card */}
      {report?.one_minute_summary && (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(15,23,42,0.95))', borderColor: 'rgba(245,158,11,0.4)', margin: '24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-amber)', fontWeight: 800, marginBottom: 10 }}>
            <Zap size={20} />
            <span style={{ fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today in 1 Minute</span>
          </div>
          <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', color: '#FFF', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {report.one_minute_summary}
          </pre>
        </div>
      )}

      {/* What Happened Today? AI Summary */}
      <div className="ai-box">
        <div className="ai-header">
          <Bot size={22} />
          <span style={{ fontSize: '1.2rem' }}>What Happened Today?</span>
        </div>
        <p style={{ fontSize: '1rem', color: '#FFF', lineHeight: 1.6, marginBottom: 12 }}>
          {report?.summary || 'Market benchmark indices traded actively following key sector announcements and earnings disclosures.'}
        </p>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 'var(--radius-md)', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {report?.market_overview}
        </div>
      </div>

      {/* Sector Performance */}
      <div style={{ margin: '30px 0' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', marginBottom: 14 }}>
          <Layers size={18} color="var(--accent-cyan)" />
          Sector Performance Today
        </h3>

        <div className="grid-2">
          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ color: 'var(--accent-emerald)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={16} /> Strongest Sectors
            </h4>
            {strongestSectors.map((sec, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>{sec.sector}</span>
                <span className="badge badge-green">+{sec.change_percent}%</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ color: 'var(--accent-red)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingDown size={16} /> Weakest Sectors
            </h4>
            {weakestSectors.map((sec, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>{sec.sector}</span>
                <span className="badge badge-red">{sec.change_percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div style={{ margin: '30px 0' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Top Stock Movers</h3>
        <div className="grid-2">
          <div>
            <h4 style={{ color: 'var(--accent-emerald)', marginBottom: 12 }}>Top Gainers Today</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.topGainers?.map(stock => (
                <StockCard key={stock.symbol} stock={stock} onClick={onSelectStock} />
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--accent-red)', marginBottom: 12 }}>Top Losers Today</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.topLosers?.map(stock => (
                <StockCard key={stock.symbol} stock={stock} onClick={onSelectStock} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stocks to Watch */}
      {stocksToWatch.length > 0 && (
        <div style={{ margin: '36px 0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', marginBottom: 16 }}>
            <Eye size={20} color="var(--accent-amber)" />
            Stocks to Watch (Meaningful Changes)
          </h3>

          <div className="grid-3">
            {stocksToWatch.map((item, idx) => (
              <div key={idx} className="card" onClick={() => onSelectStock(item.symbol)} style={{ cursor: 'pointer' }}>
                <h4 style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', marginBottom: 6 }}>{item.symbol.replace('.NS', '')}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
