"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts"

type Bill = {
  id: number
  description: string
  total: number
  members: { name: string; amount: number }[]
  date: string
}

export default function BillHistoryPage() {
  const [history, setHistory] = useState<Bill[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("billHistory")
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  // Gom dữ liệu theo người trả
  const memberSummary = history.flatMap(bill => bill.members)
    .reduce((acc, m) => {
      acc[m.name] = (acc[m.name] || 0) + m.amount
      return acc
    }, {} as Record<string, number>)

  const memberData = Object.entries(memberSummary).map(([name, value]) => ({
    name,
    value,
  }))

  // Gom dữ liệu theo thời gian (ví dụ theo tháng)
  const monthSummary = history.reduce((acc, bill) => {
    const month = new Date(bill.date).toLocaleString("vi-VN", { month: "short", year: "numeric" })
    acc[month] = (acc[month] || 0) + bill.total
    return acc
  }, {} as Record<string, number>)

  const monthData = Object.entries(monthSummary).map(([month, total]) => ({
    month,
    total,
  }))

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#22c55e"]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📊 Thống kê chi tiêu</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ tròn theo người trả */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Tổng chi theo từng thành viên</h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={memberData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {memberData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ cột theo tháng */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Tổng chi theo tháng</h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={monthData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
