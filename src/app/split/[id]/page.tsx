"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Card,
  Spin,
  message,
  List,
  DatePicker,
  Select,
  Space,
  Button,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/vi";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Topbar from "@/components/Topbar";
import AuthModal, { User } from "@/app/login/AuthModal";
import EventGroup from "@/app/split/event_group";
import SplitBillModal from "@/components/Modals/SplitBillModal";

dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

// ========== Types ==========
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
};

export type Group = {
  _id: string;
  name: string;
  members: Member[];
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  teamId: string;
  color: string;
  total?: number;
  category?: string;
  note?: string;
};

const API_BASE = "http://localhost:8080/api";

export default function SplitPage() {
  const { id } = useParams<{ id: string }>();

  const [group, setGroup] = useState<Group | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // ========== Load Group ==========
  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Group>(`${API_BASE}/teams/${id}`);
        setGroup(res.data);
      } catch {
        message.error("Lỗi load nhóm");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGroup();
  }, [id]);

  // ========== Fake Events ban đầu ==========
  useEffect(() => {
    if (!id) return;
    const fake: CalendarEvent[] = [
      // Ăn uống
      {
        id: "1",
        title: "Cơm trưa",
        start: "2025-09-20T12:00:00",
        teamId: String(id),
        color: "#3B82F6",
        total: 50000,
        category: "Ăn uống",
        note: "Ăn trưa với đồng nghiệp",
      },
      {
        id: "2",
        title: "Bún chả",
        start: "2025-09-21T13:00:00",
        teamId: String(id),
        color: "#3B82F6",
        total: 70000,
        category: "Ăn uống",
        note: "Ăn ngoài hàng",
      },
      {
        id: "3",
        title: "Lẩu",
        start: "2025-09-23T19:00:00",
        teamId: String(id),
        color: "#3B82F6",
        total: 300000,
        category: "Ăn uống",
        note: "Đi ăn cùng nhóm bạn",
      },

      // Shopping
      {
        id: "4",
        title: "Mua áo sơ mi",
        start: "2025-09-20T16:00:00",
        teamId: String(id),
        color: "#EF4444",
        total: 250000,
        category: "Shopping",
        note: "Mua ở trung tâm thương mại",
      },
      {
        id: "5",
        title: "Mua giày",
        start: "2025-09-22T15:00:00",
        teamId: String(id),
        color: "#EF4444",
        total: 800000,
        category: "Shopping",
        note: "Sneaker Adidas",
      },
      {
        id: "6",
        title: "Mua sách",
        start: "2025-09-23T10:00:00",
        teamId: String(id),
        color: "#EF4444",
        total: 150000,
        category: "Shopping",
        note: "Sách kỹ năng sống",
      },

      // Cafe
      {
        id: "7",
        title: "Cafe sáng",
        start: "2025-09-21T09:00:00",
        teamId: String(id),
        color: "#8B5CF6",
        total: 45000,
        category: "Cafe",
        note: "Uống cafe với bạn",
      },
      {
        id: "8",
        title: "Cafe meeting",
        start: "2025-09-22T11:00:00",
        teamId: String(id),
        color: "#8B5CF6",
        total: 60000,
        category: "Cafe",
        note: "Họp nhóm ở Highlands",
      },
      {
        id: "9",
        title: "Cafe muộn",
        start: "2025-09-23T21:00:00",
        teamId: String(id),
        color: "#8B5CF6",
        total: 50000,
        category: "Cafe",
        note: "Uống cà phê tối",
      },

      // Đi lại
      {
        id: "10",
        title: "Xe bus",
        start: "2025-09-21T08:00:00",
        teamId: String(id),
        color: "#10B981",
        total: 7000,
        category: "Đi lại",
        note: "Vé xe bus đi làm",
      },
      {
        id: "11",
        title: "Grab",
        start: "2025-09-22T19:00:00",
        teamId: String(id),
        color: "#10B981",
        total: 120000,
        category: "Đi lại",
        note: "Đi Grab về nhà",
      },
      {
        id: "12",
        title: "Taxi",
        start: "2025-09-23T23:00:00",
        teamId: String(id),
        color: "#10B981",
        total: 200000,
        category: "Đi lại",
        note: "Đi taxi khuya",
      },

      // Giải trí
      {
        id: "13",
        title: "Xem phim",
        start: "2025-09-22T20:00:00",
        teamId: String(id),
        color: "#FACC15",
        total: 120000,
        category: "Giải trí",
        note: "CGV Vincom",
      },
      {
        id: "14",
        title: "Karaoke",
        start: "2025-09-23T21:00:00",
        teamId: String(id),
        color: "#FACC15",
        total: 400000,
        category: "Giải trí",
        note: "Đi hát với bạn bè",
      },
      {
        id: "15",
        title: "Chơi game",
        start: "2025-09-24T15:00:00",
        teamId: String(id),
        color: "#FACC15",
        total: 80000,
        category: "Giải trí",
        note: "Nạp game",
      },

      // Khác
      {
        id: "16",
        title: "Quà sinh nhật",
        start: "2025-09-23T19:00:00",
        teamId: String(id),
        color: "#6B7280",
        total: 300000,
        category: "Khác",
        note: "Mua quà cho bạn",
      },
      {
        id: "17",
        title: "Ủng hộ từ thiện",
        start: "2025-09-24T10:00:00",
        teamId: String(id),
        color: "#6B7280",
        total: 200000,
        category: "Khác",
        note: "Ủng hộ vùng lũ",
      },
      {
        id: "18",
        title: "Mua cây cảnh",
        start: "2025-09-24T18:00:00",
        teamId: String(id),
        color: "#6B7280",
        total: 180000,
        category: "Khác",
        note: "Cây để bàn",
      },

      // Bonus thêm 2 cho đủ 20
      {
        id: "19",
        title: "Ăn tối",
        start: "2025-09-25T20:00:00",
        teamId: String(id),
        color: "#3B82F6",
        total: 90000,
        category: "Ăn uống",
        note: "Ăn phở bò",
      },
      {
        id: "20",
        title: "Mua balo",
        start: "2025-09-25T17:00:00",
        teamId: String(id),
        color: "#EF4444",
        total: 400000,
        category: "Shopping",
        note: "Balo laptop",
      },
    ];
    setEvents(fake);
    setFilteredEvents(fake);
  }, [id]);

  // ========== Apply Filters ==========
  useEffect(() => {
    let filtered = [...events];

    if (dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter((ev) =>
        dayjs(ev.start).isBetween(start, end, "day", "[]")
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((ev) => ev.category === categoryFilter);
    }

    setFilteredEvents(filtered);
  }, [dateRange, categoryFilter, events]);

  // ========== Handle Add Event ==========
  const handleAddExpenseSuccess = (newExpense: CalendarEvent) => {
    setEvents((prev) => [...prev, newExpense]);
    message.success("Thêm chi tiêu thành công!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Topbar user={user} onAvatarClick={() => setIsAuthOpen(true)} />

      <div className="flex-1 p-4">
        <Spin spinning={loading}>
          <div className="flex gap-4 items-start">
            {/* Sidebar trái */}
            <div className="w-[320px]">
              <EventGroup
                members={group?.members || []}
                events={filteredEvents}
                selectedDate={dayjs()}
                onDateChange={() =>
                  message.info("Chọn ngày trong mini calendar")
                }
                onAddGroup={() => message.info("Tạo nhóm mới")}
                onAddMember={() => message.info("Thêm thành viên")}
                onEditMember={(m) => message.info(`Sửa ${m.name}`)}
                onDeleteMember={(id) => message.info(`Xoá ${id}`)}
              />
            </div>

            {/* Nội dung chính */}
            <div className="flex-1">
              <Card
                title="Danh sách chi tiêu"
                className="shadow-sm"
                extra={
                  <Space wrap>
                    <RangePicker
                      defaultValue={[
                        dayjs().startOf("month"),
                        dayjs().endOf("month"),
                      ]}
                      format="DD/MM/YYYY"
                      onChange={(dates) => {
                        if (!dates) return setDateRange(null);
                        const [start, end] = dates as [Dayjs, Dayjs];
                        setDateRange([start, end]);
                      }}
                    />
                    <Select
                      placeholder="Danh mục"
                      allowClear
                      style={{ width: 150 }}
                      onChange={(value) => setCategoryFilter(value || null)}
                      options={[
                        { value: "Ăn uống", label: "Ăn uống" },
                        { value: "Shopping", label: "Shopping" },
                        { value: "Cafe", label: "Cafe" },
                        { value: "Đi lại", label: "Đi lại" },
                        { value: "Giải trí", label: "Giải trí" },
                        { value: "Khác", label: "Khác" },
                      ]}
                    />

                    <Button
                      type="primary"
                      onClick={() => setIsSplitModalOpen(true)}
                    >
                      + Thêm chi tiêu
                    </Button>
                  </Space>
                }
              >
                {Object.entries(
                  filteredEvents
                    .sort(
                      (a, b) =>
                        dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
                    )
                    .reduce((acc, ev) => {
                      const day = dayjs(ev.start).format("YYYY-MM-DD");
                      if (!acc[day]) acc[day] = [];
                      acc[day].push(ev);
                      return acc;
                    }, {} as Record<string, CalendarEvent[]>)
                ).map(([day, dayEvents]) => {
                  const totalDay = dayEvents.reduce(
                    (sum, ev) => sum + (ev.total || 0),
                    0
                  );

                  return (
                    <div key={day} className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-base text-gray-700">
                          {dayjs(day).format("dddd, DD/MM/YYYY")}
                        </h3>
                        <span className="text-sm text-gray-500">
                          Tổng: {totalDay.toLocaleString()} VNĐ
                        </span>
                      </div>
                      <List
                        bordered
                        dataSource={dayEvents}
                        renderItem={(ev) => (
                          <List.Item
                            actions={[
                              // Sửa sự kiện
                              <EditOutlined
                                key="edit"
                                style={{
                                  color: "#000", // mặc định đen
                                  cursor: "pointer",
                                  fontSize: 16,
                                }}
                                onClick={() => {
                                  // mở modal sửa
                                  setIsSplitModalOpen(true);
                                  setEditingEvent(ev); // set sự kiện đang sửa
                                }}
                              />,

                              // Xóa sự kiện
                              <DeleteOutlined
                                key="delete"
                                style={{
                                  color: "#000", // mặc định đen
                                  cursor: "pointer",
                                  fontSize: 16,
                                }}
                                onClick={() => {
                                  setEvents((prev) =>
                                    prev.filter((e) => e.id !== ev.id)
                                  );
                                  message.success("Đã xoá sự kiện");
                                }}
                              />,
                            ]}
                          >
                            <div className="flex justify-between w-full">
                              {/* Bên trái: category + note */}
                              <div>
                                <span className="font-medium">
                                  {ev.category || "Chung"}
                                </span>
                                {ev.note && (
                                  <span className="ml-2 text-gray-400 text-sm">
                                    ({ev.note})
                                  </span>
                                )}
                              </div>

                              {/* Bên phải: số tiền */}
                              <span className="text-gray-600">
                                {ev.total?.toLocaleString() || 0} VNĐ
                              </span>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  );
                })}
              </Card>
            </div>
          </div>
        </Spin>
      </div>

      {/* Modal đăng nhập */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u: User) => setUser(u)}
      />

      {/* Modal thêm chi tiêu */}
    </div>
  );
}
