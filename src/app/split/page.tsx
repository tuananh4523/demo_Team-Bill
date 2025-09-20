"use client";

import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  List,
  Table,
  Tag,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Modal,
  Form,
  DatePicker,
  Select,
  Spin,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import Topbar from "@/components/Topbar";
import AuthModal, { User } from "@/app/login/AuthModal";

// FullCalendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import googleCalendarPlugin from "@fullcalendar/google-calendar";

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

const API_BASE = "http://localhost:8080/api";

// ================= Component =================
export default function BillSplitPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [form] = Form.useForm();

  // ================= Load Groups =================
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/teams`);
        setGroups(res.data);
      } catch {
        message.error("Lỗi load teams");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // ================= Load Events =================
  const loadEventsByGroup = async (groupId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/teams/${groupId}/splits`);
      setEvents(res.data);
      setFilteredEvents(res.data);
      setIsFiltered(false);
    } catch {
      message.error("Lỗi load events theo group");
    } finally {
      setLoading(false);
    }
  };

  // ================= Save Event =================
  const handleSaveEvent = async () => {
    if (!selectedGroup) return;
    try {
      const values = await form.validateFields();

      const payers = values.payers || [];
      const members = selectedGroup.members.map((m) => {
        const paid =
          payers.find((p: any) => p.memberId === m._id)?.amount || 0;
        return { name: m.name, paid };
      });

      const payload = {
        teamId: selectedGroup._id,
        total: Number(values.total),
        date: values.date.format("YYYY-MM-DD"),
        members,
      };

      if (editingEvent) {
        await axios.put(`${API_BASE}/splits/${editingEvent._id}`, payload);
        message.success("Cập nhật sự kiện thành công");
      } else {
        await axios.post(`${API_BASE}/splits`, payload);
        message.success("Thêm sự kiện thành công");
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      form.resetFields();

      loadEventsByGroup(selectedGroup._id);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi lưu sự kiện");
    }
  };

  // ================= Delete Event =================
  const deleteEvent = async (id: string) => {
    if (!selectedGroup) return;
    try {
      await axios.delete(`${API_BASE}/splits/${id}`);
      message.success("🗑️ Xoá sự kiện thành công");

      loadEventsByGroup(selectedGroup._id);
      if (selectedEvent?._id === id) setSelectedEvent(null);
    } catch {
      message.error("Lỗi xoá event");
    }
  };

  // ================= Split Logic =================
  const getSplitData = () => {
    if (!selectedGroup || !selectedEvent) return [];
    const perPerson =
      selectedGroup.members.length > 0
        ? (selectedEvent.total ?? 0) / selectedGroup.members.length
        : 0;

    return selectedGroup.members.map((m) => {
      const paid =
        selectedEvent.members.find((mm) => mm.name === m.name)?.paid || 0;
      return {
        name: m.name,
        paid,
        mustPay: perPerson,
        balance: paid - perPerson,
      };
    });
  };

  // ================= Render =================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Topbar user={user} onAvatarClick={() => setIsAuthOpen(true)} />

      <main className="p-6">
        <Spin spinning={loading}>
          <Row gutter={16}>
            {/* Bên trái: FullCalendar */}
            <Col xs={24} lg={16}>
              <Card title="Lịch sự kiện" className="mb-6 w-full">
                <FullCalendar
                  plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin,
                    googleCalendarPlugin,
                  ]}
                  initialView="timeGridWeek"
                  googleCalendarApiKey="YOUR_GOOGLE_API_KEY" // 🔑 thay bằng API Key thật
                  events={{
                    googleCalendarId:
                      "your_calendar_id@group.calendar.google.com", // 🔑 thay Calendar ID
                  }}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  height="auto"
                  selectable={true}
                  editable={true}
                  eventClick={(info) => {
                    alert(`📅 Sự kiện: ${info.event.title}`);
                  }}
                  dateClick={(info) => {
                    message.info(`Bạn click ngày: ${info.dateStr}`);
                  }}
                />
              </Card>

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
            </Col>

            {/* Bên phải: Nhóm + Sự kiện */}
            <Col xs={24} lg={8}>
              <Card title="Quản lý nhóm & sự kiện" className="w-full">
                <Card title="Nhóm" size="small" className="mb-6">
                  <List
                    bordered
                    dataSource={groups}
                    renderItem={(g) => (
                      <List.Item
                        onClick={() => {
                          setSelectedGroup(g);
                          setSelectedEvent(null);
                          loadEventsByGroup(g._id);
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

                {selectedGroup && (
                  <Card
                    title="Sự kiện"
                    size="small"
                    className="mb-6"
                    extra={
                      <Space>
                        <Button
                          type="primary"
                          onClick={() => {
                            setEditingEvent(null);
                            form.resetFields();
                            setIsModalOpen(true);
                          }}
                        >
                          + Thêm sự kiện
                        </Button>
                        {isFiltered && (
                          <Button onClick={() => setFilteredEvents(events)}>
                            Xem tất cả
                          </Button>
                        )}
                      </Space>
                    }
                  >
                    <List
                      bordered
                      dataSource={filteredEvents}
                      renderItem={(ev) => (
                        <List.Item
                          actions={[
                            <Button
                              key="edit"
                              type="link"
                              onClick={() => {
                                setEditingEvent(ev);
                                form.setFieldsValue({
                                  total: ev.total,
                                  date: dayjs(ev.date),
                                  payers: ev.members
                                    .filter((m) => m.paid > 0)
                                    .map((m) => ({
                                      memberId:
                                        selectedGroup.members.find(
                                          (sm) => sm.name === m.name
                                        )?._id || "",
                                      amount: m.paid,
                                    })),
                                });
                                setIsModalOpen(true);
                              }}
                            >
                              Sửa
                            </Button>,
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
              </Card>
            </Col>
          </Row>
        </Spin>
      </main>

      {/* Modal thêm/sửa sự kiện */}
      <Modal
        title={editingEvent ? "Sửa sự kiện" : "Thêm sự kiện"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSaveEvent}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="total"
            label="Tổng số tiền"
            rules={[{ required: true, message: "Nhập tổng số tiền" }]}
          >
            <Input type="number" placeholder="Nhập số tiền (VNĐ)" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày"
            rules={[{ required: true, message: "Chọn ngày" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.List name="payers">
            {(fields, { add, remove }) => (
              <div>
                <label className="block font-medium mb-2">Người trả</label>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    align="baseline"
                    className="mb-3 flex w-full justify-between"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "memberId"]}
                      className="flex-1"
                      rules={[{ required: true, message: "Chọn thành viên" }]}
                    >
                      <Select placeholder="Chọn người trả">
                        {selectedGroup?.members.map((m) => (
                          <Select.Option key={m._id} value={m._id}>
                            {m.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "amount"]}
                      className="w-40"
                      rules={[{ required: true, message: "Nhập số tiền" }]}
                    >
                      <Input type="number" placeholder="Số tiền" />
                    </Form.Item>

                    <Button
                      type="text"
                      danger
                      onClick={() => remove(name)}
                      style={{ padding: "0 8px" }}
                    >
                      Xóa
                    </Button>
                  </Space>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  style={{ marginTop: 8 }}
                >
                  + Thêm người trả
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
