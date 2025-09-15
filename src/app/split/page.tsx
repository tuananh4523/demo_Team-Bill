"use client";

import { useState, useEffect } from "react";
import { DatePicker } from "antd";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import Breadcrumb from "@/components/Breadcrumb";
import type { Group, Member } from "../teams/page";

// ================= Types =================
type Event = {
  id: number;
  name: string;
  total: number;
  date: string;
};

// ================= Component =================
export default function BillSplitPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Form state
  const [eventName, setEventName] = useState("");
  const [eventTotal, setEventTotal] = useState("");
  const [eventDate, setEventDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );

  // ================= Load data =================
  useEffect(() => {
    const storedGroups = localStorage.getItem("groups");
    if (storedGroups) setGroups(JSON.parse(storedGroups));

    const storedEvents = localStorage.getItem("events");
    if (storedEvents) setEvents(JSON.parse(storedEvents));
  }, []);

  const saveEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem("events", JSON.stringify(newEvents));
  };

  // ================= Event CRUD =================
  const addEvent = () => {
    if (!selectedGroup || !eventName || !eventTotal) return;
    const newEvent: Event = {
      id: Date.now(),
      name: eventName,
      total: parseFloat(eventTotal),
      date: eventDate,
    };
    saveEvents([...events, newEvent]);
    setEventName("");
    setEventTotal("");
    setSelectedEvent(newEvent);
  };

  const deleteEvent = (id: number) => {
    const updated = events.filter((e) => e.id !== id);
    saveEvents(updated);
    if (selectedEvent?.id === id) setSelectedEvent(null);
  };

  // ================= Split Logic =================
  const getSplitData = () => {
    if (!selectedGroup || !selectedEvent) return [];
    const perPerson =
      selectedGroup.members.length > 0
        ? selectedEvent.total / selectedGroup.members.length
        : 0;
    return selectedGroup.members.map((m: Member) => ({
      name: m.name,
      paid: 0,
      mustPay: perPerson,
      balance: 0 - perPerson,
    }));
  };

  // ================= Export =================
  const exportExcel = () => {
    if (!selectedGroup || !selectedEvent) return;
    const data = getSplitData();

    const wsData: (string | number)[][] = [];
    wsData.push([`Nhóm: ${selectedGroup.name}`]);
    wsData.push([
      `Sự kiện: ${selectedEvent.name}`,
      `Ngày: ${selectedEvent.date}`,
      `Tổng: ${selectedEvent.total}đ`,
    ]);
    wsData.push(["Tên", "Đã trả", "Phải trả", "Cân bằng"]);
    data.forEach((row) => {
      wsData.push([row.name, row.paid, row.mustPay, row.balance]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chia hoá đơn");
    XLSX.writeFile(wb, "chia_hoa_don.xlsx");
  };

  const exportPDF = () => {
    if (!selectedGroup || !selectedEvent) return;
    const data = getSplitData();
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Nhóm: ${selectedGroup.name}`, 14, 16);
    doc.text(
      `Sự kiện: ${selectedEvent.name} (${selectedEvent.date}) - Tổng: ${selectedEvent.total}đ`,
      14,
      26
    );

    autoTable(doc, {
      startY: 40,
      head: [["Tên", "Đã trả", "Phải trả", "Cân bằng"]],
      body: data.map((r) => [r.name, r.paid, r.mustPay, r.balance]),
      theme: "grid",
    });

    doc.save("chia_hoa_don.pdf");
  };

  // ================= Render =================
  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <div className="mb-4">
        <Breadcrumb />
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Chia Hoá Đơn</h1>

        {/* Groups Section */}
        <section className="mb-8">
          <h2 className="font-semibold text-lg mb-3">Nhóm</h2>
          <ul className="space-y-2">
            {groups.map((g) => (
              <li
                key={g.id}
                onClick={() => setSelectedGroup(g)}
                className={`p-3 border rounded cursor-pointer hover:bg-slate-50 ${
                  selectedGroup?.id === g.id ? "bg-slate-100" : ""
                }`}
              >
                <span className="font-medium">
                  {g.name} ({g.members.length} thành viên)
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Events Section */}
        {selectedGroup && (
          <section className="mb-8">
            <h2 className="font-semibold text-lg mb-3">Sự kiện</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <input
                className="border rounded p-2"
                placeholder="Tên sự kiện"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
              <input
                className="border rounded p-2"
                placeholder="Tổng tiền"
                type="number"
                value={eventTotal}
                onChange={(e) => setEventTotal(e.target.value)}
              />
              <DatePicker
                className="w-full"
                value={dayjs(eventDate)}
                onChange={(d) => setEventDate(d?.format("YYYY-MM-DD") || "")}
              />
              <button
                onClick={addEvent}
                className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
              >
                + Thêm Event
              </button>
            </div>
            <ul className="space-y-2">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className={`p-3 border rounded flex justify-between items-center ${
                    selectedEvent?.id === ev.id ? "bg-slate-100" : ""
                  }`}
                >
                  <span
                    onClick={() => setSelectedEvent(ev)}
                    className="cursor-pointer"
                  >
                    {ev.name} - {ev.total}đ ({ev.date})
                  </span>
                  <button
                    onClick={() => deleteEvent(ev.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Xoá
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Split Table */}
        {selectedGroup && selectedEvent && (
          <section className="mb-8">
            <h2 className="font-semibold text-lg mb-3">Bảng chia hoá đơn</h2>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Tên</th>
                    <th className="p-2 border">Đã trả</th>
                    <th className="p-2 border">Phải trả</th>
                    <th className="p-2 border">Cân bằng</th>
                  </tr>
                </thead>
                <tbody>
                  {getSplitData().map((r) => (
                    <tr key={r.name} className="hover:bg-slate-50">
                      <td className="p-2 border">{r.name}</td>
                      <td className="p-2 border">{r.paid}</td>
                      <td className="p-2 border">{r.mustPay}</td>
                      <td
                        className={`p-2 border ${
                          r.balance < 0 ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {r.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Export Section */}
        {selectedGroup && selectedEvent && (
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
            >
              Xuất Excel
            </button>
            <button
              onClick={exportPDF}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
            >
              Xuất PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
