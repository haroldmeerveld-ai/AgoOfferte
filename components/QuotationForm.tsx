
import React from 'react';
import { Quotation, LineItem } from '../types';
import { MUNICIPALITIES, PRODUCTS } from '../constants';

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

  const totalAmount = data.items.reduce((acc, item) => acc + (item.weeks * item.hoursPerWeek * item.rate), 0);

  return (
    <div className="space-y-6">
      {/* 1. INPUTBLOK (AGONATURA BRAND) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-primary border-b border-primary/20 px-4 py-2 flex items-center gap-2">
          <i className="fa-solid fa-pen-to-square text-white"></i>
          <span className="text-xs font-black text-white uppercase tracking-widest">1. INPUTBLOK</span>
        </div>
        
        <div className="p-4 space-y-5">
          {/* Gemeente & Datum */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary uppercase">Gemeente</label>
              <select 
                value={data.municipality}
                onChange={(e) => onMetaChange('municipality', e.target.value)}
                className="excel-input w-full p-2 rounded text-xs font-medium cursor-pointer"
              >
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary uppercase">Datum Offerte</label>
              <input 
                type="date"
                value={data.date}
                onChange={(e) => onMetaChange('date', e.target.value)}
                className="excel-input w-full p-2 rounded text-xs font-medium cursor-pointer"
              />
            </div>
          </div>

          {/* Betreft */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-primary uppercase">Betreft (vrij tekstveld)</label>
            <input 
              type="text"
              value={data.subject}
              onChange={(e) => onMetaChange('subject', e.target.value)}
              className="excel-input w-full p-2 rounded text-xs font-medium"
              placeholder="Bijv. Naam cliënt en dossiernummer"
            />
          </div>

          {/* Product Invoer Rijtjes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-primary uppercase">Productkeuze & Hoeveelheid</label>
            {data.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-1 bg-brandCream/50 p-3 rounded border border-gray-100 items-start">
                {/* Row 1: Product Selection and Delete Button */}
                <div className="col-span-11 mb-2">
                  <select 
                    value={item.productName}
                    onChange={(e) => {
                      const prod = PRODUCTS.find(p => p.name === e.target.value);
                      onItemChange(item.id, 'productName', e.target.value);
                      if (prod) onItemChange(item.id, 'rate', prod.rate);
                    }}
                    className="w-full p-1.5 border border-gray-200 rounded text-[11px] font-bold bg-white cursor-pointer focus:ring-2 focus:ring-secondary outline-none"
                  >
                    {PRODUCTS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1 text-right mt-1.5">
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-300 hover:text-red-600 transition-colors"
                    title="Verwijder regel"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>

                {/* Row 2: Weeks, Hours/Week, and Rate */}
                <div className="col-span-4">
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="Weken"
                      value={item.weeks}
                      onChange={(e) => onItemChange(item.id, 'weeks', parseFloat(e.target.value) || 0)}
                      className="excel-input w-full p-1.5 rounded text-xs text-right pr-10 font-bold"
                    />
                    <span className="absolute right-2 top-1.5 text-[9px] text-primary font-black pointer-events-none uppercase">WKN</span>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="Uren/wk"
                      value={item.hoursPerWeek}
                      onChange={(e) => onItemChange(item.id, 'hoursPerWeek', parseFloat(e.target.value) || 0)}
                      className="excel-input w-full p-1.5 rounded text-xs text-right pr-10 font-bold"
                    />
                    <span className="absolute right-2 top-1.5 text-[9px] text-primary font-black pointer-events-none uppercase">U/W</span>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="relative">
                    <input 
                      type="text"
                      readOnly
                      value={formatCurrency(item.rate)}
                      className="bg-white border border-gray-200 w-full p-1.5 rounded text-xs text-right pr-10 font-bold text-gray-500 cursor-default"
                    />
                    <span className="absolute right-2 top-1.5 text-[9px] text-primary font-black pointer-events-none uppercase">Tarief</span>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={onAddItem}
              className="w-full mt-1 py-3 bg-secondary/10 hover:bg-secondary/20 text-primary rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all border border-secondary/20 shadow-sm"
            >
              <i className="fa-solid fa-plus mr-2"></i> Regel Toevoegen
            </button>
          </div>
        </div>
      </div>

      {/* 2. OFFERTETABEL (BEREKENING - READ ONLY) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden opacity-90 select-none">
        <div className="bg-primary border-b border-gray-900 px-4 py-2 flex items-center gap-2">
          <i className="fa-solid fa-lock text-white/50 text-[10px]"></i>
          <span className="text-xs font-black text-white uppercase tracking-widest">2. OFFERTETABEL (BEVEILIGD)</span>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-brandCream text-primary border-b border-gray-200 font-black">
                <th className="p-2 text-left uppercase tracking-tighter">Product</th>
                <th className="p-2 text-center uppercase tracking-tighter">Weken</th>
                <th className="p-2 text-center uppercase tracking-tighter">Uren/wk</th>
                <th className="p-2 text-right uppercase tracking-tighter">Tarief</th>
                <th className="p-2 text-right uppercase tracking-tighter">Subtotaal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item) => {
                const subtotal = item.weeks * item.hoursPerWeek * item.rate;
                return (
                  <tr key={item.id} className="bg-white">
                    <td className="p-2 font-medium text-gray-700">{item.productName}</td>
                    <td className="p-2 text-center text-gray-400 font-mono">{item.weeks.toFixed(2)}</td>
                    <td className="p-2 text-center text-gray-400 font-mono">{item.hoursPerWeek}</td>
                    <td className="p-2 text-right text-gray-400 font-mono">{formatCurrency(item.rate)}</td>
                    <td className="p-2 text-right font-black text-primary font-mono">{formatCurrency(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-primary text-white font-black">
                <td colSpan={4} className="p-2 text-right uppercase tracking-[0.2em] text-[9px]">Eindtotaal (Excl. BTW)</td>
                <td className="p-2 text-right text-sm font-mono">{formatCurrency(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="bg-gray-50 px-3 py-1 text-[8px] text-gray-400 uppercase text-center italic border-t border-gray-200">
          Alle formules in deze tabel zijn beveiligd en niet handmatig aanpasbaar.
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
