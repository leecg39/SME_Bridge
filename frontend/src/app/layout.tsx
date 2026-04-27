import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteSidebar } from "@/components/site-sidebar";

import "./globals.css";

export const metadata: Metadata = {
  title: "승계브릿지",
  description: "중소기업 기업승계형 M&A 준비 플랫폼",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SiteSidebar />
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
