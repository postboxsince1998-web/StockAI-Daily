import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import StockCard from '../components/StockCard';

export default function Explore({ onSelectStock }) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Large Companies', 'Strong Fundamentals', 'High Growth', 'Low Debt'];

  useEffect(() => {
    let url = `/api/companies?category=${encodeURIComponent(activeCategory)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(d => {
        if (d.success) setCompanies(d.companies);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeCategory, search]);

  return (
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Explore Tracked Universe</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Search companies, sectors, and filter by fundamental strengths.</p>

      {/* Search Input */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search company name, symbol or sector (e.g. TCS, Reliance, Banking)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="pill-list">
        {categories.map(cat => (
          <div
            key={cat}
            className={`pill-item ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Filtering company records...</div>
      ) : companies.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No companies found matching your criteria.</div>
      ) : (
        <div className="grid-3">
          {companies.map(stock => (
            <StockCard key={stock.symbol} stock={stock} onClick={onSelectStock} />
          ))}
        </div>
      )}
    </div>
  );
}
