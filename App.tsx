
import React, { useState, useCallback } from 'react';
import { Quotation } from './types';
import { EMPTY_QUOTATION } from './constants';
import Dashboard from './components/Dashboard';
import QuotationWizard from './components/QuotationWizard';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [currentQuotation, setCurrentQuotation] = useState<Quotation>(EMPTY_QUOTATION);

  const startNewQuotation = useCallback(() => {
    const newQuote = { 
      ...EMPTY_QUOTATION, 
      id: crypto.randomUUID(),
      number: 'OFF-' + (new Date().getFullYear()) + '-' + Math.floor(1000 + Math.random() * 9000)
    };
    setCurrentQuotation(newQuote);
    setView('wizard');
  }, []);

  const handleSave = useCallback((quote: Quotation) => {
    // We don't actually save anywhere per user request, just return to dashboard
    setView('dashboard');
  }, []);

  const handleCancel = useCallback(() => {
    setView('dashboard');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'dashboard' ? (
        <Dashboard 
          onNewQuotation={startNewQuotation} 
        />
      ) : (
        <QuotationWizard 
          quotation={currentQuotation} 
          onSave={handleSave} 
          onCancel={handleCancel} 
        />
      )}
    </div>
  );
};

export default App;
