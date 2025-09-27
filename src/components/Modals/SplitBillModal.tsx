"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Space,
  Tag,
  Segmented,
  message,
  Select,
  Divider,
  DatePicker,
  Tooltip,
  ConfigProvider,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import axios from "axios";
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

type SplitType = "equally" | "unequally";

type SplitBillFormProps = {
  selectedDate?: Dayjs;
  onSaved?: (event: CalendarEvent) => void; // 👈 callback khi lưu xong
};


const API_BASE = "http://localhost:8080/api";

const mockGroups = [
  { id: "g1", name: "Nhóm bạn bè", members: ["An", "Bình", "Chi"] },
  { id: "g2", name: "Nhóm công ty", members: ["Dũng", "Hà", "Linh", "Minh"] },
];

// ✅ dùng chung Category với trang danh mục
export type Category = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

type SplitBillFormValues = {
  amount: number;
  participantName?: string;
  paidBy?: string;
  date?: Dayjs;
  categoryId?: string; // chọn theo id danh mục
  note?: string;
};

export default function SplitBillForm({ selectedDate }: SplitBillFormProps) {
  const [form] = Form.useForm<SplitBillFormValues>();
  const [participants, setParticipants] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<SplitType>("equally");
  const [showAll, setShowAll] = useState(false);
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [result, setResult] = useState<
    { from: string; to: string; amount: number }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  // ===== Lấy danh mục từ API (hoặc fake)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // ⚡ Nếu backend đã có API: GET /categories
        const res = await axios.get<Category[]>(`${API_BASE}/categories`);
        setCategories(res.data);
      } catch {
        // fallback nếu chưa có API thì dùng fake
        setCategories([
          { id: "1", name: "Ăn uống", color: "blue" },
          { id: "2", name: "Shopping", color: "red" },
          { id: "3", name: "Cafe", color: "purple" },
          { id: "4", name: "Đi lại", color: "green" },
          { id: "5", name: "Giải trí", color: "gold" },
          { id: "6", name: "Khác", color: "gray" },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // ===== Thêm thành viên đơn =====
  const addParticipant = (name?: string) => {
    if (!name) {
      message.error("Vui lòng nhập tên");
      return;
    }
    if (participants.includes(name)) {
      message.warning("Thành viên đã tồn tại");
      return;
    }
    setParticipants((prev) => [...prev, name]);
    form.setFieldValue("participantName", "");
  };

  // ===== Thêm nhóm =====
  const addGroups = (groupIds: string[]) => {
    const selectedGroups = mockGroups.filter((g) => groupIds.includes(g.id));
    const newMembers = selectedGroups
      .flatMap((g) => g.members)
      .filter((m) => !participants.includes(m));
    if (newMembers.length === 0) {
      message.info("Các thành viên trong nhóm đã có hết");
      return;
    }
    setParticipants((prev) => [...prev, ...newMembers]);
  };

  // ===== Xóa thành viên =====
  const removeParticipant = (name: string) => {
    setParticipants((prev) => prev.filter((p) => p !== name));
    const newCustom = { ...customAmounts };
    delete newCustom[name];
    setCustomAmounts(newCustom);
  };

  // ===== Tính toán =====
  const handleCalculate = async () => {
    try {
      const values = await form.validateFields();
      if (participants.length < 2) {
        message.error("Cần ít nhất 2 người tham gia");
        return;
      }
      const amount = Number(values.amount);
      if (isNaN(amount) || amount <= 0) {
        message.error("Số tiền không hợp lệ");
        return;
      }
      const paidBy = values.paidBy;
      if (!paidBy) {
        message.error("Chọn người đã trả tiền");
        return;
      }

      const balances: Record<string, number> = {};
      participants.forEach((p) => (balances[p] = 0));

      if (splitType === "equally") {
        const perPerson = amount / participants.length;
        participants.forEach((p) => {
          balances[p] = -perPerson;
        });
        balances[paidBy] = amount - perPerson;
      } else {
        const totalCustom = Object.values(customAmounts).reduce(
          (a, b) => a + b,
          0
        );
        if (totalCustom !== amount) {
          message.error("Tổng số tiền nhập không khớp với hóa đơn");
          return;
        }
        participants.forEach((p) => {
          balances[p] = -(customAmounts[p] || 0);
        });
        balances[paidBy] += amount;
      }

      const creditors = Object.entries(balances)
        .filter(([, val]) => val > 0)
        .map(([name, val]) => ({ name, amount: val }));
      const debtors = Object.entries(balances)
        .filter(([, val]) => val < 0)
        .map(([name, val]) => ({ name, amount: -val }));

      const transactions: { from: string; to: string; amount: number }[] = [];
      let i = 0,
        j = 0;

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const payAmount = Math.min(debtor.amount, creditor.amount);

        transactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: payAmount,
        });

        debtor.amount -= payAmount;
        creditor.amount -= payAmount;

        if (debtor.amount === 0) i++;
        if (creditor.amount === 0) j++;
      }

      setResult(transactions);
    } catch {
      message.error("Vui lòng nhập đầy đủ thông tin");
    }
  };

  // ===== Lưu dữ liệu vào API =====
