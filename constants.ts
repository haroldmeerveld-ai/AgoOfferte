
import { Quotation, LineItem } from './types';

export const MUNICIPALITIES = [
  'Almere',
  'Amsterdam',
  'Arnhem',
  'Barneveld',
  'Dronten',
  'Elburg',
  'Emmeloord',
  'Ermelo',
  'Harderwijk',
  'Huizen',
  'Noordoostpolder',
  'Nunspeet',
  'Oldebroek',
  'Urk',
  'Zeewolde',
  'Zwolle'
];

export const PRODUCTS = [
  { name: 'Begeleiding Indiv. Basis', rate: 93.33 },
  { name: 'Begeleiding Indiv. Spec.', rate: 97.54 },
  { name: 'Vervoer', rate: 27.14 },
  { name: 'Behandeling indiv.', rate: 115.00 },
  { name: 'Behandeling indiv. spec.', rate: 148.00 }
];

const today = new Date().toISOString().split('T')[0];

export const EMPTY_QUOTATION: Array<Quotation> = []; // Not used directly as a list

export const getInitialQuotation = (): Quotation => {
  const now = new Date();
  const dateStr = now.getFullYear().toString() + 
                 (now.getMonth() + 1).toString().padStart(2, '0') + 
                 now.getDate().toString().padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  return {
    id: '',
    number: `OFF-${dateStr}-${randomSuffix}`,
    date: today,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    municipality: 'Harderwijk',
    subject: 'Maatwerk niet gecontracteerd cliënt: P. Zwartjes 20251410',
    items: [
      { 
        id: '1', 
        productName: 'Begeleiding Indiv. Spec.', 
        startDate: '2026-02-09', 
        endDate: '2026-04-09', 
        weeks: 8.43, 
        hoursPerWeek: 24, 
        rate: 97.54 
      }
    ],
    notes: 'Wij vertrouwen erop u hiermee een passend aanbod te hebben gedaan. Alvast bedankt voor de opdracht.',
    signature: ''
  };
};
