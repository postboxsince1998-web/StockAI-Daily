import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner">
      <AlertTriangle size={18} style={{ flexShrink: 0 }} />
      <div>
        <strong>Educational Purpose Only:</strong> StockAI Daily provides beginner market explanations and AI analysis. It is <strong>NOT</strong> financial advice and does not make buy/sell recommendations or guarantee returns.
      </div>
    </div>
  );
}
