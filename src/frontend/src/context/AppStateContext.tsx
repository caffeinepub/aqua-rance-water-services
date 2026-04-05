import { type ReactNode, createContext, useContext, useState } from "react";
import type {
  Customer,
  Delivery,
  Order,
  StockMovement,
} from "../data/sampleData";

interface AppState {
  customers: Customer[];
  deliveries: Delivery[];
  orders: Order[];
  stockMovements: StockMovement[];
  setCustomers: (c: Customer[]) => void;
  setDeliveries: (d: Delivery[]) => void;
  setOrders: (o: Order[]) => void;
  setStockMovements: (s: StockMovement[]) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  return (
    <AppStateContext.Provider
      value={{
        customers,
        setCustomers,
        deliveries,
        setDeliveries,
        orders,
        setOrders,
        stockMovements,
        setStockMovements,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
