import {
  ClipboardList,
  Droplets,
  LayoutDashboard,
  Package,
  Truck,
  Users,
} from "lucide-react";
import type { Page } from "../App";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: {
  page: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { page: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { page: "inventory", label: "Inventory", icon: Package },
  { page: "customers", label: "Customers", icon: Users },
  { page: "deliveries", label: "Deliveries", icon: Truck },
  { page: "orders", label: "Orders", icon: ClipboardList },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <nav
      className="sidebar-gradient h-full w-64 flex flex-col shadow-xl"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">
            Aqua Rance
          </h1>
          <p className="text-blue-100/70 text-xs">Management System</p>
        </div>
      </div>

      {/* Nav links */}
      <ul className="flex-1 px-3 py-4 space-y-1 list-none">
        {navItems.map(({ page, label, icon: Icon }) => (
          <li key={page}>
            <button
              type="button"
              data-ocid={`nav.${page}.link`}
              onClick={() => onNavigate(page)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentPage === page
                  ? "sidebar-active-pill"
                  : "sidebar-inactive"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-blue-100/50 text-xs text-center">
          Aqua Rance Mineral Water Services
        </p>
      </div>
    </nav>
  );
}
