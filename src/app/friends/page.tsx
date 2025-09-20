"use client";

import { useState, useEffect } from "react";
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
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
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

const API_URL = "http://localhost:8080/api";

export default function FriendsPage() {
  const [data, setData] = useState<Friend[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Friend | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [form] = Form.useForm();

  // ================= Load dữ liệu từ API =================
  const loadData = async () => {
    try {
      const [membersRes, teamsRes] = await Promise.all([
        axios.get(`${API_URL}/members`),
        axios.get(`${API_URL}/teams`),
      ]);

      const members = membersRes.data; // [{_id, name, email, role, status, teamId}]
      const teams = teamsRes.data; // [{_id, name, members: [...] }]

      // Map member -> Friend
      const mappedData: Friend[] = members.map((m: any) => {
        const groups = teams
          .filter((t: any) => t.members.some((tm: any) => tm._id === m._id))
          .map((t: any) => t.name);

        return {
          key: m._id,
          name: m.name,
          email: m.email,
          role: m.role || "Thành viên",
          groups,
          status: m.status === "Active" ? "Active" : "Inactive",
          avatar: `https://i.pravatar.cc/40?u=${m.email}`,
        };
      });

      setData(mappedData);
    } catch (err) {
      message.error("❌ Lỗi tải dữ liệu bạn bè");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ================= CRUD =================
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await axios.put(`${API_URL}/members/${editingUser.key}`, values);
        message.success("✅ Cập nhật bạn thành công!");
      } else {
        await axios.post(`${API_URL}/members`, values);
        message.success("✅ Thêm bạn mới thành công!");
      }
      setIsModalOpen(false);
      form.resetFields();
      loadData();
    } catch {
      message.error("❌ Lỗi khi lưu bạn bè");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/members/${id}`);
      message.success("🗑️ Xoá thành công");
      loadData();
    } catch {
      message.error("❌ Lỗi khi xoá bạn bè");
    }
  };

  // ================= Table Columns =================
  const columns: ColumnsType<Friend> = [
    {
      title: "Tên",
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
      title: "Vai trò",
      dataIndex: "role",
    },
    {
      title: "Nhóm",
      dataIndex: "groups",
      render: (groups: string[]) => groups.join(", "),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status === "Active" ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Button type="link" onClick={() => console.log("Reset mật khẩu")}>
            Đặt lại mật khẩu
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.key)}>
            Xoá
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
              Thêm bạn mới
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

      {/* Modal Thêm/Sửa bạn */}
      <Modal
        title={editingUser ? "Sửa thông tin bạn" : "Thêm bạn mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
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
          <Form.Item name="groups" label="Nhóm">
            <Select mode="tags" placeholder="Thêm nhóm" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="Active">
            <Select>
              <Select.Option value="Active">Hoạt động</Select.Option>
              <Select.Option value="Inactive">Ngưng hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
