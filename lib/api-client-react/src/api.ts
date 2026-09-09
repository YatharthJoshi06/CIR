import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch.js";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Officer {
  id: number;
  userId: string;
  name: string;
  designation: string;
  badgeNo: string;
  policeStation: string;
}

export interface Case {
  id: number;
  firNo: string;
  policeStation: string;
  date: string;
  victimName: string;
  victimContact: string | null;
  victimEmail: string | null;
  suspectedWalletAddress: string;
  txHash: string | null;
  cryptoType: string;
  amountLost: number;
  exchangeName: string | null;
  telegramId: string | null;
  websiteUrl: string | null;
  suspectMobile: string | null;
  socialMediaHandle: string | null;
  ipAddress: string | null;
  bankDetails: string | null;
  blockchainNetwork: string | null;
  screenshotsCollected: boolean;
  evidenceAttached: boolean;
  remarks: string | null;
  investigatingOfficerId: number | null;
  status: string;
  riskLevel: string;
  linkedCaseCount: number;
  createdAt: string;
}

export interface InvestigationNote {
  id: number;
  caseId: number;
  content: string;
  noteType: string | null;
  officerId: number | null;
  createdAt: string;
}

export interface Alert {
  id: number;
  type: string;
  message: string;
  severity: string;
  caseId: number;
  firNo: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCases: number;
  totalWallets: number;
  highRiskWallets: number;
  openCases: number;
  closedCases: number;
  totalAmountLost: number;
  casesThisMonth: number;
  alertsCount: number;
}

export interface Matches {
  walletMatches: Case[];
  telegramMatches: Case[];
  mobileMatches: Case[];
  websiteMatches: Case[];
  totalLinkedCases: number;
}

// ── Query Keys ─────────────────────────────────────────────────────────────
export const getGetMeQueryKey = () => ["/auth/me"] as const;
export const getListCasesQueryKey = (params?: Record<string, string>) =>
  ["/cases", params] as const;
export const getGetCaseQueryKey = (id: number) => ["/cases", id] as const;
export const getGetDashboardStatsQueryKey = () => ["/dashboard/stats"] as const;
export const getGetRecentCasesQueryKey = () => ["/dashboard/recent-cases"] as const;
export const getGetAlertsQueryKey = () => ["/dashboard/alerts"] as const;
export const getGetHighRiskWalletsQueryKey = () => ["/dashboard/high-risk-wallets"] as const;

// ── Auth Hooks ─────────────────────────────────────────────────────────────
export function useGetMe(
  _?: undefined,
  options?: { query?: { enabled?: boolean; queryKey?: readonly unknown[]; retry?: boolean } }
) {
  return useQuery<Officer | null>({
    queryKey: options?.query?.queryKey ?? getGetMeQueryKey(),
    queryFn: () => customFetch<Officer>("/auth/me").catch(() => null),
    enabled: options?.query?.enabled ?? true,
    retry: options?.query?.retry ?? false,
  });
}

export function useLogin() {
  return useMutation<Officer, Error, { userId: string; password: string }>({
    mutationFn: (body) => customFetch<{ officer: Officer }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }).then(r => r.officer),
  });
}

export function useLogout() {
  return useMutation<void, Error, undefined>({
    mutationFn: () => customFetch<void>("/auth/logout", { method: "POST" }),
  });
}

// ── Cases Hooks ────────────────────────────────────────────────────────────
export function useListCases(params?: { status?: string; riskLevel?: string; search?: string }) {
  const query = params ? Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ) as Record<string, string> : undefined;
  const qs = query && Object.keys(query).length > 0
    ? "?" + new URLSearchParams(query).toString() : "";
  return useQuery<Case[]>({
    queryKey: getListCasesQueryKey(query),
    queryFn: () => customFetch<Case[]>(`/cases${qs}`),
  });
}

export function useGetCase(id: number) {
  return useQuery<{ case: Case; matches: Matches }>({
    queryKey: getGetCaseQueryKey(id),
    queryFn: () => customFetch<{ case: Case; matches: Matches }>(`/cases/${id}`),
    enabled: !!id,
  });
}

export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation<{ case: Case; matches: Matches }, Error, Record<string, unknown>>({
    mutationFn: (body) => customFetch<{ case: Case; matches: Matches }>("/cases", {
      method: "POST",
      body: JSON.stringify(body),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/cases"] }); },
  });
}

export function useUpdateCase(id: number) {
  const qc = useQueryClient();
  return useMutation<Case, Error, { status?: string; riskLevel?: string; remarks?: string }>({
    mutationFn: (body) => customFetch<Case>(`/cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/cases"] });
      qc.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
    },
  });
}

export function useAddNote(caseId: number) {
  const qc = useQueryClient();
  return useMutation<InvestigationNote, Error, { content: string; noteType?: string }>({
    mutationFn: (body) => customFetch<InvestigationNote>(`/cases/${caseId}/notes`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) }); },
  });
}

// ── Dashboard Hooks ────────────────────────────────────────────────────────
export function useGetDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: getGetDashboardStatsQueryKey(),
    queryFn: () => customFetch<DashboardStats>("/dashboard/stats"),
  });
}

export function useGetRecentCases() {
  return useQuery<Case[]>({
    queryKey: getGetRecentCasesQueryKey(),
    queryFn: () => customFetch<Case[]>("/dashboard/recent-cases"),
  });
}

export function useGetAlerts() {
  return useQuery<Alert[]>({
    queryKey: getGetAlertsQueryKey(),
    queryFn: () => customFetch<Alert[]>("/dashboard/alerts"),
  });
}

export function useGetHighRiskWallets() {
  return useQuery<{
    walletAddress: string;
    caseCount: number;
    totalAmountLost: number;
    linkedFirs: string[];
    affectedStations: string[];
  }[]>({
    queryKey: getGetHighRiskWalletsQueryKey(),
    queryFn: () => customFetch("/dashboard/high-risk-wallets"),
  });
}