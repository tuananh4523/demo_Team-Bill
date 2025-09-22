"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Modal,
  Card,
  Button,
  Table,
  Space,
  Input,
  Select,
  Form,
  Avatar,
  Tag,
} from "antd";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import AuthModal, { User } from "@/app/login/AuthModal";

export enum MemberStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export type Member = {
  _id: string;
  teamId: string;
  name: string;
  role: string;
  email: string;
  status: MemberStatus;
};

export type Group = {
  _id: string;
  name: string;
  members: Member[];
};

const API_URL = "http://localhost:8080/api";

export default function TeamMembersPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [openGroup, setOpenGroup] = useState<Group | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [form] = Form.useForm();
  const router = useRouter();

  // ================= API =================
  const loadGroupsWithMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Group[]>(`${API_URL}/teams`);
      setGroups(res.data);
    } catch {
      toast.error("Không thể tải danh sách nhóm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupsWithMembers();
  }, []);

  // ================= CRUD Member =================
  const handleSaveMember = async () => {
    if (!openGroup) return;
    try {
      const values = await form.validateFields();
      if (editingMember) {
        await axios.put(`${API_URL}/members/${editingMember._id}`, values);
        toast.success("Cập nhật thành viên thành công!");
      } else {
        await axios.post(`${API_URL}/teams/${openGroup._id}/members`, values);
        toast.success("Thêm thành viên mới thành công!");
      }
      setIsMemberModalOpen(false);
      form.resetFields();
      setEditingMember(null);
      loadGroupsWithMembers();
    } catch {
      toast.error("Lỗi khi lưu thành viên");
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    try {
      await axios.delete(`${API_URL}/members/${id}`);
      toast.success("Xóa thành viên thành công!");
      loadGroupsWithMembers();
    } catch {
      toast.error("Lỗi khi xóa thành viên");
    }
  };

  // ================= Helper: slugify group name =================
 const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();


  // ================= Columns Table =================
  const memberColumns = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (_: unknown, record: Member) => (
        <div className="flex items-center gap-2">
          <Avatar src={`https://i.pravatar.cc/40?u=${record._id}`} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Vai trò", dataIndex: "role" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (val: MemberStatus) =>
        val === MemberStatus.Active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: Member) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingMember(record);
              form.setFieldsValue(record);
              setIsMemberModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteMember(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Topbar user={user} onAvatarClick={() => setIsAuthOpen(true)} />

      <main className="p-6">
        <Card title="Nhóm" className="w-full">
          {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => setOpenGroup(group)}
                  className="bg-white rounded-xl shadow p-5 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">{group.name}</h2>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        group.members.some(
                          (m) => m.status === MemberStatus.Active
                        )
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {group.members.some(
                        (m) => m.status === MemberStatus.Active
                      )
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((m) => (
                      <Avatar
                        key={m._id}
                        src={`https://i.pravatar.cc/32?u=${m._id}`}
                      />
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-200 text-xs rounded-full border-2 border-white">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      {/* Group Detail Modal */}
      <Modal
        title={`Danh sách thành viên - ${openGroup?.name || ""}`}
        open={!!openGroup}
        onCancel={() => setOpenGroup(null)}
        footer={null}
        width={800}
      >
        <div className="mb-4 flex justify-between">
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setEditingMember(null);
              setIsMemberModalOpen(true);
            }}
          >
            + Add Member
          </Button>
          <Button
            onClick={() => {
              if (openGroup) {
                const groupSlug = slugify(openGroup.name);
                router.push(`/split/${groupSlug}`); // 👉 dùng slug tên nhóm
              }
            }}
          >
            Chia hóa đơn
          </Button>
        </div>

        <Table
          rowKey="_id"
          dataSource={openGroup?.members || []}
          columns={memberColumns}
          pagination={false}
        />
      </Modal>

      {/* Add/Edit Member Modal */}
      <Modal
        title={editingMember ? "Edit Member" : "Add Member"}
        open={isMemberModalOpen}
        onCancel={() => setIsMemberModalOpen(false)}
        onOk={handleSaveMember}
        okText="Save"
        cancelText="Cancel"
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
            rules={[
              { required: true, type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò">
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue={MemberStatus.Active}
          >
            <Select>
              <Select.Option value={MemberStatus.Active}>
                Hoạt động
              </Select.Option>
              <Select.Option value={MemberStatus.Inactive}>
                Ngưng hoạt động
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


