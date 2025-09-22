"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Card,
  Modal,
  Form,
  DatePicker,
  message,
  List,
  Spin,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";

// ================== Types ==================
type Group = {
  _id: string;
  name: string;
};

type EventApiResponse = {
  _id: string;
  teamId: string;
  total: number;
  date: string;
  title?: string;
  color?: string;
};

type EventItem = {
  id: string;
  title: string;
  start: string;
  groupId: string;
  color: string;
};

type FormValues = {
  title: string;
  date: Dayjs;
};

const API_BASE = "http://localhost:8080/api";

export default function CalendarPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<FormValues>();

  // ================== Load groups ==================
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Group[]>(`${API_BASE}/teams`);
        setGroups(res.data);
      } catch {
        message.error("Lỗi tải nhóm");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // ================== Load events ==================
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get<EventApiResponse[]>(`${API_BASE}/splits`);
        const mapped: EventItem[] = res.data.map((ev, i) => ({
          id: ev._id,
          title: ev.title || `${ev.total?.toLocaleString()} VNĐ`,
          start: ev.date,
          groupId: ev.teamId,
          color: ev.color || ["#FF9AA2", "#B5EAD7", "#AEC6CF"][i % 3],
        }));
        setEvents(mapped);
        setFilteredEvents(mapped);
      } catch {
        message.error("Lỗi tải sự kiện");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // ================== Filter events theo nhóm ==================
  const handleGroupClick = (groupId: string) => {
    if (!groupId) {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((ev) => ev.groupId === groupId));
    }
  };

  // ================== Lưu sự kiện ==================
  const handleAddEvent = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        date: values.date.format("YYYY-MM-DDTHH:mm:ss"),
      };
      await axios.post(`${API_BASE}/splits`, payload);
      message.success("Thêm sự kiện thành công");
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Lỗi khi lưu sự kiện");
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-gray-800 relative">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50 p-4">
        <h2 className="font-bold text-lg mb-4">Quản lý sự kiện & nhóm</h2>

        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-2">Friends</h3>
          <List
            size="small"
            dataSource={["Fiker Tadesse", "Casey Rueda", "Kenneth Freirich", "Jacob Kriss"]}
            renderItem={(item) => <List.Item className="cursor-pointer">{item}</List.Item>}
          />
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-2">Friend Groups</h3>
          <List
            size="small"
            dataSource={groups.map((g) => g.name)}
            renderItem={(item) => (
              <List.Item
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  const g = groups.find((gr) => gr.name === item);
                  if (g) handleGroupClick(g._id);
                }}
              >
                {item}
              </List.Item>
            )}
          />
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-2">Work Groups</h3>
          <List
            size="small"
            dataSource={["MB107 Team", "SD09 Team"]}
            renderItem={(item) => (
              <List.Item
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleGroupClick(item)}
              >
                {item}
              </List.Item>
            )}
          />
        </div>
      </aside>

      {/* Calendar */}
      <main className="flex-1 p-6">
        <Spin spinning={loading}>
          <Card className="shadow-md relative">
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
              selectable
              editable
              height="auto"
              dateClick={(info) => {
                setIsModalOpen(true);
                form.setFieldsValue({ date: dayjs(info.date) });
              }}
              eventClick={(info) => {
                message.info(`Sự kiện: ${info.event.title}`);
              }}
            />
          </Card>
        </Spin>
      </main>

      {/* Nút thêm sự kiện (floating) */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        className="!fixed bottom-6 right-6 shadow-xl"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </Button>

      {/* Modal thêm sự kiện */}
      <Modal
        title="Thêm sự kiện"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddEvent}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="title"
            label="Tên sự kiện"
            rules={[{ required: true, message: "Nhập tên sự kiện" }]}
          >
            <Input placeholder="Ví dụ: Ăn trưa nhóm" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Ngày giờ"
            rules={[{ required: true, message: "Chọn ngày giờ" }]}
          >
            <DatePicker showTime className="w-full" format="DD/MM/YYYY HH:mm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
