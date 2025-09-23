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
  onAddGroup?: () => void;      
  onAddMember?: () => void;     
  onEditMember?: (m: Member) => void; 
  onDeleteMember?: (id: string) => void; 
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
        <h1 className="text-lg font-bold text-gray-700 text-center">
          Quản lý sự kiện & thành viên
        </h1>
      </div>

      {/* Mini Calendar Header */}
      <Card size="small" bordered={false} className="m-4 shadow-sm">
        <div className="flex items-center justify-center">
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
