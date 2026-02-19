
import React from 'react';
import { Quotation } from '../types';
import { Logo } from './Logo';

interface Totals {
  subtotal: number;
  total: number;
}

interface QuotationPreviewProps {
  data: Quotation;
  totals: Totals;
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({ data, totals }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2 
    }).format(val);
  };

  const formatDateNL = (dateStr: string) => {
    if (!dateStr) return '';
    // If it's YYYY-MM-DD, split it to avoid timezone issues
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      return `${d}-${m}-${y}`;
    }
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const formatDateLong = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const todayStr = formatDateNL(data.date);
  const expiryStr = formatDateNL(data.expiryDate);

  return (
    <div className="p-[20mm] text-[#1A1A1A] bg-white min-h-[297mm] flex flex-col font-sans text-[10pt] leading-relaxed relative">
      
      {/* Header Grid */}
      <div className="grid grid-cols-2 mb-16">
        <div className="space-y-4">
          <Logo className="h-10" />
          <div className="bg-primary px-3 py-1 rounded text-white text-[9px] font-black w-fit tracking-widest uppercase">
            {data.municipality} • {data.number}
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-primary font-black text-sm uppercase">AGO NATURA BV</h2>
          <p className="text-gray-500 text-[10px] font-bold">info@agonatura.nl</p>
          <p className="text-gray-400 text-[8px] font-bold tracking-widest pt-1 uppercase">AGB JEUGD: 90066472</p>
        </div>
      </div>

      {/* Subject Banner Section */}
      <div className="relative mb-14">
        {/* Watermark */}
        <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 text-gray-100 font-mont font-black text-[70pt] opacity-50 pointer-events-none select-none -z-0">
          OFFERTE
        </div>
        
        <div className="relative z-10 pl-6 border-l-[6px] border-primary py-4">
          <span className="text-[9px] font-black text-secondary tracking-[0.2em] uppercase">BETREFT</span>
          <h1 className="text-[22pt] font-black text-primary leading-tight mt-1 mb-4 max-w-[85%]">
            {data.subject}
          </h1>
          <div className="flex gap-8 text-[9px] font-black text-gray-400 uppercase tracking-widest">
            <span>DATUM: {todayStr}</span>
            <span className="text-gray-200">•</span>
            <span>GELDIG TOT: {expiryStr}</span>
          </div>
        </div>
      </div>

      {/* Salutation */}
      <div className="mb-8 space-y-4">
        <p className="font-bold">Geachte heer/mevrouw,</p>
        <p>
          Op basis van de verstrekte informatie en de gewenste zorgbehoefte binnen de gemeente <span className="font-bold">{data.municipality}</span>, bieden wij u hierbij onze offerte aan voor de onderstaande producten:
        </p>
      </div>

      {/* Toekenning Periode Table */}
      <div className="mb-10">
        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">TOEKENNING PERIODE</h3>
        <div className="overflow-hidden rounded-lg border-2 border-primary/20 shadow-sm">
          <table className="w-full text-[10pt] border-collapse">
            <thead>
              <tr className="bg-primary/5 text-primary">
                <th className="py-3 px-5 text-left font-black tracking-widest uppercase text-[8px] border-b border-primary/10">PRODUCT</th>
                <th className="py-3 px-5 text-center font-black tracking-widest uppercase text-[8px] border-b border-primary/10">TOEKENNING START</th>
                <th className="py-3 px-5 text-center font-black tracking-widest uppercase text-[8px] border-b border-primary/10">TOEKENNING EIND</th>
                <th className="py-3 px-5 text-center font-black tracking-widest uppercase text-[8px] border-b border-primary/10">AANTAL WEKEN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {data.items.map((item) => (
                <tr key={item.id} className="bg-white">
                  <td className="py-4 px-5 font-bold text-primary">{item.productName}</td>
                  <td className="py-4 px-5 text-center font-black text-[14pt] text-primary/80">{formatDateNL(item.startDate)}</td>
                  <td className="py-4 px-5 text-center font-black text-[14pt] text-primary/80">{formatDateNL(item.endDate)}</td>
                  <td className="py-4 px-5 text-center font-black text-secondary text-[14pt] bg-secondary/5 border-l border-primary/5">{item.weeks.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Table */}
      <div className="mb-4 overflow-hidden rounded-sm border border-primary/10 shadow-sm">
        <table className="w-full text-[9pt] border-collapse">
          <thead>
            <tr className="bg-primary text-white">
              <th className="py-4 px-5 text-left font-black tracking-widest uppercase text-[8px]">PRODUCT</th>
              <th className="py-4 px-5 text-center font-black tracking-widest uppercase text-[8px]">AANTAL WEKEN</th>
              <th className="py-4 px-5 text-center font-black tracking-widest uppercase text-[8px]">UREN/WEEK</th>
              <th className="py-4 px-5 text-center font-black tracking-widest uppercase text-[8px]">TARIEF IN €</th>
              <th className="py-4 px-5 text-right font-black tracking-widest uppercase text-[8px]">SUBTOTAAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((item) => (
              <tr key={item.id}>
                <td className="py-5 px-5 font-black text-primary text-[10pt]">{item.productName}</td>
                <td className="py-5 px-5 text-center text-gray-500 font-medium text-[11pt]">{item.weeks.toFixed(2)}</td>
                <td className="py-5 px-5 text-center text-gray-500 font-medium text-[11pt]">{item.hoursPerWeek}</td>
                <td className="py-5 px-5 text-center text-gray-500 font-medium text-[11pt]">{formatCurrency(item.rate).replace('€', '').trim()}</td>
                <td className="py-5 px-5 text-right font-black text-primary text-[11pt]">{formatCurrency(item.weeks * item.hoursPerWeek * item.rate)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-primary text-white border-t-2 border-primary">
              <td colSpan={4} className="py-5 px-5 text-right font-black uppercase tracking-[0.1em] text-[10px]">
                TOTAALBEDRAG OFFERTE (BTW VRIJ)
              </td>
              <td className="py-5 px-5 text-right font-black text-[14pt] border-l border-white/20">
                {formatCurrency(totals.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Table Legend */}
      <p className="text-[7px] text-gray-400 italic mb-12 uppercase tracking-widest">
        * FACTURATIE VINDT PLAATS OP BASIS VAN WERKELIJK GEREALISEERDE INZET. GENOEMDE BEDRAGEN ZIJN BTW VRIJGESTELD.
      </p>

      {/* Closing Section */}
      <div className="mb-14 space-y-12">
        <div className="max-w-2xl space-y-4">
          <p>
            Wij gaan ervan uit dat dit voorstel aansluit bij uw verwachtingen. Mocht u vragen hebben, dan kunt u uiteraard contact met ons opnemen.
          </p>
          <p className="font-bold">
            We zien graag uw opdracht tegemoet.
          </p>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="font-black text-primary text-[9pt] uppercase tracking-widest mb-4">MET VRIENDELIJKE GROET,</h3>
            <div className="pt-6 relative">
              {data.signature && (
                <div className="absolute -top-12 left-0 w-48 h-20 pointer-events-none">
                  <img src={data.signature} alt="Handtekening" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              )}
              <p className="font-black text-sm uppercase leading-tight">G.R. KOLKMAN</p>
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">DIRECTEUR AGO NATURA BV</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">DATUM ONDERTEKENING</p>
            <p className="font-black text-[14pt] text-primary">{formatDateLong(data.date)}</p>
          </div>
        </div>
      </div>

      {/* Remarks / Box */}
      <div className="mb-20">
        <div className="bg-brandCream p-8 rounded-2xl relative border border-brandCream/20">
          <i className="fa-solid fa-quote-right absolute top-4 right-6 text-gray-200 text-4xl opacity-50"></i>
          <h4 className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] mb-4">AANVULLENDE OPMERKINGEN</h4>
          <p className="italic text-gray-600 font-medium pr-12">
            {data.notes || "Wij vertrouwen erop u hiermee een passend aanbod te hebben gedaan. Alvast bedankt voor de opdracht."}
          </p>
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-auto pt-6 border-t border-gray-100 flex flex-wrap justify-between gap-y-2 text-[7px] text-gray-400 font-bold uppercase tracking-[0.15em]">
        <div className="flex gap-6">
          <span>KVK: 75199998</span>
          <span>BTW: NL 8601.44.572.B01</span>
          <span>AGB: 90066472</span>
        </div>
        <div className="flex gap-6">
          <span>POSTBUS 2197, 8203 AD LELYSTAD</span>
          <span>IBAN: NL45 INGB 0006 7446 87</span>
          <span>DOC ID: {data.number}</span>
        </div>
      </div>
    </div>
  );
};
