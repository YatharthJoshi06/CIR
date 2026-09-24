import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
// import { useAuth } from "@/lib/auth";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert,
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Bell,
  LogOut,
  Fingerprint,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/component/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  // const { officer } = useAuth();
  const logoutMut = useLogout();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cases", label: "Registry", icon: Briefcase },
    { href: "/cases/new", label: "New Case", icon: PlusCircle },
    { href: "/alerts", label: "Alerts", icon: Bell },
  ];

  const handleLogout = () => {
    logoutMut.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/login");
      },
    });
  };

  const navLinksContent = (
    <div className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active =
          location === item.href ||
          (item.href === "/cases" &&
            location.startsWith("/cases") &&
            location !== "/cases/new");

        return (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm font-medium
                ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden flex-col lg:flex-row">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
            <span className="font-bold text-sm tracking-widest text-card-foreground uppercase">
              CIR INTEL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/alerts">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
              aria-label="Alerts"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/cases/new">
            <Button size="sm" className="h-8 text-xs px-2.5">
              <PlusCircle className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">New Case</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <aside className="relative z-50 w-72 max-w-[85vw] bg-sidebar border-r border-border flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-card">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-xs tracking-widest text-card-foreground uppercase">
                    CIR INTEL
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    Command Center
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav Links */}
            <div className="p-4 flex-1 overflow-y-auto">
              {navLinksContent}
            </div>

            {/* Officer & Logout */}
            <div className="p-4 border-t border-border bg-card/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Fingerprint className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-xs font-semibold truncate text-foreground">
                    Cyber Crime Division
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono truncate">
                    OFFICER SESSION
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full text-xs h-8 border-border bg-secondary text-muted-foreground"
                onClick={handleLogout}
                disabled={logoutMut.isPending}
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                TERMINATE SESSION
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (visible on lg screens and up) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar shrink-0 h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border bg-card">
          <ShieldAlert className="h-6 w-6 text-primary mr-3 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest text-card-foreground uppercase">
              CIR INTEL
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Command Center
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
          {navLinksContent}
        </div>

        {/* Officer Info + Logout */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Fingerprint className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-sm font-semibold truncate text-foreground">
                Cyber Crime Division
              </span>
              <span className="text-xs text-muted-foreground font-mono truncate">
                OFFICER SESSION
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full text-xs h-8 border-border bg-secondary text-muted-foreground"
            onClick={handleLogout}
            disabled={logoutMut.isPending}
          >
            <LogOut className="h-3 w-3 mr-2" />
            TERMINATE SESSION
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}