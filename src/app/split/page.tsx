"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

type Member = {
  id: number
  name: string
  paid: number
}

type Bill = {
  id: number
  members: Member[]
  total: number
  date: string
}

export default function BillSplitPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [name, setName] = useState("")
  const [paid, setPaid] = useState("")
  const [history, setHistory] = useState<Bill[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("billHistory")
    if (stored) setHistory(JSON.parse(stored))
  }, [])

  const saveHistory = (newHistory: Bill[]) => {
    setHistory(newHistory)
    localStorage.setItem("billHistory", JSON.stringify(newHistory))
  }

  const addMember = () => {
    if (!name) return
    setMembers([
      ...members,
      { id: Date.now(), name, paid: parseFloat(paid) || 0 },
    ])
    setName("")
    setPaid("")
  }

  const total = members.reduce((acc, m) => acc + m.paid, 0)
  const equalShare = members.length > 0 ? total / members.length : 0

  const settlements = members.map((m) => ({
    name: m.name,
    paid: m.paid,
    balance: m.paid - equalShare,
  }))

  const saveBill = () => {
    if (members.length === 0) return
    const bill: Bill = {
      id: Date.now(),
      members,
      total,
      date: new Date().toLocaleString(),
    }
    saveHistory([bill, ...history])
    setMembers([]) // reset sau khi lưu
  }

  const deleteBill = (id: number) => {
    const newHistory = history.filter((b) => b.id !== id)
    saveHistory(newHistory)
  }

  const exportExcel = () => {
    const wsData: any[] = []

    history.forEach((bill) => {
      wsData.push([`Hóa đơn ngày ${bill.date}`, `Tổng: ${bill.total}đ`])
      wsData.push(["Tên", "Đã trả"])
      bill.members.forEach((m) => {
        wsData.push([m.name, m.paid])
      })
      wsData.push([]) // dòng trống
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Lịch sử")
    XLSX.writeFile(wb, "lich_su_hoa_don.xlsx")
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Lịch sử hóa đơn", 14, 16)

    history.forEach((bill, idx) => {
      doc.text(
        `Hóa đơn ${idx + 1} - ${bill.date} (Tổng: ${bill.total}đ)`,
        14,
        30 + idx * 70
      )
      const rows = bill.members.map((m) => [m.name, m.paid])
      ;(doc as any).autoTable({
        startY: 35 + idx * 70,
        head: [["Tên", "Đã trả"]],
        body: rows,
        theme: "grid",
      })
    })

    doc.save("lich_su_hoa_don.pdf")
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Chia hóa đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="equal">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="equal">Chia đều</TabsTrigger>
              <TabsTrigger value="paid">Theo số tiền đã trả</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>

            {/* Form thêm thành viên */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Số tiền đã trả"
                type="number"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
              />
              <Button onClick={addMember}>Thêm</Button>
            </div>

            {/* Chia đều */}
            <TabsContent value="equal">
              <p>Tổng: {total}đ</p>
              <p>Mỗi người: {equalShare.toFixed(0)}đ</p>
              <ul className="mt-2 list-disc pl-6">
                {members.map((m) => (
                  <li key={m.id}>
                    {m.name} cần trả: {equalShare.toFixed(0)}đ
                  </li>
                ))}
              </ul>
              <Button onClick={saveBill} className="mt-4">
                Lưu hóa đơn
              </Button>
            </TabsContent>

            {/* Theo số tiền đã trả */}
            <TabsContent value="paid">
              <p>Tổng: {total}đ</p>
              <ul className="mt-2 list-disc pl-6">
                {settlements.map((m) => (
                  <li key={m.name}>
                    {m.name} ({m.paid}đ) →{" "}
                    {m.balance >= 0
                      ? `Nhận lại ${m.balance.toFixed(0)}đ`
                      : `Cần trả ${(-m.balance).toFixed(0)}đ`}
                  </li>
                ))}
              </ul>
              <Button onClick={saveBill} className="mt-4">
                Lưu hóa đơn
              </Button>
            </TabsContent>

            {/* Lịch sử */}
            <TabsContent value="history">
              {history.length === 0 ? (
                <p>Chưa có hóa đơn nào được lưu.</p>
              ) : (
                <div>
                  <div className="flex gap-2 mb-4">
                    <Button onClick={exportExcel}>Xuất Excel</Button>
                    <Button onClick={exportPDF}>Xuất PDF</Button>
                  </div>
                  <ul className="space-y-4">
                    {history.map((bill) => (
                      <li
                        key={bill.id}
                        className="border rounded-lg p-3 flex justify-between"
                      >
                        <div>
                          <p className="font-semibold">
                            {bill.date} - Tổng: {bill.total}đ
                          </p>
                          <ul className="list-disc pl-6 text-sm">
                            {bill.members.map((m) => (
                              <li key={m.id}>
                                {m.name}: {m.paid}đ
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteBill(bill.id)}
                        >
                          Xoá
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
