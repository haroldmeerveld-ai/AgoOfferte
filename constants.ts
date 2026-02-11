
import { Quotation, LineItem } from './types';

export const MUNICIPALITIES = [
  'Miz', 
  'Almere', 
  'Amsterdam', 
  'Arnhem', 
  'Barneveld', 
  'Huizen', 
  'Noordoostpolder', 
  'Urk', 
  'Zwolle'
];

export const PRODUCTS = [
  { name: 'Begeleiding Indiv. Basis', rate: 93.33 },
  { name: 'Begeleiding Indiv. Spec.', rate: 105.69 },
  { name: 'Vervoer', rate: 35.46 },
  { name: 'Behandeling indiv.', rate: 115.00 },
  { name: 'Behandeling indiv. spec.', rate: 148.00 }
];

const today = new Date().toISOString().split('T')[0];

export const EMPTY_QUOTATION: Quotation = {
  id: '',
  number: 'OFF-' + Math.floor(1000 + Math.random() * 9000),
  date: today,
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  municipality: 'Miz',
  subject: 'Maatwerk niet gecontracteerd cliënt: P. Zwartjes 20251410',
  items: [
    { 
      id: '1', 
      productName: PRODUCTS[0].name, 
      startDate: '2025-12-01', 
      endDate: '2026-06-01', 
      weeks: 20, 
      hoursPerWeek: 10, 
      rate: PRODUCTS[0].rate 
    }
  ],
  notes: 'Wij vertrouwen erop u hiermee een passend aanbod te hebben gedaan. Alvast bedankt voor de opdracht.'
};
