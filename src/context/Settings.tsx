"use client"

import { createContext, useContext, useEffect, useState } from "react"

// ====== Types ======
export type Theme = "light" | "dark"
export type Language = "vi" | "en"
export type Currency = "VND" | "USD"

export type Settings = {
  theme: Theme
  language: Language
  currency: Currency
}

type SettingsContextType = {
  settings: Settings
  updateSettings: (s: Partial<Settings>) => void
}

// ====== Context ======
const SettingsContext = createContext<SettingsContextType>({
  settings: { theme: "light", language: "vi", currency: "VND" },
  updateSettings: () => {},
})

// ====== Provider ======
export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    theme: "light",
    language: "vi",
    currency: "VND",
  })

  // Load từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("settings")
    if (stored) {
      try {
        const parsed: Settings = JSON.parse(stored)
        setSettings(parsed)
        document.documentElement.classList.add(parsed.theme)
      } catch {
        console.warn("⚠️ Settings trong localStorage bị lỗi, dùng mặc định.")
      }
    }
  }, [])

  const updateSettings = (s: Partial<Settings>) => {
    const newSettings = { ...settings, ...s }
    setSettings(newSettings)
    localStorage.setItem("settings", JSON.stringify(newSettings))

    // Update theme class cho Tailwind
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(newSettings.theme)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

// ====== Hook ======
export const useSettings = () => useContext(SettingsContext)
