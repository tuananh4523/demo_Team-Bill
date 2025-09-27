"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { CalendarEvent } from "@/app/split/[id]/page";

export type BillEditorModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  editingEvent?: CalendarEvent | null;
};

type FormValues = {
  title: string;
  date: Dayjs;
  amount: number;
  category: string;
  note?: string;
};

const categories = [
  { value: "Ăn uống", label: "Ăn uống" },
  { value: "Shopping", label: "Shopping" },
  { value: "Cafe", label: "Cafe" },
  { value: "Đi lại", label: "Đi lại" },
  { value: "Giải trí", label: "Giải trí" },
  { value: "Khác", label: "Khác" },
];

export default function BillEditorModal({
  open,
  onClose,
  onSave,
  editingEvent,
}: BillEditorModalProps) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (editingEvent) {
      form.setFieldsValue({
        title: editingEvent.title,
        date: dayjs(editingEvent.start),
        amount: editingEvent.total,
        category: editingEvent.category,
        note: editingEvent.note,
      });
    } else {
      form.resetFields();
    }
  }, [editingEvent, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newEvent: CalendarEvent = {
        id: editingEvent?.id || String(Date.now()),
        title: values.title,
        start: values.date.toISOString(),
        teamId: editingEvent?.teamId || "team1",
        color: editingEvent?.color || "#6B7280",
        total: values.amount,
        category: values.category,
        note: values.note,
      };
      onSave(newEvent);
      message.success(editingEvent ? "Cập nhật thành công!" : "Thêm chi tiêu thành công!");
      onClose();
    } catch {
      message.error("Vui lòng nhập đầy đủ thông tin!");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingEvent ? "Cập nhật chi tiêu" : "Thêm chi tiêu"}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Huỷ
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit}>
          {editingEvent ? "Cập nhật" : "Lưu"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
          <Input placeholder="Nhập tiêu đề chi tiêu" />
        </Form.Item>
        <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item name="amount" label="Số tiền (VNĐ)" rules={[{ required: true }]}>
          <Input type="number" placeholder="Nhập số tiền" />
        </Form.Item>
        <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
          <Select options={categories} placeholder="Chọn danh mục" />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea placeholder="Thêm ghi chú (nếu có)" rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
