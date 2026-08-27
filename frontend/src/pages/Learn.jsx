import React from 'react';
import { BookOpen } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Learn() {
  const lessons = [
    {
      title: '1. What is a stock?',
      desc: 'A stock (or share) represents partial ownership in a company. When you buy a stock in TCS or Reliance, you own a tiny piece of that company\'s assets and future profits.'
    },
    {
      title: '2. Why do stock prices change?',
      desc: 'Stock prices change constantly during trading hours based on supply and demand. If more people want to buy a stock than sell it, the price rises. If more people want to sell, the price falls.'
    },
    {
      title: '3. What is Revenue?',
      desc: 'Revenue (also called Sales or Turnover) is the total amount of money a company brings in from selling its products or services BEFORE subtracting expenses like salaries and taxes.'
    },
    {
      title: '4. What is Net Profit?',
      desc: 'Net Profit (the "bottom line") is the actual money left over AFTER the company pays all salaries, rent, taxes, raw materials, and interest on loans. Growing profit is a sign of a healthy business.'
    },
    {
      title: '5. What is Debt & why does it matter?',
      desc: 'Debt is borrowed money from banks or financial markets. Low debt means a company is financially safe and doesn\'t have heavy monthly interest payments. High debt can make a company vulnerable during bad economic times.'
    },
    {
      title: '6. What is the P/E Ratio?',
      desc: 'P/E (Price-to-Earnings ratio) measures how expensive a stock is compared to its annual profit. A P/E of 25 means you pay ₹25 for every ₹1 of profit the company makes per share.'
    },
    {
      title: '7. What is a Dividend?',
      desc: 'A dividend is a portion of profits that a profitable company pays out in cash directly to its shareholders as a reward for holding the stock.'
    },
    {
      title: '8. What is an IPO?',
      desc: 'IPO stands for Initial Public Offering. It is the very first time a private company sells shares to the public to raise funds and get listed on stock exchanges like NSE or BSE.'
    },
    {
      title: '9. What is Market Capitalization?',
      desc: 'Market Cap is the total rupee value of all a company\'s shares combined (Stock Price × Total Shares). It tells you whether a company is Large-Cap, Mid-Cap, or Small-Cap.'
    },
    {
      title: '10. What is a Quarterly Result?',
      desc: 'In India, listed companies must publish their earnings every 3 months (Q1, Q2, Q3, Q4). These reports reveal updated revenue, profit, and debt figures so investors know how the company is performing.'
    },
    {
      title: '11. What is Diversification?',
      desc: 'Diversification means not putting all your eggs in one basket. By investing across different companies and sectors (like IT, Banking, FMCG, Pharma), you lower your risk if one sector performs poorly.'
    },
    {
      title: '12. What is a Balance Sheet?',
      desc: 'A balance sheet is a financial snapshot of what a company owns (Assets) and what it owes (Liabilities/Debt) at a specific point in time.'
    }
  ];

  return (
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
        <BookOpen size={28} color="var(--accent-cyan)" /> Learn Stock Market Concepts
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        Simple, beginner-friendly explanations of financial terms without complex Wall Street jargon.
      </p>

      <DisclaimerBanner />

      <div className="grid-2" style={{ marginTop: 20 }}>
        {lessons.map((item, idx) => (
          <div key={idx} className="lesson-card">
            <h3 className="lesson-title">{item.title}</h3>
            <p className="lesson-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
