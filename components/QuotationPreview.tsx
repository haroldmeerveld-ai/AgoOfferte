
import React from 'react';
import { Quotation } from '../types';

interface Totals {
  subtotal: number;
  total: number;
}

interface QuotationPreviewProps {
  data: Quotation;
  totals: Totals;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ data, totals }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric', year: 'numeric' });
  };

  const todayStr = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-16 text-gray-800 bg-white min-h-[1123px] flex flex-col shadow-inner select-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-16">
        <div className="flex flex-col gap-4">
          {/* Official Logo Area */}
          <div className="w-64">
            <img 
              src="https://agonatura.nl/wp-content/uploads/2021/04/logo-ago-natura.png" 
              alt="Ago Natura Logo" 
              className="w-full h-auto object-contain"
              onError={(e) => {
                // Fallback if URL fails
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Fallback text if image doesn't load */}
            <div className="font-black text-3xl text-gray-700 tracking-tighter flex items-center gap-2">
               <span className="text-[#29543C]">ago</span> natura
            </div>
          </div>
          <div className="bg-[#29543C] text-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded inline-block self-start">
            {data.municipality} • {data.number}
          </div>
        </div>
        
        <div className="text-right text-[11px] leading-relaxed text-gray-500 font-medium">
          <p className="font-black text-gray-900 text-sm mb-1 uppercase tracking-[0.1em]">Ago Natura BV</p>
          <p>info@agonatura.nl</p>
          <div className="flex items-center justify-end gap-2 mt-1">
             <span className="bg-[#68A87C] text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold">
               <i className="fa-solid fa-phone text-[8px]"></i> 
               06 - 46 76 28 91 (Algemeen)
             </span>
          </div>
          <p className="mt-2 text-[9px] opacity-60 font-bold uppercase tracking-widest">AGB Jeugd: 90066472</p>
        </div>
      </div>

      {/* Document Title & Subject Line */}
      <div className="mb-12 border-l-[8px] border-[#29543C] pl-10 py-4 bg-gray-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <h1 className="text-6xl font-black text-gray-900 uppercase">OFFERTE</h1>
        </div>
        <h3 className="text-[10px] font-black text-[#29543C] uppercase mb-2 tracking-[0.25em]">BETREFT</h3>
        <p className="font-black text-3xl text-gray-900 leading-tight tracking-tight">{data.subject || 'NOG GEEN ONDERWERP'}</p>
        <div className="flex gap-6 mt-3">
           <span className="text-[11px] text-gray-500 uppercase font-black tracking-widest">Datum: {formatDateShort(data.date)}</span>
           <span className="text-[11px] text-gray-300 font-black">•</span>
           <span className="text-[11px] text-gray-500 uppercase font-black tracking-widest">Geldig tot: {formatDateShort(data.expiryDate)}</span>
        </div>
      </div>

      <div className="mb-10">
        <p className="text-sm leading-relaxed font-bold text-gray-900">
          Geachte heer/mevrouw,
        </p>
        <p className="text-sm mt-4 leading-relaxed text-gray-600 font-medium">
          Op basis van de verstrekte informatie en de gewenste zorgbehoefte binnen de gemeente <strong>{data.municipality}</strong>, bieden wij u hierbij onze definitieve offerte aan voor de onderstaande producten:
        </p>
      </div>

      {/* OFFERTETABEL */}
      <div className="mb-10 flex-grow">
        <table className="w-full text-left border-collapse border border-gray-200">
          <thead>
            <tr className="bg-[#29543C] text-white border-b-2 border-[#29543C]">
              <th className="p-4 text-[11px] font-black uppercase tracking-[0.15em]">Product</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-[0.15em] text-center">Aantal weken</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-[0.15em] text-center">Uren/week</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-[0.15em] text-right">Tarief in €</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-[0.15em] text-right">Subtotaal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((item) => {
              const rowTotal = item.weeks * item.hoursPerWeek * item.rate;
              return (
                <tr key={item.id}>
                  <td className="p-4 text-sm font-bold text-gray-900">{item.productName}</td>
                  <td className="p-4 text-sm text-center font-mono text-gray-500">{item.weeks.toFixed(2)}</td>
                  <td className="p-4 text-sm text-center font-mono text-gray-500">{item.hoursPerWeek}</td>
                  <td className="p-4 text-sm text-right font-mono text-gray-500">{formatCurrency(item.rate)}</td>
                  <td className="p-4 text-sm text-right font-black text-gray-900">{formatCurrency(rowTotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#29543C] text-white">
              <td colSpan={4} className="p-5 text-[10px] font-black uppercase tracking-[0.4em] text-right">TOTAALBEDRAG OFFERTE (BTW VRIJ)</td>
              <td className="p-5 text-xl text-right font-black border-l border-white/20 font-mono">{formatCurrency(totals.total)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-4 text-[9px] text-gray-400 italic font-medium uppercase tracking-widest text-right">
          * Facturatie vindt plaats op basis van werkelijk gerealiseerde inzet. Genoemde bedragen zijn BTW vrijgesteld.
        </p>
      </div>

      {/* SLOTBLOK */}
      <div className="mb-12 border-t border-gray-100 pt-10">
        <div className="flex justify-between items-end">
          <div className="space-y-6">
            <p className="text-sm leading-relaxed text-gray-700 font-medium">
              Wij gaan ervan uit dat dit voorstel aansluit bij uw verwachtingen. Mocht u vragen hebben, dan kunt u uiteraard contact met ons opnemen.
            </p>
            <div>
              <p className="text-xs font-black text-[#29543C] uppercase tracking-[0.2em] mb-8">Met vriendelijke groet,</p>
              
              <div className="space-y-2">
                <div className="h-12 w-48 opacity-10 border-b border-gray-200"></div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-widest">G.R. Kolkman</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Directeur Ago Natura BV</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Datum ondertekening</p>
            <p className="text-sm font-black text-gray-900 font-mono">{todayStr}</p>
          </div>
        </div>
      </div>

      {/* Footer / Note Area */}
      <div className="mt-auto">
        {data.notes && (
          <div className="bg-brandCream rounded-xl p-6 mb-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
               <i className="fa-solid fa-quote-right text-4xl"></i>
            </div>
            <h4 className="text-[10px] font-black text-[#29543C] uppercase mb-3 tracking-[0.3em]">Aanvullende opmerkingen</h4>
            <p className="text-xs text-gray-600 italic leading-relaxed whitespace-pre-wrap font-medium">{data.notes}</p>
          </div>
        )}
        
        <div className="pt-8 border-t border-gray-100 text-[8px] text-gray-400 grid grid-cols-3 gap-4 uppercase tracking-[0.1em] font-black">
          <div>
            <p className="text-[#29543C] mb-1">KVK GEGEVENS</p>
            <p>75199998 K.v.K Almere</p>
          </div>
          <div className="text-center">
            <p className="text-[#29543C] mb-1">BANKGEGEVENS</p>
            <p>NL45 INGB 0006 7446 87</p>
            <p>t.n.v. Ago Natura BV Lelystad</p>
          </div>
          <div className="text-right">
            <p className="text-[#29543C] mb-1">IDENTIFICATIE</p>
            <p>AGB: 90066472</p>
            <p>DOC ID: {data.number}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreview;
