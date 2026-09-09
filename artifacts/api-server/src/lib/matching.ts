import { db, casesTable, alertsTable } from "@workspace/db";
import { eq, ne, and, or } from "drizzle-orm";
import type { Case } from "@workspace/db";

export async function findMatches(newCase: Case, excludeId?: number) {
  const conditions = [];

  if (newCase.suspectedWalletAddress)
    conditions.push(eq(casesTable.suspectedWalletAddress, newCase.suspectedWalletAddress));
  if (newCase.telegramId)
    conditions.push(eq(casesTable.telegramId, newCase.telegramId));
  if (newCase.suspectMobile)
    conditions.push(eq(casesTable.suspectMobile, newCase.suspectMobile));
  if (newCase.websiteUrl)
    conditions.push(eq(casesTable.websiteUrl, newCase.websiteUrl));

  if (conditions.length === 0)
    return { walletMatches: [], telegramMatches: [], mobileMatches: [], websiteMatches: [], totalLinkedCases: 0 };

  const allRelated = await db
    .select()
    .from(casesTable)
    .where(and(ne(casesTable.id, excludeId ?? newCase.id), or(...conditions)));

  const walletMatches  = allRelated.filter(c => newCase.suspectedWalletAddress && c.suspectedWalletAddress === newCase.suspectedWalletAddress);
  const telegramMatches = allRelated.filter(c => newCase.telegramId && c.telegramId === newCase.telegramId);
  const mobileMatches  = allRelated.filter(c => newCase.suspectMobile && c.suspectMobile === newCase.suspectMobile);
  const websiteMatches  = allRelated.filter(c => newCase.websiteUrl && c.websiteUrl === newCase.websiteUrl);
  const uniqueIds = new Set(allRelated.map(c => c.id));

  return { walletMatches, telegramMatches, mobileMatches, websiteMatches, totalLinkedCases: uniqueIds.size };
}

export function computeRiskLevel(linkedCount: number): string {
  if (linkedCount >= 5) return "critical";
  if (linkedCount >= 3) return "high";
  if (linkedCount >= 1) return "medium";
  return "low";
}

export async function createMatchAlerts(
  newCase: Case,
  matches: Awaited<ReturnType<typeof findMatches>>
) {
  const alerts = [];

  if (matches.walletMatches.length > 0)
    alerts.push({
      type: "wallet_match",
      message: `Wallet ${newCase.suspectedWalletAddress.slice(0, 8)}... linked to ${matches.walletMatches.length} other case(s). FIR: ${newCase.firNo}`,
      severity: matches.walletMatches.length >= 3 ? "critical" : "warning",
      caseId: newCase.id,
      firNo: newCase.firNo,
      isRead: false,
    });

  if (matches.telegramMatches.length > 0)
    alerts.push({
      type: "telegram_match",
      message: `Telegram ID "${newCase.telegramId}" appears in ${matches.telegramMatches.length} other case(s). FIR: ${newCase.firNo}`,
      severity: "warning",
      caseId: newCase.id,
      firNo: newCase.firNo,
      isRead: false,
    });

  if (matches.mobileMatches.length > 0)
    alerts.push({
      type: "mobile_match",
      message: `Suspect mobile ${newCase.suspectMobile} found in ${matches.mobileMatches.length} other case(s). FIR: ${newCase.firNo}`,
      severity: "warning",
      caseId: newCase.id,
      firNo: newCase.firNo,
      isRead: false,
    });

  if (matches.websiteMatches.length > 0)
    alerts.push({
      type: "website_match",
      message: `Website ${newCase.websiteUrl} linked to ${matches.websiteMatches.length} other case(s). FIR: ${newCase.firNo}`,
      severity: "warning",
      caseId: newCase.id,
      firNo: newCase.firNo,
      isRead: false,
    });

  if (alerts.length > 0) await db.insert(alertsTable).values(alerts);
}