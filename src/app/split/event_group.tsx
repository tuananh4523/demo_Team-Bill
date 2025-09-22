"use client";

import { useState } from "react";
import { List, Calendar, Badge, Tooltip, Button, Modal, Form, Input, Space } from "antd";
import type { Dayjs } from "dayjs";

type EventItem = {
  id: string;
  title: string;
  start: string; // ISO date string
  groupId: string;
  color: string;
};

export type Friend = {
  id: string;
  name: string;
};

export type EventGroupProps = {
  friends?: Friend[];
  onAddFriend?: (friend: Friend) => void;
  onEditFriend?: (friend: Friend) => void;
  onDeleteFriend?: (id: string) => void;
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  events?: EventItem[];
};

export default function EventGroup({
  friends = [],
  onAddFriend,
  onEditFriend,
  onDeleteFriend,
  selectedDate,
  onDateChange,
  events = [],
}: EventGroupProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [form] = Form.useForm();

  // Badge highlight ngày có sự kiện
  const dateCellRender = (value: Dayjs) => {
    const dayEvents = events.filter((ev) => value.isSame(ev.start, "day"));
    if (!dayEvents.length) return null;

    return (
      <ul className="events space-y-1">
        {dayEvents.map((ev) => (
          <li key={ev.id}>
            <Tooltip title={ev.title}>
              <Badge color={ev.color} text={ev.title} />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  const openAddModal = () => {
    setEditingFriend(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (friend: Friend) => {
    setEditingFriend(friend);
    form.setFieldsValue(friend);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingFriend) {
        onEditFriend?.({ ...editingFriend, ...values });
      } else {
        onAddFriend?.({ id: Date.now().toString(), ...values });
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      // bỏ qua
    }
  };

  return (
    <div className="w-72 border-r p-4 bg-gray-50 flex flex-col overflow-y-auto">
      {/* Tiêu đề */}
      <h1 className="text-lg font-bold mb-4 text-gray-700">Quản lý sự kiện & nhóm</h1>

      {/* Mini Calendar */}
      <Calendar
        fullscreen={false}
        value={selectedDate}
        onSelect={onDateChange}
        className="mb-6 border rounded-md shadow-sm bg-white"
        dateCellRender={dateCellRender}
      />

      {/* Friends */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">Friends</h2>
        <Button size="small" type="primary" onClick={openAddModal}>
          + Thêm
        </Button>
      </div>
      <List
        size="small"
        bordered
        dataSource={friends}
        renderItem={(friend) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                type="link"
                size="small"
                onClick={() => openEditModal(friend)}
              >
                Sửa
              </Button>,
              <Button
                key="delete"
                type="link"
                danger
                size="small"
                onClick={() => onDeleteFriend?.(friend.id)}
              >
                Xóa
              </Button>,
            ]}
          >
            {friend.name}
          </List.Item>
        )}
        className="mb-6"
      />

      {/* Modal thêm/sửa bạn bè */}
      <Modal
        title={editingFriend ? "Sửa bạn" : "Thêm bạn"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Tên bạn"
            rules={[{ required: true, message: "Nhập tên bạn" }]}
          >
            <Input placeholder="Nhập tên bạn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
