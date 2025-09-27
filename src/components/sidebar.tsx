"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  CreditCard,
  Users,
  UserPlus,
  Wallet,
  Settings,
  BarChart,
  Tags,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// ================= Types =================
type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

type Friend = {
  id: number;
  name: string;
  role: string;
  emoji: string;
};

// ================= Data =================
const mainFeatures: MenuItem[] = [
  { name: "Bảng điều khiển", href: "/dashboard", icon: Home },
  { name: "Chi tiêu", href: "/expenses", icon: CreditCard },
  // { name: "Bạn bè", href: "/friends", icon: UserPlus },
  { name: "Nhóm", href: "/teams", icon: Users },
  { name: "Danh mục chi tiêu", href: "/categories", icon: Tags },
];

const financialTools: MenuItem[] = [
  { name: "Phương thức thanh toán", href: "/payments", icon: CreditCard },
  { name: "Ngân sách", href: "/budget", icon: BarChart },
  { name: "Ví tiền", href: "/wallet", icon: Wallet },
];

const toolsSettings: MenuItem[] = [
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

const friends: Friend[] = [
  { id: 1, name: "Bagas Mahpie", role: "Bạn bè", emoji: "😀" },
  { id: 2, name: "Sir Dandy", role: "Bạn cũ", emoji: "😎" },
  { id: 3, name: "Jhon Tosan", role: "Bạn bè", emoji: "🥳" },
];

// ================= Section =================
function Section({ title, items }: { title: string; items: MenuItem[] }) {
  const pathname = usePathname();
  return (
    <div className="mt-6">
      <p className="px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <div className="mt-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all",
                active
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ================= Friends =================
function FriendsList() {
  return (
    <div className="mt-6">
      <p className="px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
        Bạn bè
      </p>
      <div className="mt-3 space-y-2">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center gap-3 px-4 py-1">
            {/* Avatar emoji */}
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-lg">
              {friend.emoji}
            </div>

            {/* Thông tin bạn bè */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">
                {friend.name}
              </span>
              <span className="text-xs text-gray-500">{friend.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= Sidebar =================
export default function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r bg-white flex flex-col shadow-sm">
      {/* Logo */}
      {/* Logo */}
      <div className="h-20 flex items-center border-b px-6">
        <Link href="/" className="flex items-center gap-3 w-full">
          <Image
            src="/Logo.png"
            alt="Team Bill Logo"
            width={60} // tăng kích thước logo
            height={60}
          />
          <span className="text-2xl font-extrabold tracking-wide truncate w-4/5">
            Team <span className="text-blue-600">Bill</span>
          </span>
        </Link>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-6">
        <Section title="Tổng quan" items={mainFeatures} />
        <Section title="Công cụ tài chính" items={financialTools} />
        <FriendsList />
        <Section title="Cài đặt" items={toolsSettings} />
      </div>

      {/* Logout */}
      <div className="border-t px-4 py-3">
        <Link
          href="/logout"
          className="flex items-center gap-3 text-sm text-red-500 font-medium hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Link>
      </div>
    </aside>
  );
}
