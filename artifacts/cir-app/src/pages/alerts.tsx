import { Layout } from "@/component/layout";
import { useGetAlerts, useGetHighRiskWallets } from "@workspace/api-client-react";
import { formatCurrency, truncateWallet, formatDate } from "@/lib/format";
import { AlertTriangle, Wallet } from "lucide-react";

function severityClass(s: string) {
  return { critical: "border-red-800 bg-red-900/20 text-red-400", warning: "border-yellow-800 bg-yellow-900/20 text-yellow-400", info: "border-blue-800 bg-blue-900/20 text-blue-400" }[s] ?? "border-border bg-muted text-muted-foreground";
}

export default function Alerts() {
  const { data: alerts, isLoading: alertsLoading } = useGetAlerts();
  const { data: wallets, isLoading: walletsLoading } = useGetHighRiskWallets();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Alerts & Intelligence</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Cross-match alerts and high-risk wallet intelligence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <h2 className="text-sm font-semibold text-foreground">Recent Alerts</h2>
              <span className="ml-auto text-xs text-muted-foreground">{alerts?.length ?? 0} alerts</span>
            </div>
            {alertsLoading ? (
              <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
            ) : alerts?.length === 0 ? (
              <p className="text-muted-foreground text-sm px-5 py-8 text-center">No alerts yet</p>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {alerts?.map(a => (
                  <div key={a.id} className="px-5 py-3">
                    <div className={`text-xs px-2 py-0.5 rounded border inline-block mb-1 font-medium ${severityClass(a.severity)}`}>{a.severity.toUpperCase()}</div>
                    <p className="text-sm text-foreground">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(a.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Wallet className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-semibold text-foreground">High-Risk Wallets</h2>
              <span className="ml-auto text-xs text-muted-foreground">{wallets?.length ?? 0} wallets</span>
            </div>
            {walletsLoading ? (
              <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
            ) : wallets?.length === 0 ? (
              <p className="text-muted-foreground text-sm px-5 py-8 text-center">No high-risk wallets detected</p>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {wallets?.map((w, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{truncateWallet(w.walletAddress)}</span>
                      <span className="text-xs bg-red-900/30 text-red-400 border border-red-800 px-2 py-0.5 rounded font-medium">{w.caseCount} cases</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(w.totalAmountLost, "INR")} total</p>
                    <p className="text-xs text-muted-foreground mt-0.5">FIRs: {w.linkedFirs.join(", ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}