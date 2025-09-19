"use client";

import { SettingsProvider, useSettings } from "@/context/Settings";
import { ConfigProvider, theme as antdTheme } from "antd";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          settings.theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeWrapper>{children}</ThemeWrapper>
    </SettingsProvider>
  );
}
