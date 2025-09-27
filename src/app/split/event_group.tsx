"use client";

import { useState } from "react";
import {
  Badge,
  Tooltip,
  Button,
  Card,
  Popover,
  Calendar,
} from "antd";
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
};

export default function EventGroup({
  events = [],
  selectedDate,
  onDateChange,
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

      {/* Split Bill Section */}
      <Card size="small" title="Chia Hoá Đơn" className="m-4 shadow-sm bg-white">
        <SplitBillForm selectedDate={selectedDate} />
      </Card>
    </div>
  );
}
