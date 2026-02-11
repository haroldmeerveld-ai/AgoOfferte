
export interface ProductType {
  name: string;
  rate: number;
}

export interface LineItem {
  id: string;
  productName: string;
  startDate: string;
  endDate: string;
  weeks: number;
  hoursPerWeek: number;
  rate: number;
}

export interface Quotation {
  id: string;
  number: string;
  date: string;
  expiryDate: string;
  municipality: string;
  subject: string;
  items: LineItem[];
  notes: string;
}
