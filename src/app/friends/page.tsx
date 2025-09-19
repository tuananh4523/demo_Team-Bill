"use client";

import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Avatar,
  Space,
  Card,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import Topbar from "@/components/Topbar";
import AuthModal, { User } from "@/app/login/AuthModal";

type Friend = {
  key: string;
  name: string;
  email: string;
  role: string;
  groups: string[];
  status: "Active" | "Inactive";
  avatar?: string;
};

const initialData: Friend[] = [
  {
    key: "1",
    name: "Ian Chesnut",
    email: "ian.chesnut@gmail.com",
    role: "Super Admin",
    groups: ["Falcons", "Stallions"],
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    key: "2",
    name: "Zeki Mokharzada",
    email: "zeki@gmail.com",
    role: "Admin",
    groups: ["Falcons", "Stallions"],
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
];

export default function FriendsPage() {
  const [data, setData] = useState<Friend[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Friend | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [form] = Form.useForm();

  const handleOpenModal = (user?: Friend) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue(user);
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        // Update user
        setData((prev) =>
          prev.map((u) =>
            u.key === editingUser.key ? { ...editingUser, ...values } : u
          )
        );
      } else {
        // Add new user
        const newUser: Friend = {
          key: String(Date.now()),
          ...values,
          avatar: `https://i.pravatar.cc/40?u=${values.email}`,
        };
        setData((prev) => [...prev, newUser]);
      }
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleDelete = (key: string) => {
    setData((prev) => prev.filter((item) => item.key !== key));
  };

  const columns: ColumnsType<Friend> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.avatar} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
    },
    {
      title: "Groups",
      dataIndex: "groups",
      render: (groups: string[]) => groups.join(", "),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === "Active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Edit
          </Button>
          <Button type="link" onClick={() => console.log("Reset password")}>
            Reset Password
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.key)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* ✅ Topbar cố định */}
      <Topbar user={user} onAvatarClick={() => setIsAuthOpen(true)} />

      <main className="p-6">
        <Card
          title={<span className="text-lg font-semibold">Bạn bè</span>}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Add New User
            </Button>
          }
        >
          <Table
            rowSelection={{}}
            rowKey="key"
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      {/* Modal Add/Edit User */}
      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Save"
        cancelText="Cancel"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Invalid email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Input />
          </Form.Item>
          <Form.Item name="groups" label="Groups">
            <Select mode="tags" placeholder="Add groups" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="Active">
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
