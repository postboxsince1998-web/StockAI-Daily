import React from 'react';
import { Database, Clock, ShieldCheck, Tag } from 'lucide-react';

export default function DataSourceBadge({ status = 'REAL DATA', source = 'Yahoo Finance Free EOD API', period, retrievedAt, latency = 'DELAYED DATA (End of Day)' }) {
  const isReal = status === 'REAL DATA';

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      margin: '16px 0',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      fontSize: '0.82rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`badge ${isReal ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '0.75rem' }}>
          <ShieldCheck size={14} /> {status}
        </span>
        <span style={{ color: '#FFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Database size={14} color="var(--accent-cyan)" /> Source: {source}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--text-muted)' }}>
        {period && <span>Data Date: <strong style={{ color: '#FFF' }}>{period}</strong></span>}
        {retrievedAt && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {retrievedAt}</span>}
        <span style={{ color: 'var(--accent-amber)', background: 'rgba(245,158,11,0.12)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
          {latency}
        </span>
      </div>
    </div>
  );
}
