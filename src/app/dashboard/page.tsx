"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
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
  Avatar,
} from "antd";
import { useRouter } from "next/navigation";
import AuthModal from "@/app/login/AuthModal";
import { getMembers, getExpenses, createExpense } from "@/lib/api";

// ================= Types =================
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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#22c55e"];

// ✅ Label component thay vì function
const RenderLabel: React.FC<PieLabelRenderProps> = ({ name, percent }) => {
  if (!name || percent === undefined) return null;
  return (
    <text
      x={0}
      y={0}
      fill="#333"
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  // ========== Load Data ==========
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
      } catch {
        message.error("Lỗi khi tải dữ liệu");
      }
    };
    fetchData();
  }, [form]);

  // ========== Add Expense ==========
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
      message.success("Thêm chi tiêu thành công");
    } catch {
      message.error("Lỗi khi thêm chi tiêu");
    }
  };

  // ========== Computed ==========
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

  // ========== Table ==========
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

  return (
    <div className="min-h-screen font-sans text-gray-800">
      <main className="p-6">
        {/* Tiêu đề trang */}
        <h1 className="text-2xl font-bold mb-1">Bảng điều khiển</h1>
        <p className="text-gray-500 mb-6">Tổng quan chi tiêu và hoạt động</p>

        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card
              className="cursor-pointer"
              onClick={() => router.push("/expenses")}
              bordered={false}
            >
              <Statistic
                title={<span className="text-gray-600">Tổng chi tiêu</span>}
                value={total}
                suffix="VND"
                valueStyle={{ color: "#cf1322", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              className="cursor-pointer"
              onClick={() => router.push("/friends")}
              bordered={false}
            >
              <Statistic
                title={<span className="text-gray-600">Thành viên</span>}
                value={members.length}
                valueStyle={{ color: "#faad14", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              className="cursor-pointer"
              onClick={() => router.push("/billhistory")}
              bordered={false}
            >
              <Statistic
                title={
                  <span className="text-gray-600">Thanh toán chờ xử lý</span>
                }
                value={pending}
                suffix="VND"
                valueStyle={{ color: "#cf1322", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              className="cursor-pointer"
              onClick={() => router.push("/settings")}
              bordered={false}
            >
              <Statistic
                title={<span className="text-gray-600">Tháng này</span>}
                value={total}
                suffix="VND"
                valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Chi tiêu gần đây + Sidebar phải */}
        <Row gutter={[16, 16]}>
          {/* Bảng chi tiêu */}
          <Col xs={24} lg={16}>
            <Card
              title="Chi tiêu gần đây"
              extra={
                <Button type="primary" onClick={() => setIsFormOpen(true)}>
                  + Thêm chi tiêu
                </Button>
              }
              className="shadow-sm"
            >
              <Table
                rowKey="_id"
                dataSource={expenses}
                columns={columns}
                pagination={false}
              />
            </Card>
          </Col>

          {/* Sidebar phải */}
          <Col xs={24} lg={8}>
            {/* Bạn bè */}
            <Card title="Bạn bè" className="m-6 shadow-sm">
              {members.slice(0, 5).map((m) => (
                <div
                  key={m._id || m.id}
                  className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={() => router.push(`/friends/${m._id || m.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar>{m.name.charAt(0)}</Avatar>
                    <span className="font-medium text-gray-700">{m.name}</span>
                  </div>
                  <Button
                    size="small"
                    type="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      message.success(`Đã gửi lời mời kết bạn tới ${m.name}`);
                    }}
                  >
                    + Kết bạn
                  </Button>
                </div>
              ))}
              <Button
                type="link"
                className="w-full text-center mt-2"
                onClick={() => router.push("/friends")}
              >
                Xem tất cả
              </Button>
            </Card>

            {/* Biểu đồ danh mục */}
            <Card
              title="Danh mục chi tiêu"
              className="shadow-sm cursor-pointer mt-6"
              onClick={() => router.push("/categories")}
            >
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      dataKey="value"
                      label={<RenderLabel />}
                    >
                      {categories.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={COLORS[i % COLORS.length]}
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
          onLoginSuccess={() => {}}
        />
      </main>
    </div>
  );
}
