
import React, { useState, useCallback } from 'react';
import { Quotation } from './types';
import { getInitialQuotation } from './constants';
import Dashboard from './components/Dashboard';
import QuotationWizard from './components/QuotationWizard';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [currentQuotation, setCurrentQuotation] = useState<Quotation>(getInitialQuotation());

  const startNewQuotation = useCallback(() => {
    setCurrentQuotation(getInitialQuotation());
    setView('wizard');
  }, []);

  const handleSave = useCallback((quote: Quotation) => {
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
