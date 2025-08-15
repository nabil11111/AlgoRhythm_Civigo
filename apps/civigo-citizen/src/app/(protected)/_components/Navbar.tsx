"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home as HomeIcon,
  LayoutGrid as LayoutGridIcon,
  Clock as ClockIcon,
  Wallet as WalletIcon,
  Menu as MenuIcon,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  const tabs = [
    { id: "home", label: "Home", icon: HomeIcon, href: "/" },
    { id: "services", label: "Services", icon: LayoutGridIcon, href: "/app" },
    {
      id: "activity",
      label: "Activity",
      icon: ClockIcon,
      href: "/activity",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: WalletIcon,
      href: "/app/wallet",
    },
    { id: "more", label: "More", icon: MenuIcon, href: "/app/more" },
  ];

  function handleNavigate(id: string, href: string) {
    setActiveTab?.(id);
    router.push(href);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 w-full"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative bg-[var(--color-primary)] h-20 flex items-center justify-between px-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className="relative z-10 flex flex-col items-center focus:outline-none"
              onClick={() => handleNavigate(tab.id, tab.href)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-[var(--color-primary)] rounded-full grid place-items-center">
                  <div className="w-12 h-12 bg-white rounded-full grid place-items-center">
                    <Icon className="text-[var(--color-primary)]" size={24} />
                  </div>
                </div>
              )}
              {!isActive && <Icon className="text-white" size={24} />}
              {isActive && (
                <span className="text-white text-sm mt-6">{tab.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
