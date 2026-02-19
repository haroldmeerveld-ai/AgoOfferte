
import React from 'react';
import { Logo } from './Logo';

interface DashboardProps {
  onNewQuotation: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewQuotation }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[80vh]">
      {/* Hero Section */}
      <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100 flex flex-col items-center max-w-2xl w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-primary"></div>
        
        <div className="mb-8">
          <Logo />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Offerte Tool</h1>
        <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed">
          Ontwerp en beheer professionele offertes in enkele minuten.<br/>
          Start direct met een nieuwe berekening.
        </p>
        
        <button
          onClick={onNewQuotation}
          className="group relative inline-flex items-center gap-6 bg-secondary hover:bg-primary text-white font-black py-6 px-12 rounded-2xl transition-all shadow-2xl hover:shadow-secondary/40 uppercase tracking-widest text-lg active:scale-95"
        >
          <span>NIEUWE OFFERTE</span>
          <i className="fa-solid fa-plus text-xl transition-transform group-hover:rotate-90"></i>
        </button>
      </div>

      <div className="mt-12 flex gap-8 items-center opacity-40 grayscale">
         <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase">Kwaliteit in zorg</span>
      </div>
    </div>
  );
};

export default Dashboard;
