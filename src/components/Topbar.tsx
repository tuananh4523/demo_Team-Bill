"use client";

import { Input, Avatar, Badge, Button, Tooltip } from "antd";
import { SearchOutlined, BellOutlined } from "@ant-design/icons";
import React from "react";
import { User } from "@/app/login/AuthModal";
import Breadcrumb from "@/components/Breadcrumb";

type TopbarProps = {
  user: User | null;
  onAvatarClick: () => void;
  onSearch?: (query: string) => void;
};

export default function Topbar({ user, onAvatarClick, onSearch }: TopbarProps) {
  return (
    <div className="flex items-center justify-between w-full bg-white px-6 py-3 border-b">
      {/* Bên trái: Breadcrumb */}
      <div className="text-4xl font-bold text-gray-800 tracking-wide flex items-center">
  <Breadcrumb />
</div>


      {/* Bên phải */}
      <div className="flex items-center gap-4">
        {/* Ô tìm kiếm bo tròn lớn */}
        <Input
          placeholder="Tìm kiếm khóa học, nhóm..."
          prefix={<SearchOutlined className="text-gray-400" />}
          onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
          className="w-96 h-10 rounded-full [&_.ant-input]:rounded-full [&_.ant-input]:text-sm"
        />

        {/* Icon thông báo */}
        <Tooltip title="Thông báo">
          <Badge dot>
            <Button
              type="text"
              shape="circle"
              icon={<BellOutlined className="text-gray-600 text-lg" />}
              className="hover:bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full"
            />
          </Badge>
        </Tooltip>

        {/* Avatar + Tên người dùng */}
        <div
          className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-full hover:bg-gray-50"
          onClick={onAvatarClick}
        >
          <Avatar
            className="bg-blue-500 font-semibold"
            size="large"
          >
            {user?.email ? user.email[0].toUpperCase() : "?"}
          </Avatar>
          <span className="text-sm font-medium text-gray-700">
            {user?.username || "Người dùng"}
          </span>
        </div>
      </div>
    </div>
  );
}
