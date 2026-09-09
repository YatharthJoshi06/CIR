import { useGetDashboardStats, useGetRecentCases } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Layout } from "@/component/layout";
import { AlertTriangle, FolderOpen, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency, truncateWallet, formatDate } from "@/lib/format";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const RISK_COLORS: Record<string, string> = {
  low: "#22c55e", medium: "#eab308", high: "#f97316", critical: "#ef4444",
};
const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6", under_investigation: "#eab308", closed: "#6b7280", referred: "#a855f7",
};

function riskLabel(r: string) {
  return { low: "Low", medium: "Medium", high: "High", critical: "Critical" }[r] ?? r;
}
function statusLabel(s: string) {
  return { open: "Open", under_investigation: "Investigation", closed: "Closed", referred: "Referred" }[s] ?? s;
}
function riskBadgeClass(r: string) {
  return {
    low: "bg-green-900/30 text-green-400 border-green-800",
    medium: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    high: "bg-orange-900/30 text-orange-400 border-orange-800",
    critical: "bg-red-900/30 text-red-400 border-red-800",
  }[r] ?? "bg-muted text-muted-foreground border-border";
}
function statusBadgeClass(s: string) {
  return {
    open: "bg-blue-900/30 text-blue-400 border-blue-800",
    under_investigation: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    closed: "bg-gray-800 text-gray-400 border-gray-700",
    referred: "bg-purple-900/30 text-purple-400 border-purple-800",
  }[s] ?? "bg-muted text-muted-foreground border-border";
}

function StatCard({ label, value, sub, icon: Icon, iconClass }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; iconClass: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex items-start gap-4">
      <div className={`p-2 rounded-lg ${iconClass}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recent, isLoading: recentLoading } = useGetRecentCases();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Crypto Intelligence Registry — Overview</p>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-card border border-border rounded-lg p-5 h-24 animate-pulse" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Cases" value={stats.totalCases} icon={FolderOpen} iconClass="bg-blue-900/30 text-blue-400" />
            <StatCard label="Open Cases" value={stats.openCases} sub="Awaiting action" icon={TrendingUp} iconClass="bg-yellow-900/30 text-yellow-400" />
            <StatCard label="Tracked Wallets" value={stats.totalWallets} sub={`${stats.highRiskWallets} high-risk`} icon={Wallet} iconClass="bg-purple-900/30 text-purple-400" />
            <StatCard label="Total Fraud" value={formatCurrency(stats.totalAmountLost, "INR")} icon={AlertTriangle} iconClass="bg-red-900/30 text-red-400" />
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={[
                    { name: "low", count: 0 }, { name: "medium", count: 0 },
                    { name: "high", count: 0 }, { name: "critical", count: 0 },
                  ]} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {["low","medium","high","critical"].map((k, i) => <Cell key={i} fill={RISK_COLORS[k]!} />)}
                  </Pie>
                  <Tooltip formatter={(v, name) => [v, riskLabel(String(name))]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Case Status</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={[
                  { status: "open", count: stats.openCases },
                  { status: "closed", count: stats.closedCases },
                ]} margin={{ left: -20 }}>
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} tickFormatter={statusLabel} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={statusLabel} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {["open","closed"].map((k, i) => <Cell key={i} fill={STATUS_COLORS[k]!} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Stats</h2>
              <div className="space-y-3">
                {[
                  { label: "Cases This Month", value: stats.casesThisMonth },
                  { label: "High-Risk Wallets", value: stats.highRiskWallets },
                  { label: "Active Alerts", value: stats.alertsCount },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-bold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Cases</h2>
            <Link href="/cases">
              <span className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          {recentLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent?.slice(0, 8).map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <div className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 cursor-pointer transition-colors">
                    <div className="font-mono text-xs text-muted-foreground w-28 shrink-0">{c.firNo}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.victimName}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.policeStation}</p>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{c.cryptoType}</div>
                    <div className="text-sm font-medium text-foreground shrink-0">{formatCurrency(c.amountLost, "INR")}</div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium shrink-0 ${statusBadgeClass(c.status)}`}>{statusLabel(c.status)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium shrink-0 ${riskBadgeClass(c.riskLevel)}`}>{riskLabel(c.riskLevel)}</span>
                    <div className="text-xs text-muted-foreground shrink-0">{formatDate(c.createdAt)}</div>
                  </div>
                </Link>
              ))}
              {recent?.length === 0 && <p className="text-muted-foreground text-sm px-5 py-6 text-center">No cases registered yet.</p>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}