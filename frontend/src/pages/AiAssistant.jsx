import React, { useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! 👋 I am StockAI, your personal market teacher. Ask me anything about today\'s Indian stock market changes, stock movements, or financial concepts!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "What happened in the market today?",
    "Why did TCS stock move?",
    "What happened to banking stocks?",
    "Explain P/E ratio like I'm a beginner",
    "Why does company debt matter?"
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setLoading(true);

    fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query })
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setMessages([...newMsgs, { sender: 'ai', text: d.answer }]);
        } else {
          setMessages([...newMsgs, { sender: 'ai', text: 'I am temporarily unable to fetch market data. Please try again.' }]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMessages([...newMsgs, { sender: 'ai', text: 'Error connecting to StockAI Teacher service.' }]);
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: '20px 0', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
          <Bot size={32} color="var(--accent-purple)" /> StockAI Teacher
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Ask questions in plain English about today's market data and stock movements.</p>
      </div>

      <DisclaimerBanner />

      {/* Suggested Questions */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, margin: '16px 0' }}>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={12} color="var(--accent-purple)" style={{ display: 'inline', marginRight: 4 }} />
            {q}
          </button>
        ))}
      </div>

      {/* Chat Conversation Box */}
      <div className="card" style={{ height: 420, display: 'flex', flexDirection: 'column', padding: 16 }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 10,
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {m.sender === 'ai' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} color="var(--accent-purple)" />
                </div>
              )}

              <div
                style={{
                  background: m.sender === 'user' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'var(--bg-input)',
                  color: m.sender === 'user' ? '#000' : '#FFF',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>StockAI Teacher is analyzing today's data...</div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: 16 }}
            placeholder="Ask a question about today's market..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            style={{
              padding: '0 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-purple)',
              color: '#FFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
