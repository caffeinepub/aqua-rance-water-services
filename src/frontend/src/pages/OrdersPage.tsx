import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppState } from "../context/AppStateContext";
import type { Order } from "../data/sampleData";

const statusBadge: Record<Order["status"], string> = {
  Pending: "badge-pending",
  Delivered: "badge-delivered",
  Cancelled: "badge-cancelled",
};

const typeBadge: Record<string, string> = {
  Retail: "badge-retail",
  Company: "badge-company",
  Medium: "badge-medium",
};

export default function OrdersPage() {
  const { customers, orders, setOrders } = useAppState();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    scheduledDate: "",
    quantity: "",
    note: "",
  });

  // Group orders by scheduledDate
  const grouped = useMemo(() => {
    const sorted = [...orders].sort((a, b) =>
      a.scheduledDate.localeCompare(b.scheduledDate),
    );
    const map = new Map<string, Order[]>();
    for (const o of sorted) {
      const existing = map.get(o.scheduledDate) ?? [];
      existing.push(o);
      map.set(o.scheduledDate, existing);
    }
    return map;
  }, [orders]);

  const handleSubmit = () => {
    const customer = customers.find((c) => c.id === form.customerId);
    if (!customer) {
      toast.error("Please select a customer.");
      return;
    }
    if (!form.scheduledDate) {
      toast.error("Please select a scheduled date.");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      toast.error("Enter valid quantity.");
      return;
    }

    const order: Order = {
      id: `o${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      clientType: customer.type,
      scheduledDate: form.scheduledDate,
      quantity: Number(form.quantity),
      status: "Pending",
      note: form.note || undefined,
    };
    setOrders([...orders, order]);
    toast.success("Order added successfully.");
    setDialogOpen(false);
    setForm({ customerId: "", scheduledDate: "", quantity: "", note: "" });
  };

  const updateStatus = (id: string, status: Order["status"]) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Order marked as ${status}.`);
  };

  return (
    <div className="relative p-6 space-y-6 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {orders.filter((o) => o.status === "Pending").length} pending orders
          </p>
        </div>
        <Button
          type="button"
          data-ocid="orders.add_order.open_modal_button"
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Add Order
        </Button>
      </div>

      {orders.length === 0 ? (
        <div
          data-ocid="orders.empty_state"
          className="bg-white border border-[#E6EDF5] rounded-xl py-16 text-center text-gray-400"
        >
          <ClipboardList
            className="w-10 h-10 mx-auto mb-3 opacity-30"
            aria-hidden="true"
          />
          <p className="font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([date, dateOrders]) => (
            <div
              key={date}
              className="bg-white border border-[#E6EDF5] rounded-xl shadow-xs overflow-hidden"
            >
              <div className="px-5 py-3 bg-gray-50 border-b border-[#E6EDF5] flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  {new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs text-gray-400">
                  {dateOrders.length} order{dateOrders.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {dateOrders.map((o, i) => (
                  <div
                    key={o.id}
                    data-ocid={`orders.item.${i + 1}`}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge[o.clientType]}`}
                        >
                          {o.clientType[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {o.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {o.quantity} gallon containers
                          {o.note ? ` · ${o.note}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge[o.status]}`}
                      >
                        {o.status}
                      </span>
                      {o.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            data-ocid={`orders.mark_delivered.${i + 1}`}
                            onClick={() => updateStatus(o.id, "Delivered")}
                            className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100 transition-colors"
                          >
                            Mark Delivered
                          </button>
                          <button
                            type="button"
                            data-ocid={`orders.mark_cancelled.${i + 1}`}
                            onClick={() => updateStatus(o.id, "Cancelled")}
                            className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Order Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="orders.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Select
                value={form.customerId}
                onValueChange={(v) => setForm((p) => ({ ...p, customerId: v }))}
              >
                <SelectTrigger data-ocid="orders.customer.select">
                  <SelectValue placeholder="Select customer…" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.type[0]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scheduled Date *</Label>
              <Input
                data-ocid="orders.scheduled_date.input"
                type="date"
                value={form.scheduledDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scheduledDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity (gallon containers) *</Label>
              <Input
                data-ocid="orders.quantity.input"
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={form.quantity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, quantity: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note (optional)</Label>
              <Input
                data-ocid="orders.note.input"
                placeholder="Delivery instructions…"
                value={form.note}
                onChange={(e) =>
                  setForm((p) => ({ ...p, note: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="orders.dialog.cancel_button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="orders.dialog.confirm_button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
            >
              Add Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Caffeine badge - fixed absolute bottom right corner */}
      <span
        style={{
          fontSize: "9px",
          position: "fixed",
          bottom: "6px",
          right: "8px",
          zIndex: 50,
        }}
        className="text-gray-300 pointer-events-none select-none"
      >
        Made with{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:underline pointer-events-auto"
        >
          Caffeine AI
        </a>
      </span>
    </div>
  );
}
