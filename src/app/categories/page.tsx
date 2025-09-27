"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Card,
  ColorPicker,
  Row,
  Col,
  Space,
  Dropdown,
  Table,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  DownOutlined,
} from "@ant-design/icons";

import AuthModal, { User } from "@/app/login/AuthModal";

export type Category = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

const initialCategories: Category[] = [
  { id: "1", name: "Ăn uống", color: "blue", description: "Chi phí ăn uống hằng ngày" },
  { id: "2", name: "Shopping", color: "red", description: "Mua sắm quần áo, đồ dùng" },
  { id: "3", name: "Cafe", color: "purple", description: "Cafe, trà sữa, đồ uống" },
  { id: "4", name: "Đi lại", color: "green", description: "Taxi, Grab, xăng xe, vé xe bus" },
  { id: "5", name: "Giải trí", color: "gold", description: "Phim ảnh, karaoke, trò chơi" },
  { id: "6", name: "Khác", color: "gray", description: "Các chi phí khác" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm<Category>();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortKey, setSortKey] = useState("recent");

  const sortMenu = [
    { key: "recent", label: "Mới nhất" },
    { key: "az", label: "Theo tên (A → Z)" },
    { key: "za", label: "Theo tên (Z → A)" },
  ];

  // ========== Mở modal ==========
  const openModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
    if (category) {
      form.setFieldsValue(category);
    } else {
      form.resetFields();
    }
  };

  // ========== Lưu ==========
  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...values } : c
          )
        );
        message.success("Cập nhật danh mục thành công!");
      } else {
        const { id, ...rest } = values;
        const newCategory: Category = {
          id: String(Date.now()),
          ...rest,
        };
        setCategories((prev) => [...prev, newCategory]);
        message.success("Thêm danh mục thành công!");
      }
      setIsModalOpen(false);
      setEditingCategory(null);
    });
  };

  // ========== Xóa ==========
  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    message.success("Xoá danh mục thành công!");
  };

  // ========== Cột bảng ==========
  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Category) => (
        <Tag
          color={record.color}
          style={{ fontWeight: 500, padding: "4px 10px", borderRadius: 6 }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (color: string) => (
        <div className="flex items-center gap-2">
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
          <span style={{ color }}>{color}</span>
        </div>
      ),
    },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: Category) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  // ========== Sort ==========
  const sortedCategories = [...categories].sort((a, b) => {
    if (sortKey === "az") return a.name.localeCompare(b.name);
    if (sortKey === "za") return b.name.localeCompare(a.name);
    return Number(b.id) - Number(a.id);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="p-6">
        {/* Tiêu đề */}
        <h1 className="text-2xl font-bold mb-1">Quản lý danh mục</h1>
        <p className="text-gray-500 mb-6">Xem và quản lý các danh mục của bạn</p>

        {/* Header action bar */}
        <div className="flex justify-between items-center mb-6">
          {/* Nút thêm bên trái */}
          <button
            className="rounded-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow"
            onClick={() => openModal()}
          >
            <PlusOutlined className="mr-1" /> Thêm danh mục
          </button>

          {/* Toggle + Sort bên phải */}
          <div className="flex items-center gap-3">
            {/* Toggle view */}
            <div className="flex border rounded-full overflow-hidden bg-white">
              <button
                className={`flex items-center justify-center w-12 h-10 text-lg ${
                  viewMode === "grid"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <CheckOutlined
                  className={`mr-1 text-xs transition ${
                    viewMode !== "grid" ? "opacity-0" : "opacity-100"
                  }`}
                />
                ▦
              </button>
              <button
                className={`flex items-center justify-center w-12 h-10 text-lg ${
                  viewMode === "list"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600"
                }`}
                onClick={() => setViewMode("list")}
              >
                <CheckOutlined
                  className={`mr-1 text-xs transition ${
                    viewMode !== "list" ? "opacity-0" : "opacity-100"
                  }`}
                />
                ≡
              </button>
            </div>

            {/* Sort dropdown */}
            <Dropdown
              menu={{ items: sortMenu, onClick: (info) => setSortKey(info.key) }}
            >
              <button className="h-10 px-4 rounded-full bg-white border hover:bg-gray-50 flex items-center gap-1 text-sm">
                {sortMenu.find((i) => i.key === sortKey)?.label} <DownOutlined />
              </button>
            </Dropdown>
          </div>
        </div>

        {/* Nội dung */}
        {viewMode === "grid" ? (
          <Row gutter={[16, 16]}>
            {sortedCategories.map((cat) => (
              <Col key={cat.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  style={{ borderTop: `4px solid ${cat.color}`, height: "100%" }}
                  className="shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: cat.color,
                        }}
                      />
                      {cat.name}
                    </h3>
                    <p className="text-gray-500 mt-2 text-sm">
                      {cat.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button icon={<EditOutlined />} onClick={() => openModal(cat)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(cat.id)} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Table bordered dataSource={sortedCategories} columns={columns} rowKey="id" pagination={false} />
        )}
      </main>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={18}>
              <Form.Item
                label="Tên danh mục"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
              >
                <Input placeholder="Ví dụ: Ăn uống" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Màu sắc"
                name="color"
                rules={[{ required: true, message: "Chọn màu cho danh mục" }]}
              >
                <ColorPicker
                  format="hex"
                  onChange={(color) => {
                    form.setFieldsValue({ color: color.toHexString() });
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea placeholder="Nhập mô tả chi tiết" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
