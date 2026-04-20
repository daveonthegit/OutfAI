"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

const SEGMENTS: {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
}[] = [
  {
    href: "/plan",
    label: "Hub",
    isActive: (p) => p === "/plan",
  },
  {
    href: "/plan/calendar",
    label: "Calendar",
    isActive: (p) => p === "/plan/calendar",
  },
  {
    href: "/plan/packing",
    label: "Packing",
    isActive: (p) => p.startsWith("/plan/packing"),
  },
];

export function PlanHubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100 shrink-0"
          >
            OutfAI
          </Link>

          <nav
            className="order-3 w-full basis-full flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:order-none sm:w-auto sm:basis-auto md:gap-x-6"
            aria-label="Plan hub"
          >
            {SEGMENTS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em] transition-colors duration-100",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 md:gap-6 ml-auto sm:ml-0">
            <Link
              href="/archive"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              Archive
            </Link>
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        {children}
      </div>
    </main>
  );
}
