import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/component/layout";
import { useCreateCase } from "@workspace/api-client-react";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Textarea } from "@/component/ui/textarea";
import { Switch } from "@/component/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/component/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  firNo: z.string().min(1, "FIR number is required"),
  policeStation: z.string().min(1, "Police station is required"),
  date: z.string().min(1, "Date is required"),
  victimName: z.string().min(1, "Victim name is required"),
  victimContact: z.string().optional(),
  victimEmail: z.string().email().optional().or(z.literal("")),
  suspectedWalletAddress: z.string().min(1, "Wallet address is required"),
  txHash: z.string().optional(),
  cryptoType: z.string().min(1, "Crypto type is required"),
  amountLost: z.coerce.number().positive("Amount must be positive"),
  exchangeName: z.string().optional(),
  telegramId: z.string().optional(),
  websiteUrl: z.string().optional(),
  suspectMobile: z.string().optional(),
  socialMediaHandle: z.string().optional(),
  ipAddress: z.string().optional(),
  bankDetails: z.string().optional(),
  blockchainNetwork: z.string().optional(),
  screenshotsCollected: z.boolean().default(false),
  evidenceAttached: z.boolean().default(false),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-sm">
      <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">{children}</div>
    </div>
  );
}

export default function CasesNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCase = useCreateCase();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { screenshotsCollected: false, evidenceAttached: false },
  });

  const onSubmit = (data: FormData) => {
    createCase.mutate(data as Record<string, unknown>, {
      onSuccess: (result) => {
        toast({
          title: "Case Registered",
          description: `FIR ${result.case.firNo} created. ${result.matches.totalLinkedCases} linked case(s) found.`,
        });
        setLocation(`/cases/${result.case.id}`);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to register case." });
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
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
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Register New Case</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              All linked wallets and identifiers will be automatically cross-matched
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <Section title="Case Information">
              <FormField
                control={form.control}
                name="firNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">FIR Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="FIR/2024/001" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Date *</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="policeStation"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs sm:text-sm">Police Station *</FormLabel>
                    <FormControl>
                      <Input placeholder="Cyber Crime Cell, Delhi" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <Section title="Victim Information">
              <FormField
                control={form.control}
                name="victimName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Victim Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="victimContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9999999999" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="victimEmail"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="victim@email.com" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <Section title="Crypto Details">
              <FormField
                control={form.control}
                name="suspectedWalletAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs sm:text-sm">Suspected Wallet Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." className="font-mono h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cryptoType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Crypto Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select crypto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Bitcoin", "Ethereum", "USDT", "BNB", "Solana", "Other"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountLost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Amount Lost (INR) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="txHash"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs sm:text-sm">Transaction Hash</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." className="font-mono h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="blockchainNetwork"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Blockchain Network</FormLabel>
                    <FormControl>
                      <Input placeholder="Ethereum Mainnet" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exchangeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Exchange Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Binance, WazirX..." className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <Section title="Suspect Information">
              <FormField
                control={form.control}
                name="suspectMobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Suspect Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9999999999" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telegramId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Telegram ID</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialMediaHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Social Media Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="@handle" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">IP Address</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.x.x" className="font-mono h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Bank Details</FormLabel>
                    <FormControl>
                      <Input placeholder="Bank name, account number" className="h-9 text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-4 shadow-sm">
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">Evidence & Remarks</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <FormField
                  control={form.control}
                  name="screenshotsCollected"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 text-xs sm:text-sm cursor-pointer">Screenshots Collected</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="evidenceAttached"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 text-xs sm:text-sm cursor-pointer">Evidence Attached</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." rows={3} className="text-xs sm:text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/cases")}
                className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCase.isPending}
                className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm font-medium"
              >
                {createCase.isPending ? "Registering Case..." : "Register Case"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}