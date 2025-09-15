"use client"

import { useSettings, Language, Currency } from "@/context/Settings"
import { Card } from "@/components/ui/card"
import { Button, Select } from "antd"
import { Moon, Sun } from "lucide-react"

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-xl shadow-lg p-6 space-y-6">
        <h1 className="text-xl font-bold">Cài đặt</h1>

        {/* Theme */}
        <div className="flex items-center justify-between">
          <span>Theme</span>
          <Button
            onClick={() =>
              updateSettings({
                theme: settings.theme === "dark" ? "light" : "dark",
              })
            }
            icon={settings.theme === "dark" ? <Sun /> : <Moon />}
          >
            {settings.theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <span>Ngôn ngữ</span>
          <Select<Language>
            value={settings.language}
            onChange={(v) => updateSettings({ language: v })}
            options={[
              { value: "vi", label: "Tiếng Việt" },
              { value: "en", label: "English" },
            ]}
          />
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between">
          <span>Đơn vị tiền tệ</span>
          <Select<Currency>
            value={settings.currency}
            onChange={(v) => updateSettings({ currency: v })}
            options={[
              { value: "VND", label: "VNĐ" },
              { value: "USD", label: "USD" },
            ]}
          />
        </div>
      </Card>
    </div>
  )
}
