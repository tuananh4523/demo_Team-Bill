"use client";

import { Input, Avatar, Badge, Button, Tooltip, Dropdown, MenuProps } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  DownOutlined,
  UserOutlined,
  LoginOutlined,
  SettingOutlined,
  LogoutOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import React from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/login/AuthModal";
import Breadcrumb from "@/components/Breadcrumb";

type TopbarProps = {
  user: User | null;
  onAvatarClick: () => void;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
};

export default function Topbar({ user, onAvatarClick, onSearch, onLogout }: TopbarProps) {
  const router = useRouter();

  // Các action trong dropdown
  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Trang cá nhân",
      icon: <IdcardOutlined />,
      onClick: () => router.push("/profile"),
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <SettingOutlined />,
      onClick: () => router.push("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: () => {
        localStorage.removeItem("token");
        if (onLogout) onLogout();
        router.push("/login");
      },
    },
  ];

  return (
    <div className="flex items-center justify-between w-full bg-white px-6 py-3 border-b">
      {/* Bên trái: Breadcrumb */}
      <div className="text-2xl font-bold text-gray-800 tracking-wide flex items-center">
        <Breadcrumb />
      </div>

      {/* Bên phải */}
      <div className="flex items-center gap-4">
        {/* Ô tìm kiếm */}
        <Input
          placeholder="Tìm kiếm khóa học, nhóm..."
          prefix={<SearchOutlined className="text-gray-400" />}
          onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
          className="w-96 h-10 rounded-full [&_.ant-input]:rounded-full [&_.ant-input]:text-sm"
        />

        {/* Icon thông báo */}
        {user && (
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
        )}

        {/* Avatar + Tên + Dropdown */}
        {user ? (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <div
              className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 transition"
              onClick={onAvatarClick}
            >
              <Avatar
                size={32}
                src={user?.email ? `https://ui-avatars.com/api/?name=${user.username}` : undefined}
                icon={!user?.username && <UserOutlined />}
                className="border border-white shadow"
              />
              <span className="text-sm font-medium text-gray-800">
                {user?.username || "Người dùng"}
              </span>
              <DownOutlined className="text-gray-500 text-xs" />
            </div>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={onAvatarClick}
            className="rounded-full px-5 font-medium"
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </div>
  );
}
