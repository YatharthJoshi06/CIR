import { useParams, useLocation } from "wouter";
import { Layout } from "@/component/layout";
import { useGetCase, useUpdateCase, useAddNote } from "@workspace/api-client-react";
import { Button } from "@/component/ui/button";
import { Textarea } from "@/component/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { formatCurrency, truncateWallet, formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowLeft, AlertTriangle, Link2, Calendar } from "lucide-react";

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
const statusLabel = (s: string) => ({ open: "Open", under_investigation: "Under Investigation", closed: "Closed", referred: "Referred" }[s] ?? s);
const riskLabel = (r: string) => ({ low: "Low", medium: "Medium", high: "High", critical: "Critical" }[r] ?? r);

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-xs sm:text-sm text-foreground font-medium break-words">{value ?? "—"}</p>
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

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-lg" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-muted-foreground text-center py-12 text-sm sm:text-base">Case not found</div>
      </Layout>
    );
  }

  const { case: c, matches } = data;

  const handleStatusUpdate = () => {
    if (!status) return;
    updateCase.mutate(
      { status },
      {
        onSuccess: () => toast({ title: "Status Updated", description: `Case status changed to ${statusLabel(status)}` }),
        onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update status" }),
      }
    );
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    addNote.mutate(
      { content: note },
      {
        onSuccess: () => {
          toast({ title: "Note Added" });
          setNote("");
        },
        onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to add note" }),
      }
    );
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with FIR details & badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="flex items-start sm:items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 mt-0.5 sm:mt-0"
              onClick={() => setLocation("/cases")}
              aria-label="Back to cases"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground font-mono truncate">{c.firNo}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                {c.policeStation} · {formatDate(c.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-11 sm:pl-0">
            <span className={`text-xs px-2.5 py-1 rounded border font-medium ${statusBadgeClass(c.status)}`}>
              {statusLabel(c.status)}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded border font-medium ${riskBadgeClass(c.riskLevel)}`}>
              {riskLabel(c.riskLevel)}
            </span>
          </div>
        </div>

        {/* Intelligence Cross-Match Warning */}
        {matches.totalLinkedCases > 0 && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3.5 sm:p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-red-400">
                ⚠ {matches.totalLinkedCases} Linked Case(s) Detected
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Wallet matches: {matches.walletMatches.length} · Telegram: {matches.telegramMatches.length} · Mobile: {matches.mobileMatches.length} · Website: {matches.websiteMatches.length}
              </p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-3.5 sm:space-y-4">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">Case Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Victim" value={c.victimName} />
              <Field label="Contact" value={c.victimContact} />
              <Field label="Email" value={c.victimEmail} />
              <Field label="Date" value={c.date} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-3.5 sm:space-y-4">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">Crypto Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Crypto Type" value={c.cryptoType} />
              <Field label="Amount Lost" value={formatCurrency(c.amountLost, "INR")} />
              <Field label="Exchange" value={c.exchangeName} />
              <Field label="Network" value={c.blockchainNetwork} />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Wallet Address</p>
              <p className="text-xs sm:text-sm font-mono text-foreground break-all bg-muted/30 p-2 rounded">{c.suspectedWalletAddress}</p>
            </div>
            {c.txHash && (
              <div>
                <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-0.5">TX Hash</p>
                <p className="text-[11px] sm:text-xs font-mono text-muted-foreground break-all bg-muted/20 p-2 rounded">{c.txHash}</p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-3.5 sm:space-y-4">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">Suspect Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Mobile" value={c.suspectMobile} />
              <Field label="Telegram" value={c.telegramId} />
              <Field label="Social Media" value={c.socialMediaHandle} />
              <Field label="IP Address" value={c.ipAddress} />
              <Field label="Website" value={c.websiteUrl} />
              <Field label="Bank Details" value={c.bankDetails} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-3.5 sm:space-y-4">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">Update Status & Notes</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="flex-1 h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="referred">Referred</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={!status || updateCase.isPending}
                className="h-9 w-full sm:w-auto text-xs sm:text-sm"
              >
                Update
              </Button>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide">Add Investigation Note</p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter investigation update or lead..."
                rows={3}
                className="text-xs sm:text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!note.trim() || addNote.isPending}
                className="w-full sm:w-auto h-8 text-xs"
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>

        {/* Linked Cases cross match list */}
        {matches.walletMatches.length > 0 && (
          <div className="bg-card border border-red-800 rounded-lg p-4 sm:p-5 space-y-3">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-red-400 flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Linked Cases (Same Wallet Detected)
            </h2>
            <div className="divide-y divide-border">
              {matches.walletMatches.map((m) => (
                <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-primary">{m.firNo}</span>
                    <span className="text-xs sm:text-sm text-foreground">{m.victimName}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">· {m.policeStation}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-0">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {formatCurrency(m.amountLost, "INR")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setLocation(`/cases/${m.id}`)}
                    >
                      View Case
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}