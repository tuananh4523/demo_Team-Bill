import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/Topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hệ thống quản lý chi tiêu",
  description: "Ứng dụng Next.js với sidebar và topbar cố định",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <Providers>
          <div className="flex h-full bg-[var(--beige-bg)]">
            {/* Sidebar trái */}
            <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
              <Sidebar />
            </aside>

            {/* Phần chính */}
            <div className="flex flex-col flex-1 h-full">
              {/* Topbar */}
              <header className="px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
                <Topbar />
              </header>

              {/* Nội dung chính cuộn riêng */}
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
