import { Language } from "@/context/Settings"

const dictionary = {
  vi: {
    sidebar: {
      dashboard: "Bảng điều khiển",
      teams: "Teams",
      events: "Sự kiện",
      members: "Thành viên",
      settings: "Cài đặt",
    },
    common: {
      add: "Thêm",
      delete: "Xoá",
      save: "Lưu",
      cancel: "Hủy",
    },
    pages: {
      title: "Hệ thống quản lý chi tiêu",
      teamManager: "Quản lý Teams & Sự kiện",
      splitBill: "Chia hoá đơn",
    },
  },
  en: {
    sidebar: {
      dashboard: "Dashboard",
      teams: "Teams",
      events: "Events",
      members: "Members",
      settings: "Settings",
    },
    common: {
      add: "Add",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
    },
    pages: {
      title: "Expense Management System",
      teamManager: "Manage Teams & Events",
      splitBill: "Split Bill",
    },
  },
} as const

export function t(lang: Language, path: string): string {
  // ví dụ: path = "sidebar.teams"
  const keys = path.split(".")
  let result: any = dictionary[lang]
  for (const key of keys) {
    result = result?.[key]
  }
  return result ?? path
}
