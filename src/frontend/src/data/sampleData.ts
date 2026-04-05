export interface Customer {
  id: string;
  name: string;
  type: "Retail" | "Company" | "Medium";
  contact: string;
  address: string;
  status: "Active" | "Inactive";
}

export interface Delivery {
  id: string;
  customerId: string;
  customerName: string;
  clientType: "Retail" | "Company" | "Medium";
  date: string; // ISO date string
  gallonsDelivered: number;
  gallonsReturned: number;
  defectiveContainers: number;
  paymentStatus: "Paid" | "Unpaid";
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  clientType: "Retail" | "Company" | "Medium";
  scheduledDate: string;
  quantity: number;
  status: "Pending" | "Delivered" | "Cancelled";
  note?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  category: "FilledGallons" | "EmptyContainers" | "Caps" | "Seals";
  type: "IN" | "OUT";
  quantity: number;
  note?: string;
}

export const initialCustomers: Customer[] = [];
export const initialDeliveries: Delivery[] = [];
export const initialOrders: Order[] = [];
export const initialStockMovements: StockMovement[] = [];
