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
  Avatar,
  Tag,
  Form,
  Input,
} from "antd";
import { useRouter } from "next/navigation";
import { SettingOutlined, PlusOutlined } from "@ant-design/icons";
import Topbar from "@/components/Topbar";
import AuthModal, { User } from "@/app/login/AuthModal";
import MemberModal from "@/components/Modals/MemberModal";

export enum MemberStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export type Member = {
  _id: string;
  name: string;
  role: string;
  email: string;
  status: MemberStatus;
  teamId: string;
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
  const [groupForm] = Form.useForm(); // form thêm nhóm
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

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

  // ================= CRUD Group =================
  const handleAddGroup = async () => {
    try {
      const values = await groupForm.validateFields();
      await axios.post(`${API_URL}/teams`, values);
      toast.success("Tạo nhóm mới thành công!");
      setIsAddGroupOpen(false);
      groupForm.resetFields();
      loadGroupsWithMembers();
    } catch {
      toast.error("Lỗi khi tạo nhóm");
    }
  };

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
      .replace(/[\u0300-\u036f]/g, "")
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
        <Card
          title="Nhóm"
          className="w-full"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddGroupOpen(true)}
            >
              Thêm nhóm
            </Button>
          }
        >
          {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => {
                const groupSlug = slugify(group.name);
                return (
                  <div
                    key={group._id}
                    className="bg-white rounded-xl shadow p-5 hover:shadow-md transition relative"
                  >
                    {/* Nội dung click → sang split page */}
                    <div
                      onClick={() => router.push(`/split/${groupSlug}`)}
                      className="cursor-pointer"
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

                    {/* Bánh răng mở chi tiết nhóm */}
                    <Button
                      type="text"
                      shape="circle"
                      icon={<SettingOutlined />}
                      className="absolute top-3 right-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenGroup(group);
                      }}
                    />
                  </div>
                );
              })}
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
        </div>

        <Table
          rowKey="_id"
          dataSource={openGroup?.members || []}
          columns={memberColumns}
          pagination={false}
        />
      </Modal>

      {/* Add/Edit Member Modal */}
      <MemberModal
        open={isMemberModalOpen}
        onCancel={() => setIsMemberModalOpen(false)}
        onSave={handleSaveMember}
        form={form}
        editingMember={editingMember}
      />

      {/* Add Group Modal */}
      <Modal
        title="Tạo nhóm mới"
        open={isAddGroupOpen}
        onCancel={() => setIsAddGroupOpen(false)}
        onOk={handleAddGroup}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={groupForm} layout="vertical">
          <Form.Item
            label="Tên nhóm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
          >
            <Input placeholder="Nhập tên nhóm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
