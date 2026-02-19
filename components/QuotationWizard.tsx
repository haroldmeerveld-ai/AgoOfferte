
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  AlignmentType, 
  VerticalAlign,
  ShadingType,
  HeadingLevel,
  Header,
  Footer,
  Border,
  ImageRun
} from 'docx';
import { Quotation, LineItem } from '../types';
import QuotationForm from './QuotationForm';
import { QuotationPreview } from './QuotationPreview';
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

  useEffect(() => {
    const handleDateCalculated = (e: any) => {
      const data = e.detail;
      setFormData(prev => {
        const lastIndex = prev.items.length - 1;
        const newItems = [...prev.items];
        newItems[lastIndex] = {
          ...newItems[lastIndex],
          startDate: data.startISO,
          endDate: data.endISO,
          weeks: Math.round(data.weken * 100) / 100
        };
        return { ...prev, items: newItems };
      });
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

  const generatePlainText = () => {
    const today = new Date().toLocaleDateString('nl-NL');
    let text = `OFFERTE: ${formData.number}\nBETREFT: ${formData.subject}\nDATUM: ${today}\n\n`;
    text += "Geachte heer/mevrouw,\n\nOp basis van de verstrekte informatie bieden wij u hierbij onze offerte aan voor de volgende producten:\n\n";
    
    formData.items.forEach(item => {
      const sub = item.weeks * item.hoursPerWeek * item.rate;
      text += `PRODUCT: ${item.productName}\n`;
      text += `TOEKENNING: ${formatDateNL(item.startDate)} t/m ${formatDateNL(item.endDate)}\n`;
      text += `AANTAL WEKEN: ${item.weeks.toFixed(2)}\n`;
      text += `INZET: ${item.hoursPerWeek} uur/week @ ${formatCurrency(item.rate)} p/u\n`;
      text += `SUBTOTAAL: ${formatCurrency(sub)}\n\n`;
    });
    
    text += `TOTAALBEDRAG OFFERTE (BTW VRIJ): ${formatCurrency(totals.total)}\n\n`;
    text += "Wij gaan ervan uit dat dit voorstel aansluit bij uw verwachtingen. Mocht u vragen hebben, dan kunt u uiteraard contact met ons opnemen.\n\n";
    text += "We zien graag uw opdracht tegemoet.\n\n";
    text += "Met vriendelijke groet,\n\nAGO NATURA BV\nG.R. Kolkman\nDirecteur";
    
    return text;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatePlainText()).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const downloadPDF = () => {
    const element = document.getElementById('quotation-document-capture');
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Offerte_AgoNatura_${formData.municipality}_${formData.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    (window as any).html2pdf().from(element).set(opt).save();
  };

  const downloadWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header Row (Logo and Info)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "ago natura", bold: true, size: 48, color: "29543C", font: "Inter" }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 200 },
                        children: [
                          new TextRun({ 
                            text: `${formData.municipality.toUpperCase()} • ${formData.number}`, 
                            color: "FFFFFF", 
                            bold: true,
                            size: 16,
                            shading: { type: ShadingType.SOLID, color: "29543C", fill: "29543C" }
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "AGO NATURA BV", bold: true, color: "29543C", size: 22 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "info@agonatura.nl", color: "666666", size: 20, bold: true })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "AGB JEUGD: 90066472", color: "999999", size: 16, bold: true })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Spacer
          new Paragraph({ spacing: { before: 800, after: 400 } }),

          // Betreft Banner
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 30, color: "29543C" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    margins: { left: 300 },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "BETREFT", bold: true, color: "68A87C", size: 18 })] }),
                      new Paragraph({ 
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 100, after: 200 },
                        children: [new TextRun({ text: formData.subject, bold: true, color: "29543C", size: 40 })] 
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `DATUM: ${formatDateNL(formData.date)}    •    GELDIG TOT: ${formatDateNL(formData.expiryDate)}`, color: "999999", bold: true, size: 18 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Content
          new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: "Geachte heer/mevrouw,", bold: true, size: 22 })] }),
          new Paragraph({ 
            spacing: { before: 200, after: 600 }, 
            children: [
              new TextRun({ text: "Op basis van de verstrekte informatie en de gewenste zorgbehoefte binnen de gemeente ", size: 22 }),
              new TextRun({ text: formData.municipality, bold: true, size: 22 }),
              new TextRun({ text: ", bieden wij u hierbij onze offerte aan voor de onderstaande producten:", size: 22 }),
            ] 
          }),

          // Toekenning Periode Table
          new Paragraph({ 
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "TOEKENNING PERIODE", bold: true, color: "29543C", size: 18 })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: ["PRODUCT", "TOEKENNING START", "TOEKENNING EIND", "AANTAL WEKEN"].map(h => 
                  new TableCell({
                    shading: { type: ShadingType.SOLID, color: "F1F3F2", fill: "F1F3F2" },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ 
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: h, color: "29543C", bold: true, size: 16 })] 
                    })],
                  })
                ),
              }),
              ...formData.items.map(item => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.productName, bold: true, color: "29543C", size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formatDateNL(item.startDate), bold: true, size: 22, color: "000000" })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formatDateNL(item.endDate), bold: true, size: 22, color: "000000" })] })] }),
                  new TableCell({ 
                    shading: { type: ShadingType.SOLID, color: "F9F9F0", fill: "F9F9F0" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.weeks.toFixed(2), bold: true, size: 22, color: "68A87C" })] })] 
                  }),
                ]
              })),
            ],
          }),

          // Spacer
          new Paragraph({ spacing: { before: 400 } }),

          // Main Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: ["PRODUCT", "AANTAL WEKEN", "UREN/WEEK", "TARIEF IN €", "SUBTOTAAL"].map(h => 
                  new TableCell({
                    shading: { type: ShadingType.SOLID, color: "29543C", fill: "29543C" },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ 
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: h, color: "FFFFFF", bold: true, size: 16 })] 
                    })],
                  })
                ),
              }),
              ...formData.items.map(item => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.productName, bold: true, color: "29543C", size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.weeks.toFixed(2), size: 20, color: "666666" })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.hoursPerWeek.toString(), size: 20, color: "666666" })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formatCurrency(item.rate).replace('€', '').trim(), size: 20, color: "666666" })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatCurrency(item.weeks * item.hoursPerWeek * item.rate), bold: true, color: "29543C", size: 20 })] })] }),
                ]
              })),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 4,
                    shading: { type: ShadingType.SOLID, color: "29543C", fill: "29543C" },
                    children: [new Paragraph({ 
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ text: "TOTAALBEDRAG OFFERTE (BTW VRIJ)", color: "FFFFFF", bold: true, size: 18 })] 
                    })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.SOLID, color: "29543C", fill: "29543C" },
                    children: [new Paragraph({ 
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ text: formatCurrency(totals.total), color: "FFFFFF", bold: true, size: 24 })] 
                    })],
                  }),
                ]
              })
            ],
          }),

          new Paragraph({ 
            spacing: { before: 200, after: 600 }, 
            children: [new TextRun({ text: "* FACTURATIE VINDT PLAATS OP BASIS VAN WERKELIJK GEREALISEERDE INZET. GENOEMDE BEDRAGEN ZIJN BTW VRIJGESTELD.", size: 14, italics: true, color: "999999" })] 
          }),

          new Paragraph({ children: [new TextRun({ text: "Wij gaan ervan uit dat dit voorstel aansluit bij uw verwachtingen. Mocht u vragen hebben, dan kunt u uiteraard contact met ons opnemen.", size: 22 })] }),
          new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "We zien graag uw opdracht tegemoet.", bold: true, size: 22 })] }),

          new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: "MET VRIENDELIJKE GROET,", bold: true, color: "29543C", size: 18 })] }),

          // Signature Grid
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      ...(formData.signature ? [
                        new Paragraph({
                          children: [
                            new ImageRun({
                              data: Uint8Array.from(atob(formData.signature.split(',')[1]), c => c.charCodeAt(0)),
                              transformation: {
                                width: 150,
                                height: 60,
                              },
                              // @ts-ignore
                              type: 'png'
                            }),
                          ],
                        }),
                      ] : []),
                      new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "G.R. KOLKMAN", bold: true, size: 22 })] }),
                      new Paragraph({ children: [new TextRun({ text: "DIRECTEUR AGO NATURA BV", bold: true, color: "999999", size: 16 })] }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        alignment: AlignmentType.RIGHT, 
                        spacing: { before: 400 },
                        children: [new TextRun({ text: "DATUM ONDERTEKENING", bold: true, color: "999999", size: 16 })] 
                      }),
                      new Paragraph({ 
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: formatDateLong(formData.date), bold: true, color: "29543C", size: 24 })] 
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Remarks Box
          new Paragraph({ spacing: { before: 800 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    margins: { top: 400, bottom: 400, left: 400, right: 400 },
                    shading: { type: ShadingType.SOLID, color: "F9F9F0", fill: "F9F9F0" },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "AANVULLENDE OPMERKINGEN", bold: true, color: "68A87C", size: 18 })] }),
                      new Paragraph({ 
                        spacing: { before: 200 },
                        children: [new TextRun({ text: formData.notes || "Wij vertrouwen erop u hiermee een passend aanbod te hebben gedaan.", italics: true, color: "666666", size: 20 })] 
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Footer
          new Paragraph({ spacing: { before: 1000 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [
                          new TextRun({ text: "KVK: 75199998    •    BTW: NL 8601.44.572.B01    •    AGB: 90066472", color: "999999", size: 14, bold: true })
                        ] 
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: "POSTBUS 2197, 8203 AD LELYSTAD    •    IBAN: NL45 INGB 0006 7446 87", color: "999999", size: 14, bold: true })
                        ] 
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Offerte_AgoNatura_${formData.municipality}_${formData.number}.docx`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-100 overflow-hidden relative">
      {isPlainTextModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
            <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-white"><i className="fa-solid fa-align-left"></i></div>
                <div>
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest">Offertetekst (Inclusief totalen)</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Klaar om te plakken in e-mail of brief</p>
                </div>
              </div>
              <button onClick={() => setIsPlainTextModalOpen(false)} className="p-2 text-gray-300 hover:text-primary transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
            </header>
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 relative group">
                <textarea readOnly value={generatePlainText()} className="w-full h-[400px] bg-transparent border-none focus:ring-0 text-sm font-mono text-brandText leading-relaxed resize-none scrollbar-hide"/>
              </div>
            </div>
            <footer className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button onClick={handleCopyToClipboard} className={`flex-1 ${copyFeedback ? 'bg-green-600' : 'bg-secondary'} text-white font-black py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]`}>
                <i className={`fa-solid ${copyFeedback ? 'fa-check' : 'fa-copy'} text-base`}></i>
                {copyFeedback ? 'GEKOPIEERD!' : 'KOPIEER NAAR KLEMBORD'}
              </button>
              <button onClick={() => setIsPlainTextModalOpen(false)} className="px-8 bg-white text-gray-400 font-black rounded-xl border border-gray-200 hover:text-brandText hover:border-gray-300 transition-all uppercase tracking-[0.2em] text-[11px]">Sluiten</button>
            </footer>
          </div>
        </div>
      )}

      {/* Sidebar (Formulier) */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col h-full bg-white border-r border-slate-200 no-print shadow-xl z-20">
        <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl text-white shadow-lg"><i className="fa-solid fa-wand-magic-sparkles text-sm"></i></div>
            <h2 className="text-[11px] font-black text-primary tracking-[0.3em] uppercase">Agonatura offerte tool</h2>
          </div>
          <div className="flex gap-1.5">
            <button onClick={downloadPDF} className="p-2 text-secondary hover:bg-slate-50 rounded-lg transition-all" title="Download PDF"><i className="fa-solid fa-file-pdf text-lg"></i></button>
            <button onClick={downloadWord} className="p-2 text-blue-600 hover:bg-slate-50 rounded-lg transition-all" title="Download Word"><i className="fa-solid fa-file-word text-lg"></i></button>
            <button onClick={onCancel} className="p-2 text-slate-300 hover:text-primary rounded-lg transition-all" title="Terug"><i className="fa-solid fa-arrow-left text-lg"></i></button>
          </div>
        </header>

        <div className="flex bg-slate-50 border-b border-slate-100">
          <button onClick={() => setActiveTab('form')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'form' ? 'border-secondary text-secondary bg-white' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
            <i className="fa-solid fa-file-invoice mr-2"></i>Offerte Formulier
          </button>
          <button onClick={() => setActiveTab('dateTool')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'dateTool' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
            <i className="fa-solid fa-calendar-days mr-2"></i>Weken Tool
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 bg-slate-50/50">
          {activeTab === 'form' ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <QuotationForm 
                data={formData} 
                onMetaChange={updateMeta}
                onItemChange={updateLineItem}
                onAddItem={addLineItem}
                onRemoveItem={removeLineItem}
              />
              
              <div className="mt-8 flex flex-col gap-3">
                <button onClick={downloadPDF} className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-secondary transition-all shadow-lg hover:shadow-primary/20 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3">
                  <i className="fa-solid fa-file-pdf text-base"></i>DOWNLOAD PDF
                </button>
                <button onClick={downloadWord} className="w-full bg-blue-700 text-white font-black py-4 rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-700/20 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3">
                  <i className="fa-solid fa-file-word text-base"></i>DOWNLOAD WORD (DOCX)
                </button>
                <button onClick={() => setIsPlainTextModalOpen(true)} className="w-full bg-secondary text-white font-black py-4 rounded-xl hover:bg-primary transition-all shadow-lg hover:shadow-secondary/20 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3">
                  <i className="fa-solid fa-copy text-base"></i>KOPIEER TEKST + TOTALEN
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <DateToolWidget />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto bg-slate-200 p-12 lg:p-16 flex justify-center scroll-smooth print:p-0 print:bg-white custom-scrollbar">
        <div className="relative transform-gpu transition-transform duration-500 origin-top">
          <div className="absolute inset-0 bg-black/5 blur-3xl -z-10 translate-y-12 no-print"></div>
          <div id="quotation-document-capture" className="w-[210mm] bg-white shadow-2xl print:shadow-none">
             <QuotationPreview data={formData} totals={totals} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationWizard;
