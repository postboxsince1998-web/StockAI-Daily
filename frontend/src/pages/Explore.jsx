import React, { useEffect, useState } from 'react';
import { Search, Globe, Sparkles } from 'lucide-react';
import StockCard from '../components/StockCard';

export default function Explore({ onSelectStock }) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchingOnDemand, setSearchingOnDemand] = useState(false);

  const categories = ['All', 'Large Companies', 'Strong Fundamentals', 'High Growth', 'Low Debt'];

  const fetchCompanies = () => {
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
  };

  useEffect(() => {
    fetchCompanies();
  }, [activeCategory, search]);

  const handleDirectSearch = (symbolToSearch) => {
    const term = (symbolToSearch || search).trim();
    if (!term) return;

    setSearchingOnDemand(true);
    const formattedSymbol = term.toUpperCase().includes('.') ? term.toUpperCase() : `${term.toUpperCase()}.NS`;

    fetch(`/api/companies/${encodeURIComponent(formattedSymbol)}`)
      .then(res => res.json())
      .then(d => {
        setSearchingOnDemand(false);
        if (d.success && d.company) {
          onSelectStock(d.company.symbol);
        } else {
          alert(`Could not locate "${term}" on Indian Stock Exchange (NSE/BSE). Please check the symbol or name.`);
        }
      })
      .catch(err => {
        setSearchingOnDemand(false);
        console.error(err);
        alert(`Error looking up stock "${term}". Please try again.`);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      handleDirectSearch();
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Explore Tracked Universe</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        Search 2,000+ Indian stock market companies (NSE & BSE). Available 24/7 with real-time fundamentals, news, and AI insights.
      </p>

      {/* Search Input Bar with Action Button */}
      <div className="search-container" style={{ marginBottom: 20 }}>
        <div className="search-input-wrapper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search ANY stock (e.g. ZOMATO, SUZLON, HAL, CDSL, TCS, Reliance, Banking)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />
          {search.trim() && (
            <button
              onClick={() => handleDirectSearch()}
              disabled={searchingOnDemand}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-cyan)',
                color: '#000',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {searchingOnDemand ? 'Searching...' : 'Look Up Stock'}
            </button>
          )}
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
      {loading || searchingOnDemand ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          {searchingOnDemand ? '🔍 Discovering & Analyzing Stock from Indian Stock Exchange...' : 'Filtering company records...'}
        </div>
      ) : companies.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', margin: '20px 0' }}>
          <Globe size={40} color="var(--accent-cyan)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#FFF' }}>
            "{search}" not in local cache yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
            StockAI Daily supports all listed companies in the Indian Stock Market 24/7. Click below to automatically register and analyze <strong>{search}</strong> instantly!
          </p>
          <button
            onClick={() => handleDirectSearch()}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-cyan)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Sparkles size={18} /> Discover & Analyze "{search}" Now 24/7
          </button>
        </div>
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
