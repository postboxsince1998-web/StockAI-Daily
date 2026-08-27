import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MarketIndexStrip({ indices }) {
  if (!indices || indices.length === 0) return null;

  return (
    <div className="index-strip">
      {indices.map(idx => {
        const isPositive = (idx.change_percent || 0) >= 0;
        return (
          <div key={idx.symbol} className="index-card">
            <div>
              <div className="index-name">{idx.name}</div>
              <div className="index-val">₹{idx.close ? idx.close.toLocaleString('en-IN') : 'N/A'}</div>
            </div>
            <div className={`badge ${isPositive ? 'badge-green' : 'badge-red'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPositive ? '+' : ''}{idx.change_percent ? idx.change_percent.toFixed(2) : '0.00'}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
