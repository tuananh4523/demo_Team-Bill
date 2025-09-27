"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const [groupName, setGroupName] = useState<string | null>(null);

  // Map segment sang title đẹp
  const mapTitle = (segment: string, idx: number) => {
    switch (segment) {
      case "dashboard":
        return "Bảng điều khiển";
      case "expenses":
        return "Quản lý chi tiêu";
      case "teams":
        return "Nhóm";
      case "split":
        return "Chia hóa đơn";
      default:
        // Nếu là trang split/:id thì thay id bằng tên nhóm
        if (segments[0] === "split" && idx === 1) {
          return groupName || segment; // fallback ra id nếu chưa có tên
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  useEffect(() => {
    const fetchGroupName = async () => {
      if (segments[0] === "split" && segments[1]) {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/teams/${segments[1]}`
          );
          setGroupName(res.data.name);
        } catch {
          setGroupName(null);
        }
      }
    };
    fetchGroupName();
  }, [segments]);

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="text-blue-600 hover:underline">
            Team Billing
          </Link>
        </li>
        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          return (
            <li key={idx} className="flex items-center space-x-2">
              <span>{">"}</span>
              {idx === segments.length - 1 ? (
                <span className="font-semibold text-gray-900">
                  {mapTitle(segment, idx)}
                </span>
              ) : (
                <Link href={href} className="text-blue-600 hover:underline">
                  {mapTitle(segment, idx)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
