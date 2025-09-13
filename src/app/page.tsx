'use client'

import React, { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function TeamBillPage() {
  // ======================= Types =======================
  type Expense = {
    id: number
    title: string
    amount: number
    category: string
    status: 'CHỜ' | 'HOÀN TẤT'
    person: string
  }

  type Member = {
    id: number
    name: string
  }

  // ======================= Sample Data =======================
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, title: 'Bữa trưa nhóm', amount: 120.5, category: 'Ăn uống', status: 'CHỜ', person: 'Nguyễn Văn A' },
    { id: 2, title: 'Văn phòng phẩm', amount: 85.3, category: 'Văn phòng', status: 'HOÀN TẤT', person: 'Trần Thị B' },
    { id: 3, title: 'Cà phê gặp khách hàng', amount: 45.2, category: 'Kinh doanh', status: 'CHỜ', person: 'Lê Văn C' },
  ])

  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' },
    { id: 3, name: 'Lê Văn C' },
    { id: 4, name: 'Nguyễn Văn D' },
  ])

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    person: members[0]?.name || '',
  })

  // ======================= Handlers =======================

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

   useEffect(() => {
    if (isOpen) {
      router.push("/expense"); // đường dẫn muốn điều hướng
    }
  }, [isOpen, router]);

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) return
    const newItem: Expense = {
      id: expenses.length + 1,
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      status: 'CHỜ',
      person: newExpense.person,
    }
    setExpenses([...expenses, newItem])
    setNewExpense({ title: '', amount: '', category: '', person: members[0]?.name || '' })
  }

  // ======================= Computed =======================
  const total = expenses.reduce((acc, e) => acc + e.amount, 0)
  const pending = expenses.filter(e => e.status === 'CHỜ').reduce((acc, e) => acc + e.amount, 0)

  const categories = Array.from(
    expenses.reduce((map, e) => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount)
      return map
    }, new Map<string, number>())
  ).map(([name, amt]) => ({ name, value: amt }))

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#22c55e']

  // ======================= Components =======================
  const StatCard = ({ title, value, accent }: { title: string; value: string; accent: 'red' | 'amber' }) => {
    const accentClass = accent === 'red' ? 'text-rose-600' : 'text-amber-500'
    return (
      <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
        <div className="text-sm text-slate-500">{title}</div>
        <div className={`mt-2 text-2xl font-semibold ${accentClass}`}>{value}</div>
      </div>
    )
  }

  const Tag = ({ label }: { label: string }) => (
    <span className="inline-block px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded">{label}</span>
  )

  const StatusPill = ({ status }: { status: 'CHỜ' | 'HOÀN TẤT' }) => {
    const cls = status === 'HOÀN TẤT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
    return <span className={`inline-block px-2 py-1 text-xs rounded ${cls}`}>{status}</span>
  }

  const ExpenseTable = ({ data }: { data: Expense[] }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">Chi tiêu gần đây</h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm text-slate-500 border-b">
            <th className="py-2">Mô tả</th>
            <th className="py-2">Số tiền</th>
            <th className="py-2">Danh mục</th>
            <th className="py-2">Trạng thái</th>
            <th className="py-2">Người chi trả</th>
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id} className="border-b last:border-b-0">
              <td className="py-3">{r.title}</td>
              <td className="py-3">${r.amount.toFixed(2)}</td>
              <td className="py-3"><Tag label={r.category} /></td>
              <td className="py-3"><StatusPill status={r.status} /></td>
              <td className="py-3">{r.person}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const AddExpenseForm = () => (
    <div className="mt-6 bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">Thêm chi tiêu mới</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Mô tả"
          value={newExpense.title}
          onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Số tiền"
          type="number"
          value={newExpense.amount}
          onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Danh mục"
          value={newExpense.category}
          onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={newExpense.person}
          onChange={e => setNewExpense({ ...newExpense, person: e.target.value })}
        >
          {members.map(m => (
            <option key={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded"
        onClick={handleAddExpense}
      >
        Thêm
      </button>
    </div>
  )

  // ======================= Render =======================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white min-h-screen">
          <div className="p-4 border-b border-slate-800">
            <h1 className="text-lg font-semibold">Team Bill</h1>
          </div>
          <nav className="p-4 space-y-2">
            {/* <button className="flex items-center gap-3 px-3 py-2 rounded bg-slate-800">Bảng điều khiển</button>
            <button onClick={() => setIsOpen(true)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800" >Quản lý chi phí</button>
            <button onClick={() => setIsOpen(true)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800">Thành viên nhóm</button>
            <button onClick={() => setIsOpen(true)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800">Chia hóa đơn</button> */}

            <Link className="flex items-center gap-3 px-3 py-2 rounded bg-slate-800" href="/">Bảng điều khiển</Link>
            <Link className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800" href="/expenses">Quản lý chi phí</Link>
            <Link className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800" href="/members">Thành viên nhóm</Link>
            <Link className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800" href="/">Chia hóa đơn</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Bảng điều khiển</h2>
              <p className="text-sm text-slate-500">Tổng quan chi tiêu và thanh toán của nhóm</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Xin chào,</div>
                <div className="font-medium">Người dùng</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">N</div>
            </div>
          </header>

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Tổng chi tiêu" value={`${total.toFixed(2)} VND`} accent="red" />
            <StatCard title="Thành viên" value={String(members.length)} accent="amber" />
            <StatCard title="Thanh toán chờ xử lý" value={`${pending.toFixed(2)} VND`} accent="red" />
            <StatCard title="Tháng này" value={`${total.toFixed(2)} VND`} accent="amber" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2">
              <ExpenseTable data={expenses} />
              <AddExpenseForm />
            </div>

            {/* Categories + Pie Chart */}
            <aside className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-4">Danh mục chi tiêu</h3>

              {/* Biểu đồ hình tròn */}
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => {
                        return `${name} ${(percent * 100).toFixed(0)}%`;
                      }}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}
