"use client";

import { Input, Avatar, Badge, Button } from "antd";
import { SearchOutlined, BellOutlined } from "@ant-design/icons";
import React from "react";
import { User } from "@/app/login/AuthModal";

type TopbarProps = {
  user: User | null;
  onAvatarClick: () => void;
  onSearch?: (query: string) => void; // ✅ thêm callback
};

export default function Topbar({ user, onAvatarClick, onSearch }: TopbarProps) {
  return (
    <div className="flex items-center justify-between w-full bg-white px-6 py-2 border-b border-gray-200">
      {/* Bên trái có thể để Breadcrumb hoặc logo */}
      <div className="font-semibold text-gray-600">Team Management</div>

      {/* Bên phải */}
      <div className="flex items-center gap-4">
        {/* Ô tìm kiếm */}
        <Input.Search
          placeholder="Search groups or members..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={onSearch}
          className="w-72 rounded-full"
        />

        {/* Icon chuông */}
        <Badge dot>
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined className="text-gray-600" />}
          />
        </Badge>

        {/* Avatar */}
        <Avatar
          className="cursor-pointer"
          onClick={onAvatarClick}
        >
          {user?.email ? user.email[0].toUpperCase() : "?"}
        </Avatar>
      </div>
    </div>
  );
}
