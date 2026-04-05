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
import { Plus, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppState } from "../context/AppStateContext";
import type { Delivery } from "../data/sampleData";

type PayFilter = "All" | "Paid" | "Unpaid";

export default function DeliveriesPage() {
  const { customers, deliveries, setDeliveries } = useAppState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payFilter, setPayFilter] = useState<PayFilter>("All");

  const [form, setForm] = useState({
    customerId: "",
    date: new Date().toISOString().split("T")[0],
    gallonsDelivered: "",
    gallonsReturned: "",
    defectiveContainers: "",
    paymentStatus: "Paid" as "Paid" | "Unpaid",
    note: "",
  });

  const filtered = useMemo(() => {
    return [...deliveries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((d) => payFilter === "All" || d.paymentStatus === payFilter);
  }, [deliveries, payFilter]);

  const handleSubmit = () => {
    const customer = customers.find((c) => c.id === form.customerId);
    if (!customer) {
      toast.error("Please select a customer.");
      return;
    }
    if (!form.gallonsDelivered || Number(form.gallonsDelivered) <= 0) {
      toast.error("Enter valid gallon containers delivered.");
      return;
    }
    if (form.gallonsReturned === "") {
      toast.error("Enter gallon containers returned (0 if none).");
      return;
    }
    const defective =
      form.defectiveContainers === "" ? 0 : Number(form.defectiveContainers);
    if (defective < 0) {
      toast.error("Defective containers cannot be negative.");
      return;
    }

    const delivery: Delivery = {
      id: `d${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      clientType: customer.type,
      date: form.date,
      gallonsDelivered: Number(form.gallonsDelivered),
      gallonsReturned: Number(form.gallonsReturned),
      defectiveContainers: defective,
      paymentStatus: form.paymentStatus,
      note: form.note || undefined,
    };
    setDeliveries([...deliveries, delivery]);
    toast.success("Delivery record added.");
    setDialogOpen(false);
    setForm({
      customerId: "",
      date: new Date().toISOString().split("T")[0],
      gallonsDelivered: "",
      gallonsReturned: "",
      defectiveContainers: "",
      paymentStatus: "Paid",
      note: "",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {deliveries.length} total records
          </p>
        </div>
        <Button
          type="button"
          data-ocid="deliveries.add_delivery.open_modal_button"
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Add Delivery
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter by payment:</span>
        {(["All", "Paid", "Unpaid"] as PayFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            data-ocid={`deliveries.filter_${f.toLowerCase()}.tab`}
            onClick={() => setPayFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              payFilter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E6EDF5] rounded-xl shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div
            data-ocid="deliveries.empty_state"
            className="py-16 text-center text-gray-400"
          >
            <Truck
              className="w-10 h-10 mx-auto mb-3 opacity-30"
              aria-hidden="true"
            />
            <p className="font-medium">No deliveries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Delivered
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Returned
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Defective
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Payment
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d, i) => (
                  <tr
                    key={d.id}
                    data-ocid={`deliveries.item.${i + 1}`}
                    className="hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(d.date).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {d.customerName}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          d.clientType === "Retail"
                            ? "badge-retail"
                            : d.clientType === "Company"
                              ? "badge-company"
                              : "badge-medium"
                        }`}
                      >
                        {d.clientType[0]}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      {d.gallonsDelivered}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {d.gallonsReturned}
                    </td>
                    <td className="px-5 py-3">
                      {d.defectiveContainers > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                          {d.defectiveContainers}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {d.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="deliveries.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Delivery Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Select
                value={form.customerId}
                onValueChange={(v) => setForm((p) => ({ ...p, customerId: v }))}
              >
                <SelectTrigger data-ocid="deliveries.customer.select">
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
              <Label>Date *</Label>
              <Input
                data-ocid="deliveries.date.input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Delivered *</Label>
                <Input
                  data-ocid="deliveries.gallons_delivered.input"
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={form.gallonsDelivered}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, gallonsDelivered: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Returned *</Label>
                <Input
                  data-ocid="deliveries.gallons_returned.input"
                  type="number"
                  min="0"
                  placeholder="e.g. 40"
                  value={form.gallonsReturned}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, gallonsReturned: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Defective Containers</Label>
              <p className="text-xs text-gray-400">
                Count each defective container once. A container is defective if
                its cap, seal, or body is damaged.
              </p>
              <Input
                data-ocid="deliveries.defective_containers.input"
                type="number"
                min="0"
                placeholder="0"
                value={form.defectiveContainers}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    defectiveContainers: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Status</Label>
              <div className="flex gap-2">
                {(["Paid", "Unpaid"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-ocid={`deliveries.payment_${s.toLowerCase()}.toggle`}
                    onClick={() => setForm((p) => ({ ...p, paymentStatus: s }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      form.paymentStatus === s
                        ? s === "Paid"
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-amber-500 border-amber-500 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Note (optional)</Label>
              <Input
                data-ocid="deliveries.note.input"
                placeholder="Optional note…"
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
              data-ocid="deliveries.dialog.cancel_button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="deliveries.dialog.confirm_button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
            >
              Add Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
