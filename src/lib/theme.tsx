"use client";

import { ConfigProvider, theme as antdTheme } from "antd";

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          // ================== Nền tổng thể ==================
          colorBgBase: "#fdf6ec", // màu be nhạt
          colorTextBase: "#333",
          fontFamily: "Inter, sans-serif",

          // ================== Input / Form ==================
          colorBorder: "#d9d9d9",
          colorBgContainer: "#fff",
          controlHeight: 40,
          borderRadius: 8,

          // ================== Button ==================
          colorPrimary: "#E0EBFF", // xanh nhạt
          colorPrimaryHover: "#d0e0ff",
          colorPrimaryActive: "#b0c4de",
          colorLink: "#1a3d7c",
        },
        algorithm: antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};
