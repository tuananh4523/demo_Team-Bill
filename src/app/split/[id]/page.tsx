"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Input,
  Button,
  Card,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Form,
  DatePicker,
  Select,
  Spin,
  Row,
  Col,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";

import Topbar from "@/components/Topbar";
import AuthModal, { User } from "@/app/login/AuthModal";
import EventGroup from "@/app/split/event_group";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";

// ========== Types ==========
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

export type EventApiResponse = {
  _id: string;
  teamId: string;
  members: { name: string; paid: number }[];
  total: number;
  date: string;
  title?: string;
  color?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  teamId: string;
  color: string;
};

const API_BASE = "http://localhost:8080/api";

export default function BillSplitPage() {
  const { id } = useParams<{ id: string }>(); // lấy id nhóm từ URL

  const [group, setGroup] = useState<Group | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventApiResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventApiResponse | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [form] = Form.useForm();

  // ========== Load Group by ID ==========
  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Group>(`${API_BASE}/teams/${id}`);
        setGroup(res.data);
      } catch {
        message.error("Lỗi load nhóm");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGroup();
  }, [id]);

  // ========== Load Events ==========
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get<EventApiResponse[]>(`${API_BASE}/splits`);
        const mapped: CalendarEvent[] = res.data.map((ev, i) => ({
          id: ev._id,
          title: ev.title || `${ev.total?.toLocaleString()} VNĐ`,
          start: ev.date,
          teamId: ev.teamId,
          color: ev.color || ["#FF9AA2", "#B5EAD7", "#AEC6CF"][i % 3],
        }));
        setEvents(mapped);
        // chỉ lọc sự kiện của group đang mở
        if (id) {
          setFilteredEvents(mapped.filter((ev) => ev.teamId === id));
        }
      } catch {
        message.error("Lỗi load sự kiện");
      }
    };
    fetchEvents();
  }, [id]);

  // ========== Lưu sự kiện ==========
  const handleSaveEvent = async () => {
    if (!group) return;
    try {
      const values = await form.validateFields();

      const payers = values.payers || [];
      const members = group.members.map((m) => {
        const paid =
          payers.find((p: { memberId: string; amount: number }) => p.memberId === m._id)?.amount ||
          0;
        return { name: m.name, paid };
      });

      const payload = {
        teamId: group._id,
        total: Number(values.total),
        date: (values.date as Dayjs).format("YYYY-MM-DD"),
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
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi lưu sự kiện");
    }
  };

  // ========== Tính toán chia tiền ==========
  const getSplitData = () => {
    if (!group || !selectedEvent) return [];
    const perPerson =
      group.members.length > 0 ? (selectedEvent.total ?? 0) / group.members.length : 0;

    return group.members.map((m) => {
      const paid = selectedEvent.members.find((mm) => mm.name === m.name)?.paid || 0;
      return {
        name: m.name,
        paid,
        mustPay: perPerson,
        balance: paid - perPerson,
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Topbar user={user} onAvatarClick={() => setIsAuthOpen(true)} />

      <div className="flex-1 p-6">
        <Spin spinning={loading}>
          <Row gutter={16}>
            {/* Bên trái: Calendar */}
            <Col xs={24} lg={18}>
              <Card title={`Lịch sự kiện - ${group?.name || ""}`} className="mb-6 w-full relative">
                <FullCalendar
                  locale={viLocale}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  events={filteredEvents}
                  height="auto"
                  selectable
                  editable
                  eventClick={(info) => {
                    message.info(`Sự kiện: ${info.event.title}`);
                  }}
                  dateClick={(info) => {
                    setIsModalOpen(true);
                    form.setFieldsValue({ date: dayjs(info.date) });
                  }}
                />

                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  className="!absolute bottom-4 right-4 shadow-lg"
                  onClick={() => setIsModalOpen(true)}
                >
                  +
                </Button>
              </Card>

              {group && selectedEvent && (
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

            {/* Bên phải: Quản lý nhóm & sự kiện */}
            <Col xs={24} lg={6}>
              <EventGroup
                friends={group?.members.map((m) => m.name) || []}
                selectedDate={dayjs()}
                onDateChange={() => {}}
              />
            </Col>
          </Row>
        </Spin>
      </div>

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
                  <Space key={key} align="baseline" className="mb-3 flex w-full justify-between">
                    <Form.Item
                      {...restField}
                      name={[name, "memberId"]}
                      className="flex-1"
                      rules={[{ required: true, message: "Chọn thành viên" }]}
                    >
                      <Select placeholder="Chọn người trả">
                        {group?.members.map((m) => (
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

                <Button type="dashed" onClick={() => add()} block style={{ marginTop: 8 }}>
                  Thêm người trả
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
