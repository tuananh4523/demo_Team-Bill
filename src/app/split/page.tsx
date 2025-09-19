"use client";

import { useState, useEffect } from "react";
import { DatePicker, Input, Button, Card, List, Table, Tag, Space, message, Popconfirm } from "antd";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import axios from "axios";
import Breadcrumb from "@/components/Breadcrumb";

// ================= Types =================
export type Member = {
  _id: string;
  name: string;
  role: string;
  email: string;
  status: string;
};

export type Group = {
  _id: string;
  name: string;
  members: Member[];
};

type Event = {
  _id: string;
  members: { name: string; paid: number }[];
  total: number;
  date: string;
};

// ================= Config =================
const API_BASE = "http://localhost:8080/api";

// ================= Component =================
export default function BillSplitPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Form state
  const [eventTotal, setEventTotal] = useState("");
  const [eventDate, setEventDate] = useState(dayjs().format("YYYY-MM-DD"));

  // ================= Load Groups =================
  useEffect(() => {
    axios
      .get(`${API_BASE}/teams`)
      .then((res) => setGroups(res.data))
      .catch(() => message.error("❌ Lỗi load teams"));
  }, []);

  // ================= Load Events theo Group =================
  const loadEventsByGroup = async (groupId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/teams/${groupId}/splits`);
      setEvents(res.data);
    } catch {
      message.error("❌ Lỗi load events theo group");
    }
  };

  // ================= Event CRUD =================
  const addEvent = async () => {
    if (!selectedGroup || !eventTotal) return;
    try {
      const res = await axios.post(`${API_BASE}/splits`, {
        teamId: selectedGroup._id,
        members: selectedGroup.members.map((m) => ({
          name: m.name,
          paid: 0,
        })),
        total: parseFloat(eventTotal),
        date: eventDate,
      });
      const newEvent = res.data;
      setEvents((prev) => [...prev, newEvent]);
      setSelectedEvent(newEvent);
      setEventTotal("");
      message.success("✅ Thêm sự kiện thành công");
    } catch (err) {
      message.error("❌ Lỗi thêm event");
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/splits/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      if (selectedEvent?._id === id) setSelectedEvent(null);
      message.success("🗑️ Xoá sự kiện thành công");
    } catch (err) {
      message.error("❌ Lỗi xoá event");
    }
  };

  // ================= Split Logic =================
  const getSplitData = () => {
    if (!selectedGroup || !selectedEvent) return [];
    const perPerson =
      selectedGroup.members.length > 0
        ? (selectedEvent.total ?? 0) / selectedGroup.members.length
        : 0;
    return selectedGroup.members.map((m) => ({
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
      `Sự kiện ID: ${selectedEvent._id}`,
      `Ngày: ${dayjs(selectedEvent.date).format("YYYY-MM-DD")}`,
      `Tổng: ${(selectedEvent.total ?? 0).toLocaleString()} VNĐ`,
    ]);
    wsData.push(["Tên", "Đã trả", "Phải trả", "Cân bằng"]);
    data.forEach((row) => {
      wsData.push([
        row.name,
        row.paid,
        (row.mustPay ?? 0).toLocaleString(),
        (row.balance ?? 0).toLocaleString(),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chia hóa đơn");
    XLSX.writeFile(wb, "chia_hoa_don.xlsx");
  };

  const exportPDF = () => {
    if (!selectedGroup || !selectedEvent) return;
    const data = getSplitData();
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Nhóm: ${selectedGroup.name}`, 14, 16);
    doc.text(
      `Sự kiện: ${selectedEvent._id} (${dayjs(selectedEvent.date).format(
        "YYYY-MM-DD"
      )}) - Tổng: ${(selectedEvent.total ?? 0).toLocaleString()} VNĐ`,
      14,
      26
    );

    autoTable(doc, {
      startY: 40,
      head: [["Tên", "Đã trả", "Phải trả", "Cân bằng"]],
      body: data.map((r) => [
        r.name,
        r.paid,
        (r.mustPay ?? 0).toLocaleString(),
        (r.balance ?? 0).toLocaleString(),
      ]),
      theme: "grid",
    });

    doc.save("chia_hoa_don.pdf");
  };

  // ================= Render =================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-4">
        <Breadcrumb />
      </div>

      <Card title="Chia Hoá Đơn" className="max-w-6xl mx-auto">
        {/* Groups Section */}
        <Card title="Nhóm" size="small" className="mb-6">
          <List
            bordered
            dataSource={groups}
            renderItem={(g) => (
              <List.Item
                onClick={() => {
                  setSelectedGroup(g);
                  setSelectedEvent(null);
                  loadEventsByGroup(g._id); // 👉 gọi API khi chọn nhóm
                }}
                className={`cursor-pointer ${
                  selectedGroup?._id === g._id ? "bg-slate-100" : ""
                }`}
              >
                <span className="font-medium">
                  {g.name} ({g.members?.length || 0} thành viên)
                </span>
              </List.Item>
            )}
          />
        </Card>

        {/* Events Section */}
        {selectedGroup && (
          <Card title="Sự kiện" size="small" className="mb-6">
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="Tổng tiền"
                type="number"
                value={eventTotal}
                onChange={(e) => setEventTotal(e.target.value)}
              />
              <DatePicker
                value={dayjs(eventDate)}
                onChange={(d) => setEventDate(d?.format("YYYY-MM-DD") || "")}
              />
              <Button type="primary" onClick={addEvent}>
                + Thêm Event
              </Button>
            </Space>

            <List
              bordered
              dataSource={events}
              renderItem={(ev) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      title="Bạn có chắc muốn xoá sự kiện này?"
                      onConfirm={() => deleteEvent(ev._id)}
                      okText="Xoá"
                      cancelText="Huỷ"
                      key="delete"
                    >
                      <Button danger size="small">
                        Xoá
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => setSelectedEvent(ev)}
                  >
                    {ev._id} - {(ev.total ?? 0).toLocaleString()} VNĐ (
                    {dayjs(ev.date).format("YYYY-MM-DD")})
                  </span>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Split Table */}
        {selectedGroup && selectedEvent && (
          <Card title="Bảng chia hoá đơn" size="small" className="mb-6">
            <Table
              size="small"
              rowKey="name"
              dataSource={getSplitData()}
              pagination={false}
              columns={[
                { title: "Tên", dataIndex: "name" },
                { title: "Đã trả", dataIndex: "paid" },
                { title: "Phải trả", dataIndex: "mustPay" },
                {
                  title: "Cân bằng",
                  dataIndex: "balance",
                  render: (val: number) =>
                    val < 0 ? (
                      <Tag color="red">{val.toLocaleString()}</Tag>
                    ) : (
                      <Tag color="green">{val.toLocaleString()}</Tag>
                    ),
                },
              ]}
            />
          </Card>
        )}

        {/* Export */}
        {selectedGroup && selectedEvent && (
          <Space>
            <Button onClick={exportExcel}>Xuất Excel</Button>
            <Button onClick={exportPDF}>Xuất PDF</Button>
          </Space>
        )}
      </Card>
    </div>
  );
}
