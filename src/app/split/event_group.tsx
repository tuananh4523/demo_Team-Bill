"use client";

import { useState } from "react";
import {
  List,
  Badge,
  Tooltip,
  Button,
  Avatar,
  Space,
  Card,
  Tag,
  Popover,
  Calendar,
} from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import SplitBillForm from "@/components/Modals/SplitBillModal";
import { Member } from "./[id]/page";

// ===== Types =====
export type EventItem = {
  id: string;
  title: string;
  start: string;
  teamId: string;
  color: string;
};

export type EventGroupProps = {
  members: Member[];
  events?: EventItem[];
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
};

export default function EventGroup({
  members = [],
  events = [],
  selectedDate,
  onDateChange,
  onAddMember,
  onEditMember,
  onDeleteMember,
}: EventGroupProps) {
  const [open, setOpen] = useState(false);

  // Hiển thị badge sự kiện trong mini calendar
  const dateCellRender = (value: Dayjs) => {
    const dayEvents = events.filter((ev) => value.isSame(ev.start, "day"));
    if (!dayEvents.length) return null;

    return (
      <ul className="events space-y-1">
        {dayEvents.map((ev) => (
          <li key={ev.id}>
            <Tooltip title={ev.title}>
              <Badge color={ev.color} />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-80 border-r bg-gray-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h1 className="text-lg font-bold text-gray-700">
          Quản lý sự kiện & thành viên
        </h1>
      </div>

      {/* Mini Calendar Header */}
      <Card size="small" bordered={false} className="m-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Popover
            open={open}
            onOpenChange={setOpen}
            trigger="click"
            placement="bottomRight"
            content={
              <div style={{ width: 250, fontSize: "12px" }}>
                <Calendar
                  fullscreen={false}
                  value={selectedDate}
                  onSelect={(date) => {
                    onDateChange(date);
                    setOpen(false);
                  }}
                  headerRender={({ value }) => (
                    <div className="w-full text-center py-2 font-bold text-gray-800 text-base">
                      {value.format("MMMM YYYY")}
                    </div>
                  )}
                  dateFullCellRender={(date) => {
                    const isToday = date.isSame(dayjs(), "day");
                    const isSelected = date.isSame(selectedDate, "day");

                    return (
                      <div
                        className={`flex items-center justify-center w-7 h-7 rounded-full cursor-pointer
          ${
            isSelected
              ? "bg-blue-500 text-white font-bold"
              : isToday
              ? "border border-blue-500 text-blue-500 font-semibold"
              : "text-gray-700"
          }`}
                      >
                        {date.date()}
                      </div>
                    );
                  }}
                />
              </div>
            }
          >
            <Button
              type="link"
              className="!text-base !font-bold !text-black hover:!text-blue-500"
            >
              {selectedDate.format("MMMM YYYY")}
            </Button>
          </Popover>
        </div>
      </Card>

      {/* Members */}
      {/* <Card
        size="small"
        title={
          <div className="flex justify-between items-center">
            <span className="font-semibold">Thành viên nhóm</span>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={onAddMember}
            />
          </div>
        }
        className="m-4 shadow-sm"
      >
        <List
          size="small"
          dataSource={members}
          locale={{ emptyText: "Chưa có thành viên" }}
          renderItem={(member: Member) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="link"
                  size="small"
                  onClick={() => onEditMember(member)}
                >
                  Sửa
                </Button>,
                <Button
                  key="delete"
                  type="link"
                  danger
                  size="small"
                  onClick={() => onDeleteMember(member._id)}
                >
                  Xóa
                </Button>,
              ]}
            >
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
                {member.status && (
                  <Tag color={member.status === "Active" ? "green" : "volcano"}>
                    {member.status}
                  </Tag>
                )}
              </Space>
            </List.Item>
          )}
        />
      </Card> */}

      {/* Split Bill Section */}
      <Card
        size="small"
        title="Chia Hoá Đơn"
        className="m-4 shadow-sm bg-white"
      >
        <SplitBillForm selectedDate={selectedDate} />
      </Card>
    </div>
  );
}
