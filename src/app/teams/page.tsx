"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Modal,
  Button,
  Table,
  Space,
  Avatar,
  Tag,
  Form,
  Input,
  Dropdown,
  MenuProps,
} from "antd";
import { useRouter } from "next/navigation";
import {
  SettingOutlined,
  PlusOutlined,
  CheckOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import AuthModal, { User } from "@/app/login/AuthModal";
import MemberModal from "@/components/Modals/MemberModal";

// ================= Types =================
export enum MemberStatus {
  Active = "Hoạt động",
  Inactive = "Ngưng hoạt động",
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

// ================= API URL =================
const API_URL = "http://localhost:8080/api";

// ================= Main Page =================
export default function TeamMembersPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [openGroup, setOpenGroup] = useState<Group | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  // Xác nhận xóa nhóm
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortKey, setSortKey] = useState("recent");

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

  const handleUpdateGroup = async () => {
    if (!openGroup) return;
    try {
      const values = await groupForm.validateFields();
      await axios.put(`${API_URL}/teams/${openGroup._id}`, values);

      setGroups((prev) =>
        prev.map((g) =>
          g._id === openGroup._id ? { ...g, name: values.name } : g
        )
      );
      setOpenGroup({ ...openGroup, name: values.name });

      toast.success("Cập nhật nhóm thành công!");
      setIsEditGroupOpen(false);
      groupForm.resetFields();
    } catch {
      toast.error("Lỗi khi cập nhật nhóm");
    }
  };

  const handleDeleteGroupConfirm = async () => {
    if (!openGroup) return;
    if (deleteConfirmName !== openGroup.name) {
      toast.error("Tên nhóm không khớp, không thể xoá!");
      return;
    }
    try {
      await axios.delete(`${API_URL}/teams/${openGroup._id}`);
      toast.success("Xoá nhóm thành công!");
      setGroups((prev) => prev.filter((g) => g._id !== openGroup._id));
      setOpenGroup(null);
      setIsDeleteGroupOpen(false);
      setDeleteConfirmName("");
    } catch {
      toast.error("Lỗi khi xoá nhóm");
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
          <Tag className="bg-green-100 text-green-700 border-none px-3 py-1 rounded-full">
            Hoạt động
          </Tag>
        ) : (
          <Tag className="bg-red-100 text-red-600 border-none px-3 py-1 rounded-full">
            Ngưng hoạt động
          </Tag>
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
          <Button type="link" danger onClick={() => handleDeleteMember(record._id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // ================= Dropdown menu =================
  const sortMenu: MenuProps["items"] = [
    { key: "recent", label: "Mới nhất" },
    { key: "az", label: "Theo tên (A → Z)" },
    { key: "members", label: "Theo số thành viên" },
  ];

  // ================= Render =================
  return (
    <div className="min-h-screen font-sans text-gray-800 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Quản lý nhóm</h1>
      <p className="text-gray-500 mb-6">Xem và quản lý các nhóm của bạn</p>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <Button
          type="primary"
          shape="round"
          icon={<PlusOutlined />}
          onClick={() => setIsAddGroupOpen(true)}
        >
          Thêm nhóm mới
        </Button>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                viewMode === "grid"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "bg-white text-gray-600"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <CheckOutlined className={`text-xs ${viewMode !== "grid" ? "opacity-0" : ""}`} />
              <AppstoreOutlined />
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                viewMode === "list"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "bg-white text-gray-600"
              }`}
              onClick={() => setViewMode("list")}
            >
              <CheckOutlined className={`text-xs ${viewMode !== "list" ? "opacity-0" : ""}`} />
              <UnorderedListOutlined />
            </button>
          </div>

          {/* Dropdown sort */}
          <Dropdown
            menu={{ items: sortMenu, onClick: (info) => setSortKey(info.key) }}
          >
            <Button shape="round">
              {sortMenu.find((i) => i?.key === sortKey)?.label} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Grid hiển thị nhóm */}
      {loading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const hasActive = group.members.some((m) => m.status === MemberStatus.Active);
            const bgClass =
              group.members.length === 0
                ? "bg-gray-100 hover:border-gray-400"
                : hasActive
                ? "bg-green-100 hover:border-green-400"
                : "bg-red-100 hover:border-red-400";

            const dotColor =
              group.members.length === 0
                ? "bg-gray-500"
                : hasActive
                ? "bg-green-600"
                : "bg-red-600";

            return (
              <div
                key={group._id}
                className={`border rounded-xl p-5 shadow-sm hover:shadow-lg transition cursor-pointer relative ${bgClass}`}
                onClick={() => router.push(`/split/${group._id}`)}
              >
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenGroup(group);
                  }}
                >
                  <SettingOutlined />
                </button>

                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${dotColor}`} />
                  {group.name}
                </h2>

                <div className="flex -space-x-2 mb-3">
                  {group.members.slice(0, 4).map((m) => (
                    <Avatar
                      key={m._id}
                      src={`https://i.pravatar.cc/32?u=${m._id}`}
                      className="border-2 border-white"
                    />
                  ))}
                  {group.members.length > 4 && (
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-200 text-xs rounded-full border-2 border-white">
                      +{group.members.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      hasActive
                        ? "bg-green-200 text-green-800"
                        : group.members.length === 0
                        ? "bg-gray-200 text-gray-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {group.members.length === 0
                      ? "Chưa có thành viên"
                      : hasActive
                      ? "Hoạt động"
                      : "Ngưng hoạt động"}
                  </span>
                  <span>{group.members.length} thành viên</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Table
          rowKey="_id"
          dataSource={groups}
          columns={[
            { title: "Tên nhóm", dataIndex: "name" },
            { title: "Số thành viên", render: (_, g) => g.members.length },
          ]}
          pagination={false}
        />
      )}

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
          <div className="flex gap-2">
            <Button
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditingMember(null);
                setIsMemberModalOpen(true);
              }}
            >
              Thêm thành viên
            </Button>

            <Button
              shape="round"
              icon={<EditOutlined />}
              onClick={() => {
                groupForm.setFieldsValue({ name: openGroup?.name });
                setIsEditGroupOpen(true);
              }}
            >
              Sửa tên nhóm
            </Button>
          </div>

          <Button
            danger
            shape="round"
            icon={<DeleteOutlined />}
            onClick={() => setIsDeleteGroupOpen(true)}
          >
            Xóa nhóm
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

      {/* Edit Group Modal */}
      <Modal
        title="Sửa tên nhóm"
        open={isEditGroupOpen}
        onCancel={() => setIsEditGroupOpen(false)}
        onOk={handleUpdateGroup}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={groupForm} layout="vertical">
          <Form.Item
            label="Tên nhóm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
          >
            <Input placeholder="Nhập tên nhóm mới" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Group Confirm Modal */}
      <Modal
        title="Xác nhận xoá nhóm"
        open={isDeleteGroupOpen}
        onCancel={() => {
          setIsDeleteGroupOpen(false);
          setDeleteConfirmName("");
        }}
        onOk={handleDeleteGroupConfirm}
        okText="Xóa"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
      >
        <p>
          Nhập tên nhóm <b>{openGroup?.name}</b> để xác nhận xoá:
        </p>
        <Input
          value={deleteConfirmName}
          onChange={(e) => setDeleteConfirmName(e.target.value)}
          placeholder="Nhập chính xác tên nhóm"
        />
      </Modal>
    </div>
  );
}
