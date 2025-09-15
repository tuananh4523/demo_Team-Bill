"use client"

import Link from "next/link"
import { Home, CreditCard, Users, Split, Wallet, Settings, BarChart } from "lucide-react"
import { usePathname } from "next/navigation"
import clsx from "clsx"

// Định nghĩa type cho menu item
type MenuItem = {
  name: string
  href: string
  icon: React.ElementType
}

// Danh sách menu (chia nhóm)
const mainFeatures: MenuItem[] = [
  { name: "Bảng điều khiển", href: "/", icon: Home },
  { name: "Quản lý chi tiêu", href: "/expenses", icon: CreditCard },
  { name: "Chia hoá đơn", href: "/split", icon: Split },
  { name: "Nhóm", href: "/teams", icon: Users },
]

const financialTools: MenuItem[] = [
  { name: "Phương thức thanh toán", href: "/payments", icon: CreditCard },
  { name: "Theo dõi ngân sách", href: "/budget", icon: BarChart },
  { name: "Ví tiền", href: "/wallet", icon: Wallet },
]

const toolsSettings: MenuItem[] = [
  { name: "Cài đặt", href: "/settings", icon: Settings },
]

// Component render từng nhóm menu
function Section({ title, items }: { title: string; items: MenuItem[] }) {
  const pathname = usePathname()
  return (
    <div className="mt-6">
      {/* Tiêu đề nhóm */}
      <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </p>

      {/* Danh sách menu */}
      <div className="mt-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors",
                active
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Sidebar chính
export default function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto py-6">
        <Section title="Tính năng chính" items={mainFeatures} />
        <Section title="Công cụ tài chính" items={financialTools} />
        <Section title="Công cụ & Cài đặt" items={toolsSettings} />
      </div>
    </aside>
  )
}
