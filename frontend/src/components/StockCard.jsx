import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, Tag } from 'lucide-react';

export default function StockCard({ stock, onClick }) {
  const changePct = stock.change_percent || 0;
  const isPositive = changePct >= 0;

  return (
    <div className="card" onClick={() => onClick(stock.symbol)} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#FFF' }}>{stock.name}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stock.symbol.replace('.NS', '')} • {stock.sector}</span>
        </div>
        <div className={`badge ${isPositive ? 'badge-green' : 'badge-red'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? '+' : ''}{changePct.toFixed(2)}%
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TODAY PRICE</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{stock.close ? stock.close.toFixed(2) : 'N/A'}</div>
        </div>

        {stock.health_score !== undefined && stock.health_score !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.25)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
            <ShieldCheck size={14} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Health: {stock.health_score}/100</span>
          </div>
        )}
      </div>
    </div>
  );
}
