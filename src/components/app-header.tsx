"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui";

export function AppHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        className={`text-base transition-colors ${
          active
            ? "font-medium text-signal-blue"
            : "text-ink hover:text-signal-blue"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-chalk bg-paper">
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded bg-signal-blue text-sm font-semibold text-paper transition-colors group-hover:bg-deep-signal"
            aria-hidden
          >
            A
          </div>
          <div className="leading-tight">
            <span className="text-lg font-semibold text-carbon">Atlas</span>
            <span className="text-lg font-normal text-pencil"> Match</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-5" aria-label="Main">
          {navLink("/history", "History")}
          {session?.user ? (
            <span className="hidden max-w-[160px] truncate text-sm text-pencil sm:inline">
              {session.user.name ?? session.user.email}
            </span>
          ) : (
            <>
              <span className="hidden h-4 w-px bg-haze sm:block" aria-hidden />
              <Link
                href="/auth/signin"
                className="hidden text-base text-ink transition-colors hover:text-signal-blue sm:inline"
              >
                Sign in
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="hidden sm:inline-flex">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
