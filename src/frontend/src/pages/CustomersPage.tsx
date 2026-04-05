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
import { Pencil, Plus, Search, Trash2, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppState } from "../context/AppStateContext";
import type { Customer } from "../data/sampleData";

type TypeFilter = "All" | "Retail" | "Company" | "Medium";

const typeBadgeClass: Record<string, string> = {
  Retail: "badge-retail",
  Company: "badge-company",
  Medium: "badge-medium",
};

const typeShort: Record<string, string> = {
  Retail: "R",
  Company: "C",
  Medium: "M",
};

const CLIENT_IDS: Record<"Retail" | "Company" | "Medium", string[]> = {
  Retail: ["R1", "R3", "R5", "R7", "R9", "R10", "R12", "R13"],
  Company: ["C1", "C2", "C3"],
  Medium: ["M1", "M3", "M5", "M7", "M9", "M11"],
};

export default function CustomersPage() {
  const { customers, setCustomers } = useAppState();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "Retail" as Customer["type"],
    contact: "",
    address: "",
  });

  // Names already used for each type
  const usedNames = useMemo(() => {
    const set = new Set<string>();
    for (const c of customers) {
      if (!editingCustomer || c.id !== editingCustomer.id) {
        set.add(c.name);
      }
    }
    return set;
  }, [customers, editingCustomer]);

  const availableIds = useMemo(() => {
    return CLIENT_IDS[form.type].filter((id) => !usedNames.has(id));
  }, [form.type, usedNames]);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contact.includes(search) ||
        c.address.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [customers, search, typeFilter]);

  const openAdd = () => {
    setEditingCustomer(null);
    setForm({ name: "", type: "Retail", contact: "", address: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setForm({
      name: c.name,
      type: c.type,
      contact: c.contact,
      address: c.address,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.contact.trim() || !form.address.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (editingCustomer) {
      setCustomers(
        customers.map((c) =>
          c.id === editingCustomer.id ? { ...c, ...form } : c,
        ),
      );
      toast.success("Customer updated successfully.");
    } else {
      const newCustomer: Customer = {
        id: `c${Date.now()}`,
        ...form,
        status: "Active",
      };
      setCustomers([...customers, newCustomer]);
      toast.success("Customer added successfully.");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setCustomers(customers.filter((c) => c.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} removed.`);
    setDeleteTarget(null);
  };

  // When type changes in form, reset name if the current name isn't valid for the new type
  const handleTypeChange = (newType: Customer["type"]) => {
    const validIds = CLIENT_IDS[newType];
    const usedForType = new Set(
      customers
        .filter((c) => !editingCustomer || c.id !== editingCustomer.id)
        .filter((c) => c.type === newType)
        .map((c) => c.name),
    );
    const available = validIds.filter((id) => !usedForType.has(id));
    setForm((p) => ({
      ...p,
      type: newType,
      name: available.length > 0 ? available[0] : "",
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {customers.length} registered accounts
          </p>
        </div>
        <Button
          type="button"
          data-ocid="customers.add_customer.open_modal_button"
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Add Customer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            aria-hidden="true"
          />
          <Input
            data-ocid="customers.search.search_input"
            className="pl-9"
            placeholder="Search by ID, contact, or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as TypeFilter)}
        >
          <SelectTrigger
            data-ocid="customers.type_filter.select"
            className="w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["All", "Retail", "Company", "Medium"] as TypeFilter[]).map(
              (t) => (
                <SelectItem key={t} value={t}>
                  {t === "All" ? "All Types" : t}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E6EDF5] rounded-xl shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div
            data-ocid="customers.empty_state"
            className="py-16 text-center text-gray-400"
          >
            <UserCheck
              className="w-10 h-10 mx-auto mb-3 opacity-30"
              aria-hidden="true"
            />
            <p className="font-medium">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Client ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Address
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    data-ocid={`customers.item.${i + 1}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeBadgeClass[c.type]}`}
                      >
                        {typeShort[c.type]} — {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.contact}</td>
                    <td className="px-5 py-3 text-gray-600">{c.address}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold badge-paid">
                        Active
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          data-ocid={`customers.edit_button.${i + 1}`}
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Edit customer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`customers.delete_button.${i + 1}`}
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Delete customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="customers.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cust-type">Client Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => handleTypeChange(v as Customer["type"])}
              >
                <SelectTrigger id="cust-type" data-ocid="customers.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retail">Retail (R)</SelectItem>
                  <SelectItem value="Company">Company (C)</SelectItem>
                  <SelectItem value="Medium">Medium (M)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Client ID *</Label>
              <Select
                value={form.name}
                onValueChange={(v) => setForm((p) => ({ ...p, name: v }))}
              >
                <SelectTrigger id="cust-name" data-ocid="customers.name.select">
                  <SelectValue placeholder="Select client ID…" />
                </SelectTrigger>
                <SelectContent>
                  {editingCustomer && !availableIds.includes(form.name) ? (
                    <SelectItem value={form.name}>{form.name}</SelectItem>
                  ) : null}
                  {availableIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableIds.length === 0 && !editingCustomer && (
                <p className="text-xs text-amber-600">
                  All {form.type} client IDs are already in use.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-contact">Contact *</Label>
              <Input
                id="cust-contact"
                data-ocid="customers.contact.input"
                placeholder="09XXXXXXXXX"
                value={form.contact}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-addr">Address *</Label>
              <Input
                id="cust-addr"
                data-ocid="customers.address.input"
                placeholder="Barangay, City"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="customers.dialog.cancel_button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="customers.dialog.confirm_button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
            >
              {editingCustomer ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent data-ocid="customers.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to remove{" "}
            <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="customers.delete.cancel_button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="customers.delete.confirm_button"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
