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
} from "lucide-react";
import { Button } from "@/component/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  // const { officer } = useAuth();
  const logoutMut = useLogout();
  const queryClient = useQueryClient();

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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border bg-sidebar shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border bg-card">
          <ShieldAlert className="h-6 w-6 text-primary mr-3" />
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
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Officer Info + Logout */}
        {/* {officer && ( */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Fingerprint className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate text-foreground">
                  {/* {officer.name} */}
                </span>
                <span className="text-xs text-muted-foreground font-mono truncate">
                  {/* {officer.badgeNo} */}
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
        {/* )} */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}