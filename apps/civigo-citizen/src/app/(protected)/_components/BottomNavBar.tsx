"use client";

import React from "react";
import Link from "next/link";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: "home" | "grid" | "clock" | "fingerprint" | "menu";
  floating?: boolean;
};

export default function BottomNavBar({
  activeKey,
  items,
  onNavigate,
}: {
  activeKey: string;
  items: NavItem[];
  onNavigate?: (key: string) => void;
}) {
  const activeIndex = Math.max(
    0,
    items.findIndex((i) => i.key === activeKey)
  );
  const activeItem = items[activeIndex] ?? items[0];
  const leftPercent = `${(activeIndex + 0.5) * (100 / items.length)}%`;
  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative">
        {/* Full width curved bar with moving notch */}
        <div className="relative bg-[var(--color-primary)] h-[70px] overflow-hidden">
          {/* Concave notch aligned to active tab */}
          <svg
            className="absolute top-0"
            style={{ left: leftPercent, transform: "translateX(-50%)" }}
            width="90"
            height="42"
            viewBox="0 0 90 42"
            fill="none"
            aria-hidden
          >
            <path d="M0,42 Q0,0 45,0 Q90,0 90,42 L0,42 Z" fill="white" />
          </svg>

          {/* Five evenly spaced tabs */}
          <ul className="grid grid-cols-5 items-center text-center h-full px-3">
            {items.map((item) => (
              <li key={item.key} className="flex items-center justify-center">
                <NavLink
                  item={item}
                  active={activeKey === item.key}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Floating active icon */}
        <div
          className="absolute -top-[23px]"
          style={{ left: leftPercent, transform: "translateX(-50%)" }}
        >
          <Link
            href={activeItem.href}
            aria-label={activeItem.label}
            aria-current="page"
            onClick={() => onNavigate?.(activeItem.key)}
            className="grid place-items-center w-[46px] h-[46px] rounded-full bg-[var(--color-primary)] text-white shadow-lg transition active:scale-95 focus:outline-none"
          >
            <Icon name={activeItem.icon} active />
            <span className="sr-only">{activeItem.label}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: (key: string) => void;
}) {
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate?.(item.key)}
      className={`flex flex-col items-center gap-1 py-1 transition active:scale-95 focus:outline-none ${
        active ? "text-white font-bold" : "text-white/60"
      }`}
    >
      <Icon name={item.icon} active={active} />
      <span className="leading-none text-xs">{item.label}</span>
    </Link>
  );
}

function Icon({ name, active }: { name: NavItem["icon"]; active?: boolean }) {
  const color = active ? "#ffffff" : "rgba(255,255,255,0.6)";
  const stroke = color;
  switch (name) {
    case "home":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z"
            fill={color}
          />
        </svg>
      );
    case "grid":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="2"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="13"
            y="3"
            width="8"
            height="8"
            rx="2"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="2"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="2"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
          />
        </svg>
      );
    case "clock":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M12 7v6l4 2"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "fingerprint":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2c4.418 0 8 2.91 8 7.5 0 3.5-1 7.5-4 10"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M12 6c2.761 0 5 1.567 5 4.5 0 2.5-.5 5.5-2.5 7.5"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M12 10c1.5 0 3 .9 3 2.5 0 1.5-.2 3.5-1 4.5"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "menu":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 6h18M3 12h18M3 18h18"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
