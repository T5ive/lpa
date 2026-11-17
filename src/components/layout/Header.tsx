import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, GitCompareArrows, Home, Menu, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "ภาพรวม", icon: Home },
  { to: "/compare", label: "เปรียบเทียบงวด", icon: GitCompareArrows },
  { to: "/history", label: "สถิติย้อนหลัง", icon: BarChart3 },
  { to: "/method", label: "วิธีการวิเคราะห์", icon: ScrollText },
] as const;

function NavLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-lg font-bold leading-none">ว</span>
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight">หวยวน</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              ดูเลขซ้ำ เปรียบเทียบแต่ละงวด เข้าใจง่ายในหน้าเดียว
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="เมนูหลัก">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={NavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="เปิดเมนู"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="md:hidden">
              <SheetHeader>
                <SheetTitle>เมนู</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 pb-4" aria-label="เมนูหลัก">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/60",
                      )
                    }
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
