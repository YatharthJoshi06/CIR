import { Layout } from "@/component/layout";
import { useGetAlerts, useGetHighRiskWallets } from "@workspace/api-client-react";
import { formatCurrency, truncateWallet, formatDate } from "@/lib/format";
import { AlertTriangle, Wallet, ShieldAlert, Clock } from "lucide-react";

function severityClass(s: string) {
  return {
    critical: "border-red-800 bg-red-900/20 text-red-400",
    warning: "border-yellow-800 bg-yellow-900/20 text-yellow-400",
    info: "border-blue-800 bg-blue-900/20 text-blue-400",
  }[s] ?? "border-border bg-muted text-muted-foreground";
}

export default function Alerts() {
  const { data: alerts, isLoading: alertsLoading } = useGetAlerts();
  const { data: wallets, isLoading: walletsLoading } = useGetHighRiskWallets();

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Alerts & Intelligence</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Cross-match alerts and high-risk wallet intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Alerts Card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-border bg-card">
              <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">Recent Alerts</h2>
              <span className="ml-auto text-[11px] sm:text-xs text-muted-foreground font-mono">
                {alerts?.length ?? 0} alerts
              </span>
            </div>

            {alertsLoading ? (
              <div className="p-4 sm:p-5 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : alerts?.length === 0 ? (
              <p className="text-muted-foreground text-xs sm:text-sm px-4 py-8 text-center">No alerts yet</p>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {alerts?.map((a) => (
                  <div key={a.id} className="p-3.5 sm:p-4 hover:bg-muted/20 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className={`text-[10px] sm:text-xs px-2 py-0.5 rounded border font-medium ${severityClass(a.severity)}`}>
                        {a.severity.toUpperCase()}
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(a.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed break-words">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High-Risk Wallets Card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-border bg-card">
              <Wallet className="h-4 w-4 text-red-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">High-Risk Wallets</h2>
              <span className="ml-auto text-[11px] sm:text-xs text-muted-foreground font-mono">
                {wallets?.length ?? 0} wallets
              </span>
            </div>

            {walletsLoading ? (
              <div className="p-4 sm:p-5 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : wallets?.length === 0 ? (
              <p className="text-muted-foreground text-xs sm:text-sm px-4 py-8 text-center">No high-risk wallets detected</p>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {wallets?.map((w, i) => (
                  <div key={i} className="p-3.5 sm:p-4 hover:bg-muted/20 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground truncate bg-muted/40 px-2 py-0.5 rounded">
                        {truncateWallet(w.walletAddress)}
                      </span>
                      <span className="text-[10px] sm:text-xs bg-red-900/30 text-red-400 border border-red-800 px-2 py-0.5 rounded font-medium shrink-0">
                        {w.caseCount} {w.caseCount === 1 ? "case" : "cases"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      {formatCurrency(w.totalAmountLost, "INR")} <span className="text-muted-foreground font-normal text-xs">total lost</span>
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground break-words">
                      FIRs: {w.linkedFirs.join(", ")}
                    </p>
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