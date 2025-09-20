"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import AuthModal, { User } from "@/app/login/AuthModal";
import Breadcrumb from "@/components/Breadcrumb";
import Topbar from "@/components/Topbar";
import { getMembers, getExpenses, createExpense } from "@/lib/api";

// ======================= Types =======================
type Expense = {
  _id?: string;
  id?: number;
  title: string;
  amount: number;
  category: string;
  status: "CHỜ" | "HOÀN TẤT";
  person: string;
};

type Member = {
  _id?: string;
  id?: number;
  name: string;
};

type PieLabelProps = {
  name: string;
  percent: number;
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#22c55e"];

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [form] = Form.useForm();

  // ======================= Load dữ liệu =======================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMembers = await getMembers();
        setMembers(resMembers.data);

        const resExpenses = await getExpenses();
        setExpenses(resExpenses.data);

        if (resMembers.data.length > 0) {
          form.setFieldsValue({ person: resMembers.data[0].name });
        }
      } catch (err) {
        message.error("❌ Lỗi khi tải dữ liệu");
      }
    };
    fetchData();
  }, [form]);

  // ======================= Handlers =======================
  const handleAddExpense = async () => {
    try {
      const values = await form.validateFields();
      const res = await createExpense({
        ...values,
        amount: parseFloat(values.amount),
        status: "CHỜ",
      });
      setExpenses((prev) => [...prev, res.data]);
      setIsFormOpen(false);
      form.resetFields();
      message.success("✅ Thêm chi tiêu thành công");
    } catch (err) {
      message.error("❌ Lỗi khi thêm chi tiêu");
    }
  };

  // ======================= Computed =======================
  const total = expenses.reduce((acc, e) => acc + e.amount, 0);
  const pending = expenses
    .filter((e) => e.status === "CHỜ")
    .reduce((acc, e) => acc + e.amount, 0);

  const categories = Array.from(
    expenses.reduce((map, e) => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
      return map;
    }, new Map<string, number>())
  ).map(([name, amt]) => ({ name, value: amt }));

  // ======================= Table =======================
  const columns = [
    { title: "Mô tả", dataIndex: "title" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (val: number) =>
        `${val.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}`,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (val: "CHỜ" | "HOÀN TẤT") =>
        val === "HOÀN TẤT" ? (
          <Tag color="green">HOÀN TẤT</Tag>
        ) : (
          <Tag color="orange">CHỜ</Tag>
        ),
    },
    { title: "Người chi trả", dataIndex: "person" },
  ];

  // ======================= Render =======================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* ✅ Topbar cố định */}
      <Topbar user={user} onAvatarClick={() => setIsAuthOpen(true)} />

      <main className="flex-1 p-6">
        <Breadcrumb />

        {/* Stats */}
        <Card title="Thống kê" className="mb-6 w-full">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div className="bg-white rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
                <Statistic
                  title="Tổng chi tiêu"
                  value={total}
                  suffix="VND"
                  valueStyle={{ color: "#cf1322" }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="bg-white rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
                <Statistic
                  title="Thành viên"
                  value={members.length}
                  valueStyle={{ color: "#faad14" }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="bg-white rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
                <Statistic
                  title="Thanh toán chờ xử lý"
                  value={pending}
                  suffix="VND"
                  valueStyle={{ color: "#cf1322" }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="bg-white rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
                <Statistic
                  title="Tháng này"
                  value={total}
                  suffix="VND"
                  valueStyle={{ color: "#52c41a" }}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Main Content */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title="Chi tiêu gần đây"
              extra={
                <Button type="primary" onClick={() => setIsFormOpen(true)}>
                  + Thêm chi tiêu
                </Button>
              }
              className="w-full"
            >
              <Table
                rowKey="_id"
                dataSource={expenses}
                columns={columns}
                pagination={false}
                scroll={{ x: "max-content" }}
                className="w-full"
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Danh mục chi tiêu" className="w-full">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: PieLabelProps) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Modal thêm chi tiêu */}
        <Modal
          title="Thêm chi tiêu mới"
          open={isFormOpen}
          onCancel={() => setIsFormOpen(false)}
          onOk={handleAddExpense}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              name="title"
              label="Mô tả"
              rules={[{ required: true, message: "Nhập mô tả" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="amount"
              label="Số tiền"
              rules={[{ required: true, message: "Nhập số tiền" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: "Nhập danh mục" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="person" label="Người chi trả">
              <Select>
                {members.map((m) => (
                  <Select.Option key={m._id || m.id} value={m.name}>
                    {m.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(u) => setUser(u)}
        />
      </main>
    </div>
  );
}
