"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  message,
} from "antd";
import dayjs from "dayjs";
import Breadcrumb from "@/components/Breadcrumb";
import Topbar from "@/components/Topbar";
import AuthModal, { User } from "@/app/login/AuthModal";

type Expense = {
  _id: string;
  title: string;
  amount: number;
  category: string;
  status: "CHỜ" | "HOÀN TẤT";
  person: string;
  date: string;
};

type FilterStatus = "ALL" | "CHỜ" | "HOÀN TẤT";

const API_URL = "http://localhost:8080/api/expenses";

export default function TeamBillPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [summary, setSummary] = useState({ totalAmount: 0, count: 0 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [form] = Form.useForm();

  // ================= Load dữ liệu =================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchExpenses(), fetchSummary()]);
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API_URL);
      setExpenses(res.data);
    } catch {
      message.error("❌ Lỗi khi load expenses");
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/summary`);
      setSummary(res.data);
    } catch {
      message.error("❌ Lỗi khi load summary");
    }
  };

  // ================= CRUD =================
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, amount: Number(values.amount) };

      if (editExpense) {
        const res = await axios.put(`${API_URL}/${editExpense._id}`, payload);
        setExpenses((prev) =>
          prev.map((e) => (e._id === editExpense._id ? res.data : e))
        );
        message.success("✅ Cập nhật chi tiêu thành công");
      } else {
        const res = await axios.post(API_URL, payload);
        setExpenses((prev) => [...prev, res.data]);
        message.success("✅ Thêm chi tiêu thành công");
      }

      setIsFormOpen(false);
      form.resetFields();
      fetchSummary();
    } catch {
      message.error("❌ Lỗi khi lưu");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      message.success("🗑️ Xóa thành công");
      fetchSummary();
    } catch {
      message.error("❌ Lỗi khi xóa");
    }
  };

  // ================= Filter =================
  const filteredExpenses =
    filterStatus === "ALL"
      ? expenses
      : expenses.filter((e) => e.status === filterStatus);

  // ================= Table Columns =================
  const columns = [
    { title: "Tiêu đề", dataIndex: "title" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (val: number | string) =>
        `${Number(val).toLocaleString("vi-VN")} VNĐ`,
    },
    { title: "Loại", dataIndex: "category" },
    { title: "Người chịu", dataIndex: "person" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (val: "CHỜ" | "HOÀN TẤT") =>
        val === "CHỜ" ? (
          <Tag color="orange">CHỜ</Tag>
        ) : (
          <Tag color="green">HOÀN TẤT</Tag>
        ),
    },
    {
      title: "Ngày",
      dataIndex: "date",
      render: (val: string) => dayjs(val).format("YYYY-MM-DD"),
    },
    {
      title: "Hành động",
      render: (_: any, record: Expense) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditExpense(record);
              setIsFormOpen(true);
              form.setFieldsValue({
                ...record,
                date: dayjs(record.date).format("YYYY-MM-DD"),
              });
            }}
          >
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // ================= Render =================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* ✅ Topbar giống dashboard */}
      <Topbar user={user} onAvatarClick={() => setIsAuthOpen(true)} />

      <main className="p-6">
        {/* Header page */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Quản lý chi tiêu</h1>
          <Button
            type="primary"
            onClick={() => {
              setEditExpense(null);
              setIsFormOpen(true);
              form.resetFields();
              form.setFieldsValue({
                status: "CHỜ",
                date: dayjs().format("YYYY-MM-DD"),
              });
            }}
          >
            + Thêm chi tiêu
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center mb-6 gap-4">
          <Select
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            style={{ width: 160 }}
          >
            <Select.Option value="ALL">Tất cả</Select.Option>
            <Select.Option value="CHỜ">CHỜ</Select.Option>
            <Select.Option value="HOÀN TẤT">HOÀN TẤT</Select.Option>
          </Select>
          <span className="ml-auto font-semibold">
            Tổng:{" "}
            {new Intl.NumberFormat("vi-VN").format(summary.totalAmount)} VNĐ |{" "}
            {summary.count} giao dịch
          </span>
        </div>

        {/* Table */}
        <Card>
          <Table
            rowKey="_id"
            dataSource={filteredExpenses}
            columns={columns}
            pagination={false}
            scroll={{ x: "100%", y: 500 }}
          />
        </Card>

        {/* Modal thêm/sửa chi tiêu */}
        <Modal
          title={editExpense ? "Sửa chi tiêu" : "Thêm chi tiêu"}
          open={isFormOpen}
          onCancel={() => setIsFormOpen(false)}
          onOk={handleSave}
          okText="Lưu"
          cancelText="Hủy"
          width="100%"
          style={{ maxWidth: "700px" }} // ✅ modal rộng vừa, giống dashboard
          bodyStyle={{ padding: "24px" }}
          centered
        >
          <Form layout="vertical" form={form} className="w-full">
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Nhập tiêu đề" }]}
            >
              <Input className="w-full" />
            </Form.Item>
            <Form.Item
              name="amount"
              label="Số tiền"
              rules={[{ required: true, message: "Nhập số tiền" }]}
            >
              <Input
                type="number"
                placeholder="Nhập số tiền (VD: 500000)"
                className="w-full"
              />
            </Form.Item>
            <Form.Item name="category" label="Loại">
              <Input className="w-full" />
            </Form.Item>
            <Form.Item name="person" label="Người chịu">
              <Input className="w-full" />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select className="w-full">
                <Select.Option value="CHỜ">CHỜ</Select.Option>
                <Select.Option value="HOÀN TẤT">HOÀN TẤT</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="date" label="Ngày">
              <Input type="date" className="w-full" />
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
