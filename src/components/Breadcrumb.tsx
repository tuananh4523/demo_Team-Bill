"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  // Cắt path thành mảng
  const segments = pathname.split("/").filter(Boolean);

  // Map segment sang title đẹp
  const mapTitle = (segment: string) => {
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
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

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
                  {mapTitle(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-blue-600 hover:underline"
                >
                  {mapTitle(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
