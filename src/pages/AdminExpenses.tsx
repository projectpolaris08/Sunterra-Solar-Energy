import { useState, useEffect } from "react";
import AdminLayout from "../components/dashboard/AdminLayout";
import ChartCard from "../components/dashboard/ChartCard";
import { supabase } from "../lib/supabase";
import { Search, Plus, Edit, Trash2, X, Save, Receipt } from "lucide-react";

interface AdminExpensesProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  quantity?: number;
  unit_price?: number;
  category: string;
  date: string;
  vendor?: string;
  notes?: string;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  equipment: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  materials:
    "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  labor: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  transportation:
    "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  utilities:
    "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  marketing: "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  office: "bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
  other: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

export default function AdminExpenses({
  onNavigate,
  currentPage = "admin-expenses",
}: AdminExpensesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [amountInput, setAmountInput] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<string>("");
  const [unitPriceInput, setUnitPriceInput] = useState<string>("");
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    quantity: 0,
    unit_price: 0,
    category: "other",
    date: new Date().toISOString().split("T")[0],
    vendor: "",
    notes: "",
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Fetch expenses directly from Supabase on mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;

        // Map database fields to component fields
        const mappedExpenses = (data || []).map((expense: any) => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount || 0,
          quantity: expense.quantity || undefined,
          unit_price: expense.unit_price || undefined,
          category: expense.category || "other",
          date: expense.date || expense.created_at,
          vendor: expense.vendor || "",
          notes: expense.notes || "",
          createdAt: expense.created_at,
        }));

        setExpenses(mappedExpenses);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        // Fallback to localStorage if Supabase fails
        try {
          const saved = localStorage.getItem("sunterra_expenses");
          if (saved) {
            setExpenses(JSON.parse(saved));
          }
        } catch (e) {
          console.error("Failed to load from localStorage:", e);
        }
      }
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      (expense.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (expense.vendor?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (expense.notes?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: expenses.reduce((sum, e) => sum + e.amount, 0),
    thisMonth: expenses
      .filter((e) => {
        const expenseDate = new Date(e.date);
        const now = new Date();
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, e) => sum + e.amount, 0),
    byCategory: expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>),
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantityValue = parseFloat(quantityInput) || 0;
    const unitPriceValue = parseFloat(unitPriceInput) || 0;
    // Calculate amount from quantity * unit_price if both are provided, otherwise use amountInput
    const calculatedAmount =
      quantityValue > 0 && unitPriceValue > 0
        ? quantityValue * unitPriceValue
        : parseFloat(amountInput) || 0;

    try {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      const expenseData = {
        description: formData.description,
        amount: calculatedAmount,
        quantity: quantityValue > 0 ? quantityValue : null,
        unit_price: unitPriceValue > 0 ? unitPriceValue : null,
        category: formData.category,
        date: formData.date,
        vendor: formData.vendor,
        notes: formData.notes,
      };

      const { data, error } = await supabase
        .from("expenses")
        .insert(expenseData)
        .select()
        .single();

      if (error) throw error;

      // Map database fields to component fields
      const newExpense: Expense = {
        id: data.id,
        description: data.description,
        amount: data.amount || 0,
        quantity: data.quantity || undefined,
        unit_price: data.unit_price || undefined,
        category: data.category || "other",
        date: data.date || data.created_at,
        vendor: data.vendor || "",
        notes: data.notes || "",
        createdAt: data.created_at,
      };

      setExpenses([newExpense, ...expenses]);
    } catch (error) {
      console.error("Failed to add expense:", error);
      alert(
        `Failed to save to database: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Saving locally as backup.`
      );

      // Fallback: add to local state
      const newExpense: Expense = {
        id:
          expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1,
        description: formData.description,
        amount: calculatedAmount,
        quantity: quantityValue > 0 ? quantityValue : undefined,
        unit_price: unitPriceValue > 0 ? unitPriceValue : undefined,
        category: formData.category,
        date: formData.date,
        vendor: formData.vendor,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };
      setExpenses([newExpense, ...expenses]);
      localStorage.setItem(
        "sunterra_expenses",
        JSON.stringify([newExpense, ...expenses])
      );
    }

    setFormData({
      description: "",
      amount: 0,
      quantity: 0,
      unit_price: 0,
      category: "other",
      date: new Date().toISOString().split("T")[0],
      vendor: "",
      notes: "",
    });
    setAmountInput("");
    setQuantityInput("");
    setUnitPriceInput("");
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }

        const { error } = await supabase.from("expenses").delete().eq("id", id);

        if (error) throw error;

        setExpenses(expenses.filter((e) => e.id !== id));
      } catch (error) {
        console.error("Failed to delete expense:", error);
        alert(
          `Failed to delete from database: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Removing from local view.`
        );
        // Fallback: delete from local state
        setExpenses(expenses.filter((e) => e.id !== id));
        localStorage.setItem(
          "sunterra_expenses",
          JSON.stringify(expenses.filter((e) => e.id !== id))
        );
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      quantity: expense.quantity || 0,
      unit_price: expense.unit_price || 0,
      category: expense.category,
      date: expense.date,
      vendor: expense.vendor || "",
      notes: expense.notes || "",
    });
    setAmountInput(expense.amount.toFixed(2));
    setQuantityInput(expense.quantity ? expense.quantity.toString() : "");
    setUnitPriceInput(expense.unit_price ? expense.unit_price.toFixed(2) : "");
    setIsModalOpen(true);
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const quantityValue = parseFloat(quantityInput) || 0;
    const unitPriceValue = parseFloat(unitPriceInput) || 0;
    // Calculate amount from quantity * unit_price if both are provided, otherwise use amountInput
    const calculatedAmount =
      quantityValue > 0 && unitPriceValue > 0
        ? quantityValue * unitPriceValue
        : parseFloat(amountInput) || 0;

    try {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      const { error } = await supabase
        .from("expenses")
        .update({
          description: formData.description,
          amount: calculatedAmount,
          quantity: quantityValue > 0 ? quantityValue : null,
          unit_price: unitPriceValue > 0 ? unitPriceValue : null,
          category: formData.category,
          date: formData.date,
          vendor: formData.vendor,
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingExpense.id);

      if (error) throw error;

      setExpenses(
        expenses.map((expense) =>
          expense.id === editingExpense.id
            ? {
                ...expense,
                description: formData.description,
                amount: calculatedAmount,
                quantity: quantityValue > 0 ? quantityValue : undefined,
                unit_price: unitPriceValue > 0 ? unitPriceValue : undefined,
                category: formData.category,
                date: formData.date,
                vendor: formData.vendor,
                notes: formData.notes,
              }
            : expense
        )
      );
    } catch (error) {
      console.error("Failed to update expense:", error);
      alert(
        `Failed to update: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Updating locally.`
      );
      // Fallback: update local state
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingExpense.id
            ? {
                ...expense,
                description: formData.description,
                amount: calculatedAmount,
                quantity: quantityValue > 0 ? quantityValue : undefined,
                unit_price: unitPriceValue > 0 ? unitPriceValue : undefined,
                category: formData.category,
                date: formData.date,
                vendor: formData.vendor,
                notes: formData.notes,
              }
            : expense
        )
      );
      localStorage.setItem(
        "sunterra_expenses",
        JSON.stringify(
          expenses.map((expense) =>
            expense.id === editingExpense.id
              ? {
                  ...expense,
                  description: formData.description,
                  amount: calculatedAmount,
                  quantity: quantityValue > 0 ? quantityValue : undefined,
                  unit_price: unitPriceValue > 0 ? unitPriceValue : undefined,
                  category: formData.category,
                  date: formData.date,
                  vendor: formData.vendor,
                  notes: formData.notes,
                }
              : expense
          )
        )
      );
    }

    setFormData({
      description: "",
      amount: 0,
      quantity: 0,
      unit_price: 0,
      category: "other",
      date: new Date().toISOString().split("T")[0],
      vendor: "",
      notes: "",
    });
    setAmountInput("");
    setQuantityInput("");
    setUnitPriceInput("");
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={onNavigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Expense Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage all business expenses
            </p>
          </div>
          <button
            onClick={() => {
              setEditingExpense(null);
              setFormData({
                description: "",
                amount: 0,
                quantity: 0,
                unit_price: 0,
                category: "other",
                date: new Date().toISOString().split("T")[0],
                vendor: "",
                notes: "",
              });
              setAmountInput("");
              setQuantityInput("");
              setUnitPriceInput("");
              setIsModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Expenses
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  ₱
                  {stats.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30">
                <Receipt className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  This Month
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  ₱
                  {stats.thisMonth.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30">
                <Receipt className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Records
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {expenses.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/30">
                <Receipt className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <ChartCard title="Expenses List" className="mb-6">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses by description, vendor, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-700 dark:text-gray-200"
            >
              <option value="all">All Categories</option>
              <option value="equipment">Equipment</option>
              <option value="materials">Materials</option>
              <option value="labor">Labor</option>
              <option value="transportation">Transportation</option>
              <option value="utilities">Utilities</option>
              <option value="marketing">Marketing</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Expenses Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Unit Price
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vendor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {expense.description}
                          </p>
                          {expense.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {expense.quantity
                            ? expense.quantity.toLocaleString()
                            : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {expense.unit_price
                            ? `₱${expense.unit_price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                          ₱
                          {expense.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            categoryColors[expense.category] ||
                            categoryColors.other
                          }`}
                        >
                          {expense.category.charAt(0).toUpperCase() +
                            expense.category.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {expense.vendor || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Add/Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingExpense(null);
                  setFormData({
                    description: "",
                    amount: 0,
                    quantity: 0,
                    unit_price: 0,
                    category: "other",
                    date: new Date().toISOString().split("T")[0],
                    vendor: "",
                    notes: "",
                  });
                  setAmountInput("");
                  setQuantityInput("");
                  setUnitPriceInput("");
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="Office supplies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={quantityInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string, numbers, and decimal point
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setQuantityInput(value);
                        // Auto-calculate amount if both quantity and unit_price are provided
                        const qty = parseFloat(value) || 0;
                        const unitPrice = parseFloat(unitPriceInput) || 0;
                        if (qty > 0 && unitPrice > 0) {
                          setAmountInput((qty * unitPrice).toFixed(2));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const numValue = parseFloat(e.target.value);
                      if (!isNaN(numValue) && numValue > 0) {
                        setQuantityInput(numValue.toString());
                      } else if (e.target.value === "") {
                        setQuantityInput("");
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Unit Price (₱)
                  </label>
                  <input
                    type="text"
                    value={unitPriceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string, numbers, and decimal point
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setUnitPriceInput(value);
                        // Auto-calculate amount if both quantity and unit_price are provided
                        const qty = parseFloat(quantityInput) || 0;
                        const unitPrice = parseFloat(value) || 0;
                        if (qty > 0 && unitPrice > 0) {
                          setAmountInput((qty * unitPrice).toFixed(2));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const numValue = parseFloat(e.target.value);
                      if (!isNaN(numValue)) {
                        setUnitPriceInput(numValue.toFixed(2));
                      } else if (e.target.value === "") {
                        setUnitPriceInput("");
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amount (₱) *
                  </label>
                  <input
                    type="text"
                    required
                    value={amountInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string, numbers, and decimal point
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setAmountInput(value);
                      }
                    }}
                    onBlur={(e) => {
                      // Format to 2 decimal places on blur
                      const numValue = parseFloat(e.target.value);
                      if (!isNaN(numValue)) {
                        setAmountInput(numValue.toFixed(2));
                      } else if (e.target.value === "") {
                        setAmountInput("");
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 dark:text-gray-100"
                  >
                    <option value="equipment">Equipment</option>
                    <option value="materials">Materials</option>
                    <option value="labor">Labor</option>
                    <option value="transportation">Transportation</option>
                    <option value="utilities">Utilities</option>
                    <option value="marketing">Marketing</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 dark:text-gray-100"
                    placeholder="Vendor name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="Additional notes about this expense..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingExpense(null);
                    setFormData({
                      description: "",
                      amount: 0,
                      quantity: 0,
                      unit_price: 0,
                      category: "other",
                      date: new Date().toISOString().split("T")[0],
                      vendor: "",
                      notes: "",
                    });
                    setAmountInput("");
                    setQuantityInput("");
                    setUnitPriceInput("");
                  }}
                  className="px-6 py-3 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 font-semibold hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingExpense ? "Update Expense" : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
