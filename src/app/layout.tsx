import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { checkEnvironmentVariables } from "@/lib/env-check";

// 在服务器端启动时检查环境变量
if (process.env.NODE_ENV !== 'production') {
  checkEnvironmentVariables();
}

export const metadata: Metadata = {
  title: "AI 文生图生成器",
  description: "使用 AI 将文字描述转换为图像",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
