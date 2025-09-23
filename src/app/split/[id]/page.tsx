"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Card, Spin, message, List, DatePicker, Select, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/vi";

import Topbar from "@/components/Topbar";
import AuthModal, { User } from "@/app/login/AuthModal";
import EventGroup from "@/app/split/event_group";

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

  // ========== Fake Events ==========
  useEffect(() => {
    const fake: CalendarEvent[] = [
      {
        id: "1",
        title: "Cơm trưa",
        start: "2025-08-22T12:00:00",
        teamId: String(id),
        color: "#FF9AA2",
        total: 32000,
        category: "Ăn uống",
      },
      {
        id: "2",
        title: "Siêu thị",
        start: "2025-08-22T18:00:00",
        teamId: String(id),
        color: "#B5EAD7",
        total: 3000,
        category: "Siêu thị",
      },
      {
        id: "3",
        title: "Cafe sáng",
        start: "2025-08-22T09:00:00",
        teamId: String(id),
        color: "#AEC6CF",
        total: 25000,
        category: "Cafe",
      },
      {
        id: "4",
        title: "Ăn lẩu",
        start: "2025-08-23T19:00:00",
        teamId: String(id),
        color: "#FFB347",
        total: 250000,
        category: "Ăn uống",
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Topbar user={user} onAvatarClick={() => setIsAuthOpen(true)} />

      <div className="flex-1 p-4">
        <Spin spinning={loading}>
          {/* Layout chính: 2 cột sát nhau, khoảng cách đẹp */}
          <div className="flex gap-4 items-start">
            {/* Sidebar trái cố định */}
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

            {/* Nội dung chính chiếm phần còn lại */}
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
                        { value: "Siêu thị", label: "Siêu thị" },
                        { value: "Cafe", label: "Cafe" },
                      ]}
                    />
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
                          <List.Item>
                            <div className="flex justify-between w-full">
                              <span>
                                {ev.title}{" "}
                                <span className="text-gray-400 text-xs">
                                  ({ev.category || "Chung"})
                                </span>
                              </span>
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
    </div>
  );
}
