import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BottomNavBar from "@/app/(protected)/_components/BottomNavBar";

describe("Citizen Home UI", () => {
  it("BottomNavBar is accessible and marks Home active", () => {
    render(
      <BottomNavBar
        activeKey="home"
        items={[
          { key: "browse", label: "Services", href: "/app", icon: "grid" },
          {
            key: "track",
            label: "Track",
            href: "/app/appointments?status=upcoming",
            icon: "clock",
          },
          {
            key: "home",
            label: "Home",
            href: "/",
            icon: "home",
            floating: true,
          },
          { key: "id", label: "ID", href: "/app/profile", icon: "fingerprint" },
          { key: "more", label: "More", href: "/app/more", icon: "menu" },
        ]}
      />
    );
    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(nav).toBeTruthy();
    const home = screen.getByRole("link", { name: /home/i });
    expect(home.getAttribute("aria-current")).toBe("page");
  });
});
