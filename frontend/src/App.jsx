import React, { useState } from 'react';
import { Home as HomeIcon, Calendar, Compass, BookOpen, Bot, TrendingUp } from 'lucide-react';
import Home from './pages/Home';
import Today from './pages/Today';
import Explore from './pages/Explore';
import StockDetail from './pages/StockDetail';
import Learn from './pages/Learn';
import AiAssistant from './pages/AiAssistant';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStock, setSelectedStock] = useState(null);

  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    setActiveTab('stock-detail');
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (tab !== 'stock-detail') {
      setSelectedStock(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={handleNavigate} onSelectStock={handleSelectStock} />;
      case 'today':
        return <Today onSelectStock={handleSelectStock} />;
      case 'explore':
        return <Explore onSelectStock={handleSelectStock} />;
      case 'stock-detail':
        return <StockDetail symbol={selectedStock} onBack={() => handleNavigate('explore')} />;
      case 'learn':
        return <Learn />;
      case 'ai':
        return <AiAssistant />;
      default:
        return <Home onNavigate={handleNavigate} onSelectStock={handleSelectStock} />;
    }
  };

  return (
    <div>
      {/* App Header Bar */}
      <header className="app-header">
        <div className="app-viewport" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
          <div className="brand-container" onClick={() => handleNavigate('home')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="brand-title">StockAI Daily</div>
              <div className="brand-tagline">Understand What Changed Today</div>
            </div>
          </div>

          {/* Desktop Navbar */}
          <nav className="desktop-nav">
            <div className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavigate('home')}>
              <HomeIcon size={16} /> Home
            </div>
            <div className={`nav-link ${activeTab === 'today' ? 'active' : ''}`} onClick={() => handleNavigate('today')}>
              <Calendar size={16} /> Today
            </div>
            <div className={`nav-link ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => handleNavigate('explore')}>
              <Compass size={16} /> Explore
            </div>
            <div className={`nav-link ${activeTab === 'learn' ? 'active' : ''}`} onClick={() => handleNavigate('learn')}>
              <BookOpen size={16} /> Learn
            </div>
            <div className={`nav-link ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => handleNavigate('ai')}>
              <Bot size={16} color="var(--accent-purple)" /> AI Teacher
            </div>
          </nav>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="app-viewport">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <div className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavigate('home')}>
          <HomeIcon size={20} />
          <span>Home</span>
        </div>
        <div className={`mobile-nav-item ${activeTab === 'today' ? 'active' : ''}`} onClick={() => handleNavigate('today')}>
          <Calendar size={20} />
          <span>Today</span>
        </div>
        <div className={`mobile-nav-item ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => handleNavigate('explore')}>
          <Compass size={20} />
          <span>Explore</span>
        </div>
        <div className={`mobile-nav-item ${activeTab === 'learn' ? 'active' : ''}`} onClick={() => handleNavigate('learn')}>
          <BookOpen size={20} />
          <span>Learn</span>
        </div>
        <div className={`mobile-nav-item ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => handleNavigate('ai')}>
          <Bot size={20} color="var(--accent-purple)" />
          <span>AI</span>
        </div>
      </nav>
    </div>
  );
}
