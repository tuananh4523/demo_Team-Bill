"use client";

import { Modal, Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { MemberStatus, Member } from "@/app/teams/page";

type MemberModalProps = {
  open: boolean;
  onCancel: () => void;
  onSave: (values: Omit<Member, "_id">) => Promise<void> | void;
  form: FormInstance;
  editingMember?: Member | null;   // cho phép null hoặc undefined
};


export default function MemberModal({
  open,
  onCancel,
  onSave,
  form,
  editingMember,
}: MemberModalProps) {
  return (
    <Modal
      title={editingMember ? "Sửa thành viên" : "Thêm thành viên"}
      open={open}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        await onSave(values);
      }}
      okText="Lưu"
      cancelText="Huỷ"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: "Nhập tên" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Vai trò">
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái" initialValue={MemberStatus.Active}>
          <Select>
            <Select.Option value={MemberStatus.Active}>Hoạt động</Select.Option>
            <Select.Option value={MemberStatus.Inactive}>Ngưng hoạt động</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
