// "use client" 
// import { Geist, Geist_Mono } from "next/font/google"
// import "./globals.css"
// import { SettingsProvider, useSettings } from "@/context/Settings"
// import { ConfigProvider, theme as antdTheme } from "antd"
// // Import Sidebar
// import Sidebar from "@/components/sidebar"

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// })

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// })

// // ⚠️ Khi dùng "use client", bạn KHÔNG thể dùng metadata như Server Component
// // Nếu vẫn muốn có metadata, bạn nên tạo file `app/head.tsx`

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const { settings } = useSettings()  // bây giờ dùng được vì layout là Client

//   return (
//     <html lang="vi">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <SettingsProvider>
//           <ConfigProvider
//             theme={{
//               algorithm:
//                 settings.theme === "dark"
//                   ? antdTheme.darkAlgorithm
//                   : antdTheme.defaultAlgorithm,
//             }}
//           >
//             <div className="flex">
//               {/* Sidebar luôn hiển thị cố định */}
//               <Sidebar />

//               {/* Nội dung chính thay đổi khi chuyển trang */}
//               <main className="flex-1 p-6 bg-gray-50 min-h-screen">
//                 {children}
//               </main>
//             </div>
//           </ConfigProvider>
//         </SettingsProvider>
//       </body>
//     </html>
//   )
// }
// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; 
import Sidebar from "@/components/sidebar";

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
  description: "Ứng dụng Next.js với sidebar cố định và theme tùy chỉnh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex">
            {/* Sidebar cố định */}
            <Sidebar />

            {/* Nội dung chính */}
            <main className="flex-1 p-6 bg-gray-50 min-h-screen">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

