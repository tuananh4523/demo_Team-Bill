"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { Modal, Input, Tooltip, message, Select, Button, Space } from "antd";
import axios from "axios";

import type { EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { DateClickArg, EventResizeDoneArg } from "@fullcalendar/interaction";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  teamId: string;
  color: string;
};

type CalendarViewProps = {
  events: CalendarEvent[];
  teamId: string;
  onEventAdded?: (event: CalendarEvent) => void;
  onEventUpdated?: (event: CalendarEvent) => void;
  onEventDeleted?: (eventId: string) => void;
};

const API_BASE = "http://localhost:8080/api";

export default function CalendarView({
  events,
  teamId,
  onEventAdded,
  onEventUpdated,
  onEventDeleted,
}: CalendarViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // ✅ Thêm sự kiện
  const handleDateClick = (info: DateClickArg) => {
    setNewEventDate(info.date);
    setIsAddModalOpen(true);
  };

  const handleAddEvent = async () => {
    if (!newEventDate || !newEventTitle.trim()) return;

    const payload = {
      teamId,
      title: newEventTitle,
      total: 0,
      date: newEventDate.toISOString(),
      members: [],
      color: "#3788d8",
    };

    try {
      const res = await axios.post(`${API_BASE}/splits`, payload);

      const newEvent: CalendarEvent = {
        id: res.data._id,
        title: res.data.title,
        start: res.data.date,
        teamId: res.data.teamId,
        color: res.data.color || "#3788d8",
      };

      message.success("Thêm sự kiện thành công 🎉");
      if (onEventAdded) onEventAdded(newEvent);
    } catch {
      message.error("Lỗi khi lưu sự kiện");
    }

    setIsAddModalOpen(false);
    setNewEventDate(null);
    setNewEventTitle("");
  };

  // ✅ Drag/Resize cập nhật sự kiện
  const updateEventTime = async (eventId: string, start: Date, end: Date | null) => {
    try {
      const payload = {
        start: start.toISOString(),
        end: end ? end.toISOString() : null,
      };

      const res = await axios.put(`${API_BASE}/splits/${eventId}`, payload);

      const updatedEvent: CalendarEvent = {
        id: res.data._id,
        title: res.data.title,
        start: res.data.date,
        end: res.data.end,
        teamId: res.data.teamId,
        color: res.data.color || "#3788d8",
      };

      message.success("Cập nhật sự kiện thành công ✅");
      if (onEventUpdated) onEventUpdated(updatedEvent);
    } catch {
      message.error("Lỗi khi cập nhật sự kiện");
    }
  };

  // ✅ Edit sự kiện (mở modal)
  const handleEventClick = (info: EventClickArg) => {
    setEditingEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start?.toISOString() || "",
      end: info.event.end?.toISOString(),
      teamId,
      color: info.event.backgroundColor,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    try {
      const payload = {
        title: editingEvent.title,
        color: editingEvent.color,
      };

      const res = await axios.put(`${API_BASE}/splits/${editingEvent.id}`, payload);

      const updatedEvent: CalendarEvent = {
        id: res.data._id,
        title: res.data.title,
        start: res.data.date,
        end: res.data.end,
        teamId: res.data.teamId,
        color: res.data.color || "#3788d8",
      };

      message.success("Cập nhật sự kiện thành công ✅");
      if (onEventUpdated) onEventUpdated(updatedEvent);
    } catch {
      message.error("Lỗi khi cập nhật sự kiện");
    }

    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  // ✅ Xoá sự kiện
  const handleDeleteEvent = async () => {
    if (!editingEvent) return;

    try {
      await axios.delete(`${API_BASE}/splits/${editingEvent.id}`);
      message.success("Xoá sự kiện thành công 🗑️");

      if (onEventDeleted) onEventDeleted(editingEvent.id);
    } catch {
      message.error("Lỗi khi xoá sự kiện");
    }

    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <>
      <FullCalendar
        locale={viLocale}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        height="auto"
        selectable
        editable
        nowIndicator
        eventDisplay="block"
        eventColor="#3788d8"
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={(info: EventDropArg) => {
          updateEventTime(info.event.id, info.event.start!, info.event.end);
        }}
        eventResize={(info: EventResizeDoneArg) => {
          updateEventTime(info.event.id, info.event.start!, info.event.end);
        }}
        eventContent={(arg) => (
          <Tooltip title={arg.event.title}>
            <div
              style={{
                backgroundColor: arg.event.backgroundColor || "#3788d8",
                color: "white",
                padding: "2px 4px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {arg.event.title}
            </div>
          </Tooltip>
        )}
      />

      {/* Modal thêm event */}
      <Modal
        title="Thêm sự kiện mới"
        open={isAddModalOpen}
        onOk={handleAddEvent}
        onCancel={() => setIsAddModalOpen(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <p>
          Ngày: <strong>{newEventDate?.toLocaleString("vi-VN")}</strong>
        </p>
        <Input
          placeholder="Nhập tiêu đề sự kiện"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
        />
      </Modal>

      {/* Modal chỉnh sửa / xoá event */}
      <Modal
        title="Chỉnh sửa sự kiện"
        open={isEditModalOpen}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Lưu"
        cancelText="Đóng"
        footer={[
          <Button key="delete" danger onClick={handleDeleteEvent}>
            Xoá
          </Button>,
          <Button key="cancel" onClick={() => setIsEditModalOpen(false)}>
            Đóng
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveEdit}>
            Lưu
          </Button>,
        ]}
      >
        <Space direction="vertical" className="w-full">
          <Input
            placeholder="Tiêu đề sự kiện"
            value={editingEvent?.title}
            onChange={(e) =>
              setEditingEvent((prev) =>
                prev ? { ...prev, title: e.target.value } : prev
              )
            }
          />
          <Select
            value={editingEvent?.color}
            onChange={(val) =>
              setEditingEvent((prev) => (prev ? { ...prev, color: val } : prev))
            }
            className="w-full"
          >
            <Select.Option value="#3788d8">Xanh dương</Select.Option>
            <Select.Option value="#34a853">Xanh lá</Select.Option>
            <Select.Option value="#fbbc05">Vàng</Select.Option>
            <Select.Option value="#ea4335">Đỏ</Select.Option>
          </Select>
        </Space>
      </Modal>
    </>
  );
}
