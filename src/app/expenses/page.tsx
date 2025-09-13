
// pages/team-bill.tsx
"use client";

import { useState } from "react";

type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  status: "CHỜ" | "HOÀN TẤT";
  person: string;
  date: string;
};

const initialExpenses: Expense[] = [
  {
    id: 1,
    title: "Mua nguyên liệu",
    amount: 500000,
    category: "Nguyên liệu",
    status: "CHỜ",
    person: "A",
    date: "2025-09-11",
  },
  {
    id: 2,
    title: "Tiền điện",
    amount: 200000,
    category: "Hóa đơn",
    status: "HOÀN TẤT",
    person: "B",
    date: "2025-09-10",
  },
];

export default function TeamBillPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "CHỜ" | "HOÀN TẤT">("ALL");

  const filteredExpenses =
    filterStatus === "ALL"
      ? expenses
      : expenses.filter((e) => e.status === filterStatus);

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl text-slate-800 font-bold mb-4">Team Bill</h1>

      {/* Filter */}
      <div className="flex  text-slate-800 items-center mb-6 gap-4">
        <select
          className="border rounded px-3 py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="ALL">Tất cả</option>
          <option value="CHỜ">CHỜ</option>
          <option value="HOÀN TẤT">HOÀN TẤT</option>
        </select>
        <span className="ml-auto  text-slate-800 font-semibold">Tổng chi phí: {totalAmount.toLocaleString()} VNĐ</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Số tiền</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Loại</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Người chịu</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ngày</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y   text-slate-800 divide-gray-200">
            {filteredExpenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{exp.title}</td>
                <td className="px-6 py-4">{exp.amount.toLocaleString()} VNĐ</td>
                <td className="px-6 py-4">{exp.category}</td>
                <td className="px-6 py-4">{exp.person}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      exp.status === "CHỜ" ? "bg-yellow-500" : "bg-green-500"
                    }`}
                  >
                    {exp.status}
                  </span>
                </td>
                <td className="px-6 py-4">{exp.date}</td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() =>
                      setExpenses(expenses.filter((e) => e.id !== exp.id))
                    }
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
