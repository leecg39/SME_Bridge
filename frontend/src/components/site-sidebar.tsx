"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Calculator,
  ChartNoAxesCombined,
  LayoutDashboard,
  Map,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  match: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드", match: "/dashboard" },
  { href: "/valuation/upload", icon: ChartNoAxesCombined, label: "기업가치", match: "/valuation" },
  { href: "/tax-simulation", icon: Calculator, label: "세금", match: "/tax-simulation" },
  { href: "/roadmap", icon: Map, label: "로드맵", match: "/roadmap" },
  { href: "/consultation", icon: PhoneCall, label: "상담", match: "/consultation" },
];

export function SiteSidebar() {
  const pathname = usePathname();

  return (
    <header className="site-sidebar">
      <div className="sidebar-inner">
        <Link className="brand sidebar-brand" href="/">
          <span className="brand-mark">SB</span>
          <span>
            승계브릿지
            <small>SME Bridge</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          {navItems.map((item) => {
            const isActive = pathname === item.match || pathname.startsWith(`${item.match}/`);
            const Icon = item.icon;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`site-nav-link${isActive ? " active" : ""}`}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" size={22} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="header-actions" aria-label="빠른 상담 메뉴">
          <div className="header-phone">
            <span>비공개 상담 접수</span>
            <strong>무료 1차 진단</strong>
          </div>
          <Link className="header-action header-action-consult" href="/consultation">
            <PhoneCall aria-hidden="true" size={22} />
            상담 요청
          </Link>
          <Link className="header-action header-action-case" href="/valuation/upload">
            <BriefcaseBusiness aria-hidden="true" size={22} />
            가치산정
          </Link>
        </div>
      </div>
    </header>
  );
}
