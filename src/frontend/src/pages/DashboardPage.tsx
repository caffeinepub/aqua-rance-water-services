import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  Droplets,
  TrendingDown,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppState } from "../context/AppStateContext";

export default function DashboardPage() {
  const { deliveries, customers, orders } = useAppState();

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Available Gallons = Total Gallons Returned − Total Defective Containers
  const availableGallons = useMemo(() => {
    const totalReturned = deliveries.reduce(
      (acc, d) => acc + d.gallonsReturned,
      0,
    );
    const totalDefective = deliveries.reduce(
      (acc, d) => acc + (d.defectiveContainers ?? 0),
      0,
    );
    return totalReturned - totalDefective;
  }, [deliveries]);

  // Weekly demand: deliveries in last 7 days
  const weeklyDemand = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return deliveries
      .filter((d) => new Date(d.date) >= cutoff)
      .reduce((acc, d) => acc + d.gallonsDelivered, 0);
  }, [deliveries]);

  const inventoryStock = availableGallons - weeklyDemand;
  const isStockout = inventoryStock < 0;

  // Last 7 days bar chart data
  const last7DaysData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      });
      const gallons = deliveries
        .filter((del) => del.date === dateStr)
        .reduce((acc, del) => acc + del.gallonsDelivered, 0);
      return { date: label, gallons };
    });
  }, [deliveries]);

  // Last 30 days line chart: Available Gallon Containers vs Order Demand
  const last30DaysData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const cutoffStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      });

      // Available Gallon Containers up to and including this day
      const deliveriesUpToDay = deliveries.filter(
        (del) => del.date <= cutoffStr,
      );
      const returned = deliveriesUpToDay.reduce(
        (acc, del) => acc + del.gallonsReturned,
        0,
      );
      const defective = deliveriesUpToDay.reduce(
        (acc, del) => acc + (del.defectiveContainers ?? 0),
        0,
      );
      const dayAvailableGallons = returned - defective;

      // Order demand: total quantity of orders scheduled on this specific day
      const dayOrderDemand = orders
        .filter((o) => o.scheduledDate === cutoffStr)
        .reduce((acc, o) => acc + o.quantity, 0);

      return {
        date: label,
        availableGallons: dayAvailableGallons,
        orderDemand: dayOrderDemand,
      };
    });
  }, [deliveries, orders]);

  // Recent 5 deliveries
  const recentDeliveries = useMemo(() => {
    return [...deliveries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [deliveries]);

  const activeCustomers = customers.filter((c) => c.status === "Active").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{formattedDate}</p>
        </div>
      </div>

      {/* Stockout Banner */}
      {isStockout && (
        <div
          data-ocid="dashboard.error_state"
          className="stockout-banner rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <AlertTriangle
            className="w-5 h-5 text-red-600 flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <span className="font-semibold text-red-800">⚠️ STOCKOUT ALERT</span>
            <span className="ml-2 text-red-700 text-sm">
              Inventory stock is negative ({inventoryStock} gallon containers).
              Immediate restocking required.
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Available Gallons */}
        <div
          data-ocid="dashboard.available_gallons.card"
          className="bg-white border border-[#E6EDF5] rounded-xl p-5 shadow-xs"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
                Available Gallon Containers
              </p>
              <p className="kpi-number mt-1 text-blue-700">
                {availableGallons.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" aria-hidden="true" />
            </div>
          </div>
          <Progress
            value={Math.min((availableGallons / 2000) * 100, 100)}
            className="h-1.5"
          />
          <p className="text-xs text-gray-400 mt-1">Returned − Defective</p>
        </div>

        {/* Weekly Demand */}
        <div
          data-ocid="dashboard.weekly_demand.card"
          className="bg-white border border-[#E6EDF5] rounded-xl p-5 shadow-xs"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
                Weekly Demand
              </p>
              <p className="kpi-number mt-1 text-emerald-600">
                {weeklyDemand.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                gallon containers delivered this week
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingDown
                className="w-5 h-5 text-emerald-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Inventory Stock */}
        <div
          data-ocid="dashboard.inventory_stock.card"
          className={`bg-white border rounded-xl p-5 shadow-xs ${
            isStockout ? "border-red-200 bg-red-50/30" : "border-[#E6EDF5]"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
                Inventory Stock
              </p>
              <p
                className={`kpi-number mt-1 ${isStockout ? "text-red-600" : "text-gray-900"}`}
              >
                {inventoryStock.toLocaleString()}
              </p>
              {isStockout ? (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  STOCKOUT
                </span>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  available − weekly demand
                </p>
              )}
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isStockout ? "bg-red-100" : "bg-gray-50"}`}
            >
              <Activity
                className={`w-5 h-5 ${isStockout ? "text-red-500" : "text-gray-400"}`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div
          data-ocid="dashboard.active_customers.card"
          className="bg-white border border-[#E6EDF5] rounded-xl p-5 shadow-xs"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
                Active Customers
              </p>
              <p className="kpi-number mt-1 text-violet-600">
                {activeCustomers}
              </p>
              <p className="text-xs text-gray-400 mt-1">registered accounts</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-500" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-white border border-[#E6EDF5] rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Weekly Demand — Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7DaysData} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0F4F8"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E6EDF5",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "#374151", fontWeight: 600, fontSize: 12 }}
                itemStyle={{ color: "#2F80ED", fontSize: 12 }}
              />
              <Bar
                dataKey="gallons"
                fill="#2F80ED"
                radius={[4, 4, 0, 0]}
                name="Gallon Containers"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart: Available Gallon Containers vs Order Demand */}
        <div className="bg-white border border-[#E6EDF5] rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Available Gallon Containers vs Order Demand — Last 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last30DaysData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0F4F8"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E6EDF5",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "#374151", fontWeight: 600, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line
                type="monotone"
                dataKey="availableGallons"
                stroke="#2F80ED"
                strokeWidth={2}
                dot={false}
                name="Available Gallon Containers"
              />
              <Line
                type="monotone"
                dataKey="orderDemand"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                name="Order Demand"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white border border-[#E6EDF5] rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E6EDF5]">
          <h3 className="text-sm font-semibold text-gray-700">
            Recent Deliveries
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Gallon Containers
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentDeliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-400 text-sm"
                  >
                    No deliveries yet
                  </td>
                </tr>
              ) : (
                recentDeliveries.map((d, i) => (
                  <tr
                    key={d.id}
                    data-ocid={`dashboard.recent_deliveries.item.${i + 1}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {d.customerName}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(d.date).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-semibold">
                      {d.gallonsDelivered}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          d.paymentStatus === "Paid"
                            ? "badge-paid"
                            : "badge-unpaid"
                        }`}
                      >
                        {d.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
