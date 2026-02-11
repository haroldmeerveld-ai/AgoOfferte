
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Quotation, LineItem } from '../types';
import QuotationForm from './QuotationForm';
import QuotationPreview from './QuotationPreview';
import DateToolWidget from './DateToolWidget';

interface QuotationWizardProps {
  quotation: Quotation;
  onSave: (quote: Quotation) => void;
  onCancel: () => void;
}

const QuotationWizard: React.FC<QuotationWizardProps> = ({ quotation, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Quotation>(quotation);
  const [isPlainTextModalOpen, setIsPlainTextModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'dateTool'>('form');

  // Listener for Date Tool events
  useEffect(() => {
    const handleDateCalculated = (e: any) => {
      const data = e.detail;
      // We update the last item in the list with the calculated weeks
      setFormData(prev => {
        const lastIndex = prev.items.length - 1;
        const newItems = [...prev.items];
        newItems[lastIndex] = {
          ...newItems[lastIndex],
          startDate: data.startISO,
          endDate: data.endISO,
          weeks: Math.round(data.weken * 100) / 100 // rounding for safety
        };
        return { ...prev, items: newItems };
      });
      // Automatically switch back to form after selection
      if (data.weken % 1 === 0) {
         setActiveTab('form');
      }
    };

    document.addEventListener('periodeBerekend', handleDateCalculated);
    return () => document.removeEventListener('periodeBerekend', handleDateCalculated);
  }, []);

  const totals = useMemo(() => {
    const subtotal = formData.items.reduce((acc, item) => acc + (item.weeks * item.hoursPerWeek * item.rate), 0);
    return { subtotal, total: subtotal };
  }, [formData.items]);

  const updateMeta = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      productName: 'Begeleiding Indiv. Basis',
      startDate: formData.items[formData.items.length - 1]?.startDate || formData.date,
      endDate: formData.items[formData.items.length - 1]?.endDate || '',
      weeks: 1,
      hoursPerWeek: 1,
      rate: 93.33
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeLineItem = (id: string) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(val);
  };

  const generatePlainText = () => {
    const today = new Date().toLocaleDateString('nl-NL');
    
    let text = "Geachte gemeente,\n\n";
    text += "Op uw verzoek sturen wij u hierbij onze offerte voor de volgende producten.\n\n";
    
    formData.items.forEach(item => {
      const sub = item.weeks * item.hoursPerWeek * item.rate;
      text += `${item.productName}: ${item.hoursPerWeek} uur per week, ${item.weeks} weken à ${formatCurrency(item.rate)} – subtotaal ${formatCurrency(sub)}\n`;
    });
    
    text += `\nTotaalbedrag: ${formatCurrency(totals.total)}\n\n`;
    text += "Wij vertrouwen erop u hiermee een passend aanbod te hebben gedaan.\nAlvast bedankt voor de opdracht.\n\n";
    text += "Met vriendelijke groet,\n\nAgoNatura BV\nNaam: G.R. Kolkman\nDatum: " + today;
    
    return text;
  };

  const handleCopyToClipboard = () => {
    const text = generatePlainText();
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const dataRows = [
      ["OFFERTE EXPORT - AGONATURA"],
      ["Gemeente", formData.municipality],
      ["Datum", formData.date],
      ["Betreft", formData.subject],
      ["Auteur", "G.R. Kolkman"],
      [],
      ["OFFERTETABEL (BEREKEND)"],
      ["Product", "Aantal weken", "Uren/week", "Tarief in €", "Subtotaal"],
      ...formData.items.map(item => [
        item.productName, 
        item.weeks,
        item.hoursPerWeek, 
        item.rate, 
        item.weeks * item.hoursPerWeek * item.rate
      ]),
      [],
      ["TOTAALBEDRAG", "", "", "", totals.total]
    ];
    const ws = XLSX.utils.aoa_to_sheet(dataRows);
    ws['!cols'] = [{wch: 35}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, ws, "Offerte");
    XLSX.writeFile(wb, `Offerte_${formData.municipality}_${formData.number}.xlsx`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden relative">
      {/* Plain Text Export Modal */}
      {isPlainTextModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
            <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-white">
                  <i className="fa-solid fa-align-left"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest">Offertetekst (Kaal)</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Klaar om te plakken in briefpapier</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPlainTextModalOpen(false)}
                className="p-2 text-gray-300 hover:text-primary transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </header>
            
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="bg-brandCream border border-gray-200 rounded-2xl p-6 relative group">
                <textarea 
                  readOnly
                  value={generatePlainText()}
                  className="w-full h-[400px] bg-transparent border-none focus:ring-0 text-sm font-mono text-brandText leading-relaxed resize-none scrollbar-hide"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <i className="fa-solid fa-i-cursor text-gray-300"></i>
                </div>
              </div>
            </div>

            <footer className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button 
                onClick={handleCopyToClipboard}
                className={`flex-1 ${copyFeedback ? 'bg-green-600' : 'bg-secondary'} text-white font-black py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]`}
              >
                <i className={`fa-solid ${copyFeedback ? 'fa-check' : 'fa-copy'} text-base`}></i>
                {copyFeedback ? 'GEKOPIEERD!' : 'KOPIEER NAAR KLEMBORD'}
              </button>
              <button 
                onClick={() => setIsPlainTextModalOpen(false)}
                className="px-8 bg-white text-gray-400 font-black rounded-xl border border-gray-200 hover:text-brandText hover:border-gray-300 transition-all uppercase tracking-[0.2em] text-[11px]"
              >
                Sluiten
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Sidebar: Form & Controls */}
      <div className="w-full lg:w-[500px] flex flex-col h-full bg-slate-100 border-r border-gray-300 no-print shadow-2xl z-20">
        <header className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-white shadow-md">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h2 className="text-sm font-black text-primary tracking-[0.2em] uppercase">Agonatura offerte tool</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToExcel}
              className="p-2 text-primary hover:bg-brandCream rounded-lg transition-all"
              title="Download Excel"
            >
              <i className="fa-solid fa-file-excel text-lg"></i>
            </button>
            <button 
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-primary rounded-lg transition-all"
              title="Terug naar Dashboard"
            >
              <i className="fa-solid fa-arrow-left text-lg"></i>
            </button>
          </div>
        </header>

        {/* Tab switcher */}
        <div className="flex bg-white border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'form' ? 'border-secondary text-secondary bg-brandCream/30' : 'border-transparent text-gray-400 hover:bg-gray-50'}`}
          >
            <i className="fa-solid fa-file-invoice mr-2"></i>
            Offerte Formulier
          </button>
          <button 
            onClick={() => setActiveTab('dateTool')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'dateTool' ? 'border-primary text-primary bg-brandCream/30' : 'border-transparent text-gray-400 hover:bg-gray-50'}`}
          >
            <i className="fa-solid fa-calendar-days mr-2"></i>
            Weken Tool
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'form' ? (
            <>
              <QuotationForm 
                data={formData} 
                onMetaChange={updateMeta}
                onItemChange={updateLineItem}
                onAddItem={addLineItem}
                onRemoveItem={removeLineItem}
              />
              
              <div className="mt-6 bg-primary rounded-2xl p-6 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border-t-4 border-secondary overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex justify-between items-center mb-2 relative z-10">
                   <div className="text-[10px] font-black uppercase opacity-60 tracking-[0.25em]">Definitief Totaal</div>
                   <div className="bg-secondary text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">Valide</div>
                </div>
                <div className="text-4xl font-black tabular-nums tracking-tighter relative z-10 flex items-baseline gap-1">
                   <span className="text-xl font-bold opacity-40">€</span>
                   {new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2 }).format(totals.total)}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setIsPlainTextModalOpen(true)}
                  className="w-full bg-secondary text-white font-black py-5 rounded-xl hover:bg-primary transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 border-primary/20"
                >
                  <i className="fa-solid fa-copy text-base"></i>
                  KOPIEER TEKST (KAAL)
                </button>

                <button 
                  onClick={onCancel}
                  className="w-full bg-white text-gray-400 font-black py-4 rounded-xl border border-gray-200 hover:text-brandText hover:border-gray-300 transition-all uppercase tracking-[0.2em] text-[11px]"
                >
                  Klaar / Terug naar overzicht
                </button>
              </div>
            </>
          ) : (
            <DateToolWidget />
          )}
          
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Controle Checklist</p>
            <div className="mt-2 flex justify-center gap-3">
              <i className="fa-solid fa-check text-secondary text-xs"></i>
              <span className="text-[10px] text-gray-500 font-medium">Invoer gecontroleerd</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area: Document Preview */}
      <div className="flex-1 h-full p-12 overflow-y-auto bg-slate-200 flex justify-center scroll-smooth print:p-0 print:bg-white">
        <div id="quotation-document-capture" className="w-full max-w-[800px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] bg-white origin-top transition-all duration-700 hover:shadow-2xl print:shadow-none print:max-w-none print:m-0">
           <QuotationPreview data={formData} totals={totals} />
        </div>
      </div>
    </div>
  );
};

export default QuotationWizard;
