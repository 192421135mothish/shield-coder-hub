import { Link, useLocation } from "@tanstack/react-router";
import { ShieldCheck, Terminal, LayoutDashboard, FileText, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/editor", label: "Editor", icon: Terminal },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "Reports", icon: FileText },
];

export function AppHeader() {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-primary to-accent glow">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold tracking-widest text-foreground">
              SEC<span className="text-gradient">AI</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Secure Compiler
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono uppercase tracking-wider transition-colors",
                  active
                    ? "bg-primary/10 text-primary neon-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 font-mono text-xs text-muted-foreground md:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          system online
        </div>
      </div>
    </header>
  );
}
