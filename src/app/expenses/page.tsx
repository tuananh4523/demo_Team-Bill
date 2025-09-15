"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";

type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  status: "CHỜ" | "HOÀN TẤT";
  person: string;
  date: string;
};

type FilterStatus = "ALL" | "CHỜ" | "HOÀN TẤT";

export default function TeamBillPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

  // State cho form thêm/sửa
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<Omit<Expense, "id">>({
    title: "",
    amount: 0,
    category: "",
    status: "CHỜ",
    person: "",
    date: new Date().toISOString().split("T")[0],
  });

  // ================= Load from localStorage =================
  useEffect(() => {
    const stored = localStorage.getItem("expenses");
    if (stored) {
      setExpenses(JSON.parse(stored));
    }
  }, []);

  const saveExpenses = (data: Expense[]) => {
    setExpenses(data);
    localStorage.setItem("expenses", JSON.stringify(data));
  };

  // ================= Filter =================
  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as FilterStatus);
  };

  const filteredExpenses =
    filterStatus === "ALL"
      ? expenses
      : expenses.filter((e) => e.status === filterStatus);

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // ================= CRUD =================
  const openAddForm = () => {
    setEditExpense(null);
    setFormData({
      title: "",
      amount: 0,
      category: "",
      status: "CHỜ",
      person: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsFormOpen(true);
  };

  const openEditForm = (exp: Expense) => {
    setEditExpense(exp);
    setFormData({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      status: exp.status,
      person: exp.person,
      date: exp.date,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editExpense) {
      // Cập nhật
      const updated = expenses.map((e) =>
        e.id === editExpense.id ? { ...editExpense, ...formData } : e
      );
      saveExpenses(updated);
    } else {
      // Thêm mới
      const newExpense: Expense = {
        id: Date.now(),
        ...formData,
      };
      saveExpenses([...expenses, newExpense]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: number) => {
    const updated = expenses.filter((e) => e.id !== id);
    saveExpenses(updated);
  };

  // ================= Render =================
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-slate-800">
      <div className="mb-4">
        <Breadcrumb />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Quản lý chi tiêu</h1>
        <button
          onClick={openAddForm}
          className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
        >
          + Thêm chi tiêu
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center mb-6 gap-4">
        <select
          className="border p-2 rounded"
          value={filterStatus}
          onChange={handleFilterChange}
        >
          <option value="ALL">Tất cả</option>
          <option value="CHỜ">CHỜ</option>
          <option value="HOÀN TẤT">HOÀN TẤT</option>
        </select>
        <span className="ml-auto font-semibold">
          Tổng chi phí: {totalAmount.toLocaleString()} VNĐ
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Số tiền</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Loại</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Người chịu</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Ngày</th>
              <th className="px-6 py-3 text-center text-sm font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredExpenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{exp.title}</td>
                <td className="px-6 py-4">{exp.amount.toLocaleString()} VNĐ</td>
                <td className="px-6 py-4">{exp.category}</td>
                <td className="px-6 py-4">{exp.person}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      exp.status === "CHỜ" ? "bg-amber-500" : "bg-emerald-600"
                    }`}
                  >
                    {exp.status}
                  </span>
                </td>
                <td className="px-6 py-4">{exp.date}</td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <button
                    onClick={() => openEditForm(exp)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Sửa
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(exp.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 italic">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editExpense ? "Sửa chi tiêu" : "Thêm chi tiêu"}
            </h2>
            <div className="space-y-2">
              <input
                className="border p-2 rounded w-full"
                placeholder="Tiêu đề"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <input
                type="number"
                min={0}
                className="border p-2 rounded w-full"
                placeholder="Số tiền"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Loại"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Người chịu"
                value={formData.person}
                onChange={(e) =>
                  setFormData({ ...formData, person: e.target.value })
                }
              />
              <select
                className="border p-2 rounded w-full"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "CHỜ" | "HOÀN TẤT",
                  })
                }
              >
                <option value="CHỜ">CHỜ</option>
                <option value="HOÀN TẤT">HOÀN TẤT</option>
              </select>
              <input
                type="date"
                className="border p-2 rounded w-full"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setIsFormOpen(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
                onClick={handleSave}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
