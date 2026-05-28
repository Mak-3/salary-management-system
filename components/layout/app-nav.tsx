import Link from "next/link";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
] as const;

type AppNavProps = {
  active: (typeof LINKS)[number]["href"];
};

export function AppNav({ active }: AppNavProps) {
  return (
    <nav className="mb-8 flex gap-1 rounded-lg bg-muted/50 p-1 ring-1 ring-foreground/10 w-fit">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            active === link.href
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
