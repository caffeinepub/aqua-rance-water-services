import { Toaster } from "@/components/ui/sonner";
import { Menu } from "lucide-react";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { AppStateProvider } from "./context/AppStateContext";
import CustomersPage from "./pages/CustomersPage";
import DashboardPage from "./pages/DashboardPage";
import DeliveriesPage from "./pages/DeliveriesPage";
import InventoryPage from "./pages/InventoryPage";
import OrdersPage from "./pages/OrdersPage";

export type Page =
  | "dashboard"
  | "inventory"
  | "customers"
  | "deliveries"
  | "orders";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "inventory":
        return <InventoryPage />;
      case "customers":
        return <CustomersPage />;
      case "deliveries":
        return <DeliveriesPage />;
      case "orders":
        return <OrdersPage />;
    }
  };

  return (
    <AppStateProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile overlay */}
        {sidebarOpen && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: overlay close
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 md:static md:block transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => {
              setCurrentPage(page);
              setSidebarOpen(false);
            }}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border shadow-xs">
            <button
              type="button"
              data-ocid="nav.open_modal_button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <span className="font-bold text-blue-700 text-sm">Aqua Rance</span>
          </div>

          <main className="flex-1 overflow-y-auto">{renderPage()}</main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </AppStateProvider>
  );
}
