import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Archive, Droplets } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppState } from "../context/AppStateContext";
import type { StockMovement } from "../data/sampleData";

const categoryMeta: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    max: number;
  }
> = {
  FilledGallons: {
    label: "Filled Gallon Containers",
    icon: Droplets,
    color: "text-blue-600",
    bg: "bg-blue-50",
    max: 2000,
  },
  EmptyContainers: {
    label: "Empty Containers",
    icon: Archive,
    color: "text-amber-600",
    bg: "bg-amber-50",
    max: 1500,
  },
};

const CATEGORIES = ["FilledGallons", "EmptyContainers"] as const;
type Category = (typeof CATEGORIES)[number];

export default function InventoryPage() {
  const { stockMovements, setStockMovements } = useAppState();

  const [form, setForm] = useState({
    category: "FilledGallons" as Category,
    type: "IN" as "IN" | "OUT",
    quantity: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Compute current stock per category
  const currentStock = useMemo(() => {
    const result: Record<string, number> = {
      FilledGallons: 0,
      EmptyContainers: 0,
    };
    for (const m of stockMovements) {
      if (m.category in result) {
        result[m.category] += m.type === "IN" ? m.quantity : -m.quantity;
      }
    }
    return result;
  }, [stockMovements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quantity || Number(form.quantity) <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    const newMovement: StockMovement = {
      id: `sm${Date.now()}`,
      date: form.date,
      category: form.category,
      type: form.type,
      quantity: Number(form.quantity),
      note: form.note || undefined,
    };
    setStockMovements([...stockMovements, newMovement]);
    toast.success(
      `Stock movement recorded: ${form.type} ${form.quantity} ${categoryMeta[form.category].label}`,
    );
    setForm((prev) => ({ ...prev, quantity: "", note: "" }));
  };

  const sortedMovements = useMemo(() => {
    return [...stockMovements].sort((a, b) => b.date.localeCompare(a.date));
  }, [stockMovements]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track stock levels and record movements
        </p>
      </div>

      {/* Stock Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const meta = categoryMeta[cat];
          const stock = currentStock[cat] ?? 0;
          const pct = Math.min(Math.max((stock / meta.max) * 100, 0), 100);
          const Icon = meta.icon;
          return (
            <div
              key={cat}
              data-ocid={`inventory.${cat.toLowerCase()}.card`}
              className="bg-white border border-[#E6EDF5] rounded-xl p-5 shadow-xs"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-semibold text-gray-500">
                    {meta.label}
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${meta.color}`}>
                    {stock.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg ${meta.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
              </div>
              <Progress value={pct} className="h-1.5" />
              <p className="text-xs text-gray-400 mt-1">
                {Math.round(pct)}% of max ({meta.max.toLocaleString()})
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Movement Form */}
        <div className="bg-white border border-[#E6EDF5] rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Add Stock Movement
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, category: v as Category }))
                }
              >
                <SelectTrigger
                  id="inv-category"
                  data-ocid="inventory.category.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryMeta[c].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Movement Type</Label>
              <div className="flex gap-2">
                {(["IN", "OUT"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    data-ocid={`inventory.movement_${t.toLowerCase()}.toggle`}
                    onClick={() => setForm((p) => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      form.type === t
                        ? t === "IN"
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-red-500 border-red-500 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-qty">Quantity</Label>
              <Input
                id="inv-qty"
                data-ocid="inventory.quantity.input"
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={form.quantity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, quantity: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-date">Date</Label>
              <Input
                id="inv-date"
                data-ocid="inventory.date.input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-note">Note (optional)</Label>
              <Input
                id="inv-note"
                data-ocid="inventory.note.input"
                placeholder="e.g. Monthly restock"
                value={form.note}
                onChange={(e) =>
                  setForm((p) => ({ ...p, note: e.target.value }))
                }
              />
            </div>

            <Button
              type="submit"
              data-ocid="inventory.add_movement.submit_button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Record Movement
            </Button>
          </form>
        </div>

        {/* Movements Table */}
        <div className="xl:col-span-2 bg-white border border-[#E6EDF5] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E6EDF5]">
            <h3 className="text-sm font-semibold text-gray-700">
              Stock Movement History
            </h3>
          </div>
          <div className="overflow-auto max-h-[480px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Qty
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedMovements.map((m, i) => (
                  <tr
                    key={m.id}
                    data-ocid={`inventory.movement.item.${i + 1}`}
                    className="hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(m.date).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {categoryMeta[m.category]?.label ?? m.category}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          m.type === "IN" ? "badge-in" : "badge-out"
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      {m.quantity.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {m.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
