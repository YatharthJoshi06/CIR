import { useParams, useLocation } from "wouter";
import { Layout } from "@/component/layout";
import { useGetCase, useUpdateCase, useAddNote } from "@workspace/api-client-react";
import { Button } from "@/component/ui/button";
import { Textarea } from "@/component/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { formatCurrency, truncateWallet, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowLeft, AlertTriangle, Link2 } from "lucide-react";

function riskBadgeClass(r: string) {
  return { low: "bg-green-900/30 text-green-400 border-green-800", medium: "bg-yellow-900/30 text-yellow-400 border-yellow-800", high: "bg-orange-900/30 text-orange-400 border-orange-800", critical: "bg-red-900/30 text-red-400 border-red-800" }[r] ?? "bg-muted text-muted-foreground border-border";
}
function statusBadgeClass(s: string) {
  return { open: "bg-blue-900/30 text-blue-400 border-blue-800", under_investigation: "bg-yellow-900/30 text-yellow-400 border-yellow-800", closed: "bg-gray-800 text-gray-400 border-gray-700", referred: "bg-purple-900/30 text-purple-400 border-purple-800" }[s] ?? "";
}
const statusLabel = (s: string) => ({ open: "Open", under_investigation: "Under Investigation", closed: "Closed", referred: "Referred" }[s] ?? s);
const riskLabel = (r: string) => ({ low: "Low", medium: "Medium", high: "High", critical: "Critical" }[r] ?? r);

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-foreground font-medium">{value ?? "—"}</p>
    </div>
  );
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useGetCase(Number(id));
  const updateCase = useUpdateCase(Number(id));
  const addNote = useAddNote(Number(id));

  if (isLoading) return <Layout><div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-card rounded-lg" />)}</div></Layout>;
  if (!data) return <Layout><div className="text-muted-foreground text-center py-12">Case not found</div></Layout>;

  const { case: c, matches } = data;

  const handleStatusUpdate = () => {
    if (!status) return;
    updateCase.mutate({ status }, {
      onSuccess: () => toast({ title: "Status Updated", description: `Case status changed to ${statusLabel(status)}` }),
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update status" }),
    });
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addNote.mutate({ content: note }, {
      onSuccess: () => { toast({ title: "Note Added" }); setNote(""); },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to add note" }),
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/cases")}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground font-mono">{c.firNo}</h1>
            <p className="text-muted-foreground text-sm">{c.policeStation} · {formatDate(c.createdAt)}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded border font-medium ${statusBadgeClass(c.status)}`}>{statusLabel(c.status)}</span>
          <span className={`text-xs px-3 py-1 rounded border font-medium ${riskBadgeClass(c.riskLevel)}`}>{riskLabel(c.riskLevel)}</span>
        </div>

        {matches.totalLinkedCases > 0 && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">⚠ {matches.totalLinkedCases} Linked Case(s) Found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Wallet matches: {matches.walletMatches.length} · Telegram: {matches.telegramMatches.length} · Mobile: {matches.mobileMatches.length} · Website: {matches.websiteMatches.length}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Case Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Victim" value={c.victimName} />
              <Field label="Contact" value={c.victimContact} />
              <Field label="Email" value={c.victimEmail} />
              <Field label="Date" value={c.date} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Crypto Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Crypto Type" value={c.cryptoType} />
              <Field label="Amount Lost" value={formatCurrency(c.amountLost, "INR")} />
              <Field label="Exchange" value={c.exchangeName} />
              <Field label="Network" value={c.blockchainNetwork} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Wallet Address</p>
              <p className="text-sm font-mono text-foreground break-all">{c.suspectedWalletAddress}</p>
            </div>
            {c.txHash && <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">TX Hash</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{c.txHash}</p>
            </div>}
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Suspect Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Mobile" value={c.suspectMobile} />
              <Field label="Telegram" value={c.telegramId} />
              <Field label="Social Media" value={c.socialMediaHandle} />
              <Field label="IP Address" value={c.ipAddress} />
              <Field label="Website" value={c.websiteUrl} />
              <Field label="Bank Details" value={c.bankDetails} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Update Status</h2>
            <div className="flex gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select new status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="referred">Referred</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStatusUpdate} disabled={!status || updateCase.isPending}>Update</Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Add Investigation Note</p>
              <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Enter note..." rows={3} />
              <Button size="sm" onClick={handleAddNote} disabled={!note.trim() || addNote.isPending}>Add Note</Button>
            </div>
          </div>
        </div>

        {matches.walletMatches.length > 0 && (
          <div className="bg-card border border-red-800 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-red-400 flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Linked Cases (Same Wallet)
            </h2>
            <div className="divide-y divide-border">
              {matches.walletMatches.map(m => (
                <div key={m.id} className="py-3 flex items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground w-28">{m.firNo}</span>
                  <span className="flex-1 text-sm text-foreground">{m.victimName}</span>
                  <span className="text-xs text-muted-foreground">{m.policeStation}</span>
                  <span className="text-sm font-medium">{formatCurrency(m.amountLost, "INR")}</span>
                  <Button variant="ghost" size="sm" onClick={() => setLocation(`/cases/${m.id}`)}>View</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}