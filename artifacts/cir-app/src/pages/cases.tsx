import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/component/layout";
import { useListCases } from "@workspace/api-client-react";
import { Input } from "@/component/ui/input";
import { Button } from "@/component/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { formatCurrency, truncateWallet, formatDate } from "@/lib/format";
import { Search, Plus, ExternalLink } from "lucide-react";

function riskBadgeClass(r: string) {
  return { low: "bg-green-900/30 text-green-400 border-green-800", medium: "bg-yellow-900/30 text-yellow-400 border-yellow-800", high: "bg-orange-900/30 text-orange-400 border-orange-800", critical: "bg-red-900/30 text-red-400 border-red-800" }[r] ?? "bg-muted text-muted-foreground border-border";
}
function statusBadgeClass(s: string) {
  return { open: "bg-blue-900/30 text-blue-400 border-blue-800", under_investigation: "bg-yellow-900/30 text-yellow-400 border-yellow-800", closed: "bg-gray-800 text-gray-400 border-gray-700", referred: "bg-purple-900/30 text-purple-400 border-purple-800" }[s] ?? "bg-muted text-muted-foreground border-border";
}
const statusLabel = (s: string) => ({ open: "Open", under_investigation: "Under Investigation", closed: "Closed", referred: "Referred" }[s] ?? s);
const riskLabel = (r: string) => ({ low: "Low", medium: "Medium", high: "High", critical: "Critical" }[r] ?? r);

export default function Cases() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [riskLevel, setRiskLevel] = useState("");

  const { data: cases, isLoading } = useListCases({
    search: search || undefined,
    status: status || undefined,
    riskLevel: riskLevel || undefined,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Case Registry</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{cases?.length ?? 0} cases found</p>
          </div>
          <Link href="/cases/new">
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />New Case</Button>
          </Link>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search FIR, victim, wallet..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_investigation">Under Investigation</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="referred">Referred</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskLevel} onValueChange={setRiskLevel}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">FIR No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Victim</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wallet</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Crypto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="h-6 bg-muted rounded animate-pulse" /></td></tr>
                ))
              ) : cases?.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No cases found</td></tr>
              ) : cases?.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.firNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.victimName}</p>
                    <p className="text-xs text-muted-foreground">{c.policeStation}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{truncateWallet(c.suspectedWalletAddress)}</td>
                  <td className="px-4 py-3 text-xs">{c.cryptoType}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(c.amountLost, "INR")}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusBadgeClass(c.status)}`}>{statusLabel(c.status)}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border font-medium ${riskBadgeClass(c.riskLevel)}`}>{riskLabel(c.riskLevel)}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}