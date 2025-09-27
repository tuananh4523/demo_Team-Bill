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
import AuthModal, { User } from "@/app/login/AuthModal";
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

// ✅ fix type PieLabelRenderProps (check undefined)
const renderLabel = ({ name, percent }: PieLabelRenderProps): string =>
  name && percent !== undefined ? `${String(name)} ${(percent * 100).toFixed(0)}%` : "";

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
        `${val.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`,
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="flex-1 p-6">
        <Card bordered className="shadow-sm">
          <h1 className="text-xl font-bold mb-4">Danh mục chi tiêu</h1>

          {/* Stats */}
          <Card title="Thống kê" className="mb-6 w-full">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div
                  className="bg-white rounded-lg shadow-sm p-4 cursor-pointer"
                  onClick={() => router.push("/expenses")}
                >
                  <Statistic title="Tổng chi tiêu" value={total} suffix="VND" valueStyle={{ color: "#cf1322" }}/>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div
                  className="bg-white rounded-lg shadow-sm p-4 cursor-pointer"
                  onClick={() => router.push("/friends")}
                >
                  <Statistic title="Thành viên" value={members.length} valueStyle={{ color: "#faad14" }}/>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div
                  className="bg-white rounded-lg shadow-sm p-4 cursor-pointer"
                  onClick={() => router.push("/billhistory")}
                >
                  <Statistic title="Thanh toán chờ xử lý" value={pending} suffix="VND" valueStyle={{ color: "#cf1322" }}/>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div
                  className="bg-white rounded-lg shadow-sm p-4 cursor-pointer"
                  onClick={() => router.push("/settings")}
                >
                  <Statistic title="Tháng này" value={total} suffix="VND" valueStyle={{ color: "#52c41a" }}/>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Main Content */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card
                title="Chi tiêu gần đây"
                extra={<Button type="primary" onClick={() => setIsFormOpen(true)}>+ Thêm chi tiêu</Button>}
                className="cursor-pointer"
                onClick={() => router.push("/expenses")}
              >
                <Table rowKey="_id" dataSource={expenses} columns={columns} pagination={false}/>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* Friends */}
            <Card title="Bạn bè" className="mb-6">
  {members.slice(0, 5).map((m) => (
    <div
      key={m._id || m.id}
      className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
      onClick={() => router.push(`/friends/${m._id || m.id}`)} // 👉 hành động click
    >
      <div className="flex items-center gap-2">
        <Avatar>{m.name.charAt(0)}</Avatar>
        <span className="font-medium text-gray-700">{m.name}</span>
      </div>
      <Button
        size="small"
        type="primary"
        onClick={(e) => {
          e.stopPropagation(); // ngăn click card
          message.success(`Đã gửi lời mời kết bạn tới ${m.name}`);
        }}
      >
        + Kết bạn
      </Button>
    </div>
  ))}

  {/* Xem tất cả bạn bè */}
  <Button
    type="link"
    className="w-full text-center mt-2"
    onClick={() => router.push("/friends")}
  >
    Xem tất cả
  </Button>
</Card>


              {/* Categories */}
              <Card
                title="Danh mục chi tiêu"
                className="cursor-pointer"
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
                        label={renderLabel}
                      >
                        {categories.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip/>
                      <Legend/>
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
              <Form.Item name="title" label="Mô tả" rules={[{ required: true, message: "Nhập mô tả" }]}>
                <Input/>
              </Form.Item>
              <Form.Item name="amount" label="Số tiền" rules={[{ required: true, message: "Nhập số tiền" }]}>
                <Input type="number"/>
              </Form.Item>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: "Nhập danh mục" }]}>
                <Input/>
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
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={() => {}}/>
        </Card>
      </main>
    </div>
  );
}