const handleSave = async () => {
  try {
    setSaving(true);
    const values = form.getFieldsValue();
    const dataToSave = {
      ...values,
      date: values.date?.toISOString(),
      participants,
      splitType,
      result,
    };
    const res = await axios.post(`${API_BASE}/expenses`, dataToSave);

    // 👇 giả sử API trả về expense mới
    const savedEvent: CalendarEvent = {
      id: res.data.id,
      title: values.note || "Chi tiêu mới",
      start: values.date?.toISOString() || new Date().toISOString(),
      total: values.amount,
      categoryId: values.categoryId,
      note: values.note,
      teamId: "teamId_demo",
    };

    // Gọi callback để SplitPage nhận được
    onSaved?.(savedEvent);

    message.success("Đã lưu hóa đơn thành công!");
    form.resetFields();
    setParticipants([]);
    setResult([]);
  } catch (err) {
    console.error(err);
    message.error("Lỗi khi lưu hóa đơn");
  } finally {
    setSaving(false);
  }
};



  return (
    <ConfigProvider locale={viVN}>
      <Form<SplitBillFormValues>
        layout="vertical"
        form={form}
        initialValues={{ date: selectedDate }}
      >
        {/* Ngày sự kiện */}
        <Form.Item
          name="date"
          label="Ngày sự kiện"
          rules={[{ required: true, message: "Chọn ngày sự kiện" }]}
        >
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Nhập số tiền */}
        <Form.Item
          name="amount"
          label="Tổng số tiền (VNĐ)"
          rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
        >
          <Input placeholder="Nhập số tiền" type="number" />
        </Form.Item>

        {/* Danh mục */}
        <Form.Item
          name="categoryId"
          label="Danh mục chi tiêu"
          rules={[{ required: true, message: "Chọn danh mục" }]}
        >
          <Select placeholder="Chọn danh mục">
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: c.color,
                    }}
                  />
                  {c.name}
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Ghi chú */}
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>

        {/* Người tham gia */}
        <Form.Item label="Người tham gia (tối thiểu 2)">
          <Space.Compact style={{ width: "100%" }} className="mb-2">
            <Form.Item name="participantName" noStyle>
              <Input placeholder="Tên thành viên" />
            </Form.Item>
            <Button
              type="primary"
              onClick={() =>
                addParticipant(form.getFieldValue("participantName"))
              }
            >
              Thêm
            </Button>
          </Space.Compact>

          <Select
            mode="multiple"
            placeholder="Chọn nhóm để thêm thành viên"
            style={{ width: "100%" }}
            onChange={addGroups}
          >
            {mockGroups.map((g) => (
              <Select.Option key={g.id} value={g.id}>
                {g.name}
              </Select.Option>
            ))}
          </Select>

          <div className="mt-3">
            {(showAll ? participants : participants.slice(0, 5)).map((p) => (
              <div
                key={p}
                className="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <span className="text-gray-700">{p}</span>
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeParticipant(p)}
                  />
                </Tooltip>
              </div>
            ))}
            {participants.length > 5 && (
              <div className="text-center mt-2">
                <Button
                  type="link"
                  size="small"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Thu gọn" : `Xem thêm (${participants.length - 5})`}
                </Button>
              </div>
            )}
          </div>
        </Form.Item>

        {/* Người trả */}
        <Form.Item
          name="paidBy"
          label="Người đã trả"
          rules={[{ required: true, message: "Chọn người trả tiền" }]}
        >
          <Select placeholder="Chọn người trả">
            {participants.map((p) => (
              <Select.Option key={p} value={p}>
                {p}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Cách chia */}
        <Form.Item label="Cách chia" required>
          <Segmented<SplitType>
            options={[
              { label: "Chia đều", value: "equally" },
              { label: "Chia không đều", value: "unequally" },
            ]}
            value={splitType}
            onChange={(val) => setSplitType(val)}
            block
          />
        </Form.Item>

        {/* Nếu chia không đều */}
        {splitType === "unequally" && (
          <div className="p-3 border rounded bg-gray-50">
            <h4 className="font-medium mb-2">Nhập số tiền cho từng người:</h4>
            {participants.map((p) => (
              <Form.Item key={p} label={p}>
                <Input
                  type="number"
                  placeholder="0"
                  value={customAmounts[p] || 0}
                  onChange={(e) =>
                    setCustomAmounts({
                      ...customAmounts,
                      [p]: Number(e.target.value),
                    })
                  }
                />
              </Form.Item>
            ))}
          </div>
        )}

        <Divider />

        {/* Nút tính toán */}
        <Button type="primary" block onClick={handleCalculate}>
          Tính toán
        </Button>

        {/* Kết quả + Nút lưu */}
        {result.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Kết quả:</h4>
            {result.map((r, idx) => (
              <p key={idx}>
                {r.from} → {r.to}:{" "}
                <Tag color="green">{r.amount.toLocaleString("vi-VN")} VNĐ</Tag>
              </p>
            ))}

            <Button
              type="primary"
              block
              className="mt-3"
              loading={saving}
              onClick={handleSave}
            >
              Lưu
            </Button>
          </div>
        )}
      </Form>
    </ConfigProvider>
  );
}
