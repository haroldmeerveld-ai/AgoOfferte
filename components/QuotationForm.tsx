
import React from 'react';
import { Quotation, LineItem } from '../types';
import { MUNICIPALITIES, PRODUCTS } from '../constants';
import SignaturePad from './SignaturePad';

interface QuotationFormProps {
  data: Quotation;
  onMetaChange: (field: string, value: string) => void;
  onItemChange: (id: string, field: keyof LineItem, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ 
  data, 
  onMetaChange, 
  onItemChange, 
  onAddItem, 
  onRemoveItem 
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
  };

  const totalAmount = data.items.reduce((acc, item) => acc + (item.weeks * item.hoursPerWeek * item.rate), 0);

  return (
    <div className="space-y-6">
      {/* 1. INPUTBLOK */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-primary border-b border-primary/20 px-4 py-2 flex items-center gap-2">
          <i className="fa-solid fa-pen-to-square text-white"></i>
          <span className="text-xs font-black text-white uppercase tracking-widest">1. INPUTBLOK</span>
        </div>
        
        <div className="p-4 space-y-5">
          {/* Gemeente & Datum */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary uppercase tracking-wider">Gemeente</label>
              <select 
                value={data.municipality}
                onChange={(e) => onMetaChange('municipality', e.target.value)}
                className="excel-input w-full p-2 rounded text-xs font-semibold cursor-pointer"
              >
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary uppercase tracking-wider">Datum Offerte</label>
              <input 
                type="date"
                value={data.date}
                onChange={(e) => onMetaChange('date', e.target.value)}
                className="excel-input w-full p-2 rounded text-xs font-semibold cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Geldig tot</label>
              <input 
                type="date"
                value={data.expiryDate}
                onChange={(e) => onMetaChange('expiryDate', e.target.value)}
                className="excel-input w-full p-2 rounded text-xs font-semibold cursor-pointer border-secondary/30"
              />
            </div>
          </div>

          {/* Betreft */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-primary uppercase tracking-wider">Betreft (vrij tekstveld)</label>
            <input 
              type="text"
              value={data.subject}
              onChange={(e) => onMetaChange('subject', e.target.value)}
              className="excel-input w-full p-2 rounded text-xs font-semibold"
              placeholder="Bijv. Naam cliënt en dossiernummer"
            />
          </div>

          {/* Product Invoer Rijtjes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-primary uppercase tracking-wider">Productkeuze & Hoeveelheid</label>
            {data.items.map((item) => (
              <div key={item.id} className="bg-brandCream/40 p-3 rounded-lg border border-gray-100 space-y-3">
                {/* Product Selection */}
                <div className="flex items-center gap-2">
                  <select 
                    value={item.productName}
                    onChange={(e) => {
                      const prod = PRODUCTS.find(p => p.name === e.target.value);
                      onItemChange(item.id, 'productName', e.target.value);
                      if (prod) onItemChange(item.id, 'rate', prod.rate);
                    }}
                    className="flex-1 p-2 border border-gray-200 rounded text-[11px] font-bold bg-white cursor-pointer focus:ring-2 focus:ring-secondary outline-none shadow-sm"
                  >
                    {PRODUCTS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                    title="Verwijder regel"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>

                {/* Sub-values Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                      <i className="fa-solid fa-calendar-plus text-[9px] text-secondary"></i>
                      Toekenning Start
                    </label>
                    <input 
                      type="date"
                      value={item.startDate}
                      onChange={(e) => onItemChange(item.id, 'startDate', e.target.value)}
                      className="excel-input w-full p-2.5 rounded-lg text-xs font-black shadow-sm border-secondary/30 focus:border-secondary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                      <i className="fa-solid fa-calendar-check text-[9px] text-red-400"></i>
                      Toekenning Eind
                    </label>
                    <input 
                      type="date"
                      value={item.endDate}
                      onChange={(e) => onItemChange(item.id, 'endDate', e.target.value)}
                      className="excel-input w-full p-2.5 rounded-lg text-xs font-black shadow-sm border-secondary/30 focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="relative group">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="Weken"
                      value={item.weeks}
                      onChange={(e) => onItemChange(item.id, 'weeks', parseFloat(e.target.value) || 0)}
                      className="excel-input w-full p-2 rounded text-xs text-right pr-12 font-bold shadow-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-[8px] text-primary/50 font-black pointer-events-none uppercase">WKN</span>
                  </div>
                  
                  <div className="relative group">
                    <input 
                      type="number"
                      placeholder="Uren/wk"
                      value={item.hoursPerWeek}
                      onChange={(e) => onItemChange(item.id, 'hoursPerWeek', parseFloat(e.target.value) || 0)}
                      className="excel-input w-full p-2 rounded text-xs text-right pr-12 font-bold shadow-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-[8px] text-primary/50 font-black pointer-events-none uppercase">U/W</span>
                  </div>

                  <div className="relative group">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="Tarief"
                      value={item.rate}
                      onChange={(e) => onItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="excel-input w-full p-2 rounded text-xs text-right pr-12 font-bold shadow-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-[8px] text-primary/50 font-black pointer-events-none uppercase">Tarief</span>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={onAddItem}
              className="w-full mt-2 py-3 bg-secondary/10 hover:bg-secondary/20 text-primary rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-secondary/20 shadow-sm flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-plus text-xs"></i> Regel Toevoegen
            </button>
          </div>
        </div>
      </div>

      {/* 2. OFFERTETABEL (BEREKENING - READ ONLY) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden select-none">
        <div className="bg-primary border-b border-gray-900 px-4 py-2 flex items-center gap-2">
          <i className="fa-solid fa-lock text-white/50 text-[10px]"></i>
          <span className="text-xs font-black text-white uppercase tracking-widest">2. OFFERTETABEL (BEVEILIGD)</span>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-brandCream text-primary border-b border-gray-200 font-black">
                <th className="p-2.5 text-left uppercase tracking-tighter">Product</th>
                <th className="p-2.5 text-center uppercase tracking-tighter">Weken</th>
                <th className="p-2.5 text-center uppercase tracking-tighter">Uren/wk</th>
                <th className="p-2.5 text-right uppercase tracking-tighter">Tarief</th>
                <th className="p-2.5 text-right uppercase tracking-tighter">Subtotaal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item) => {
                const subtotal = item.weeks * item.hoursPerWeek * item.rate;
                return (
                  <tr key={item.id} className="bg-white hover:bg-brandCream/10">
                    <td className="p-2.5 font-bold text-gray-700">{item.productName}</td>
                    <td className="p-2.5 text-center text-gray-500 font-mono font-medium">{formatNumber(item.weeks)}</td>
                    <td className="p-2.5 text-center text-gray-500 font-mono font-medium">{formatNumber(item.hoursPerWeek)}</td>
                    <td className="p-2.5 text-right text-gray-500 font-mono font-medium">{formatCurrency(item.rate)}</td>
                    <td className="p-2.5 text-right font-black text-primary font-mono">{formatCurrency(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-primary text-white font-black">
                <td colSpan={4} className="p-3 text-right uppercase tracking-[0.2em] text-[9px] opacity-80">Eindtotaal (Excl. BTW)</td>
                <td className="p-3 text-right text-sm font-mono">{formatCurrency(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="bg-gray-50 px-3 py-1.5 text-[8px] text-gray-400 uppercase text-center font-bold tracking-widest border-t border-gray-200">
          Beveiligde berekeningssectie &middot; Geen handmatige invoer mogelijk
        </div>
      </div>

      {/* 3. HANDTEKENING */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-primary border-b border-primary/20 px-4 py-2 flex items-center gap-2">
          <i className="fa-solid fa-signature text-white"></i>
          <span className="text-xs font-black text-white uppercase tracking-widest">3. DIGITALE HANDTEKENING</span>
        </div>
        <div className="p-4">
          <SignaturePad 
            initialSignature={data.signature}
            onSave={(sig) => onMetaChange('signature', sig)}
            onClear={() => onMetaChange('signature', '')}
          />
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
