import { Router, type Request, type Response } from "express";
import { db, casesTable, alertsTable } from "@workspace/db";
import { count, desc, eq, sql, sum } from "drizzle-orm";

const router = Router();

function formatCase(c: typeof casesTable.$inferSelect) {
  return {
    id: c.id,
    firNo: c.firNo,
    policeStation: c.policeStation,
    date: c.date,
    victimName: c.victimName,
    victimContact: c.victimContact ?? null,
    victimEmail: c.victimEmail ?? null,
    suspectedWalletAddress: c.suspectedWalletAddress,
    txHash: c.txHash ?? null,
    cryptoType: c.cryptoType,
    amountLost: parseFloat(String(c.amountLost)),
    exchangeName: c.exchangeName ?? null,
    telegramId: c.telegramId ?? null,
    websiteUrl: c.websiteUrl ?? null,
    suspectMobile: c.suspectMobile ?? null,
    socialMediaHandle: c.socialMediaHandle ?? null,
    ipAddress: c.ipAddress ?? null,
    bankDetails: c.bankDetails ?? null,
    blockchainNetwork: c.blockchainNetwork ?? null,
    screenshotsCollected: c.screenshotsCollected,
    evidenceAttached: c.evidenceAttached,
    remarks: c.remarks ?? null,
    investigatingOfficerId: c.investigatingOfficerId ?? null,
    status: c.status,
    riskLevel: c.riskLevel,
    linkedCaseCount: c.linkedCaseCount,
    createdAt: c.createdAt.toISOString(),
  };
}

// GET /dashboard/stats
router.get("/dashboard/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalCasesRow] = await db
      .select({ count: count() })
      .from(casesTable);

    const [openCasesRow] = await db
      .select({ count: count() })
      .from(casesTable)
      .where(eq(casesTable.status, "open"));

    const [closedCasesRow] = await db
      .select({ count: count() })
      .from(casesTable)
      .where(eq(casesTable.status, "closed"));

    const [amountRow] = await db
      .select({
        total: sum(casesTable.amountLost),
      })
      .from(casesTable);

    const [alertsRow] = await db
      .select({ count: count() })
      .from(alertsTable);

    const walletRows = await db
      .selectDistinct({
        wallet: casesTable.suspectedWalletAddress,
      })
      .from(casesTable);

    const highRiskRows = await db
      .select({
        wallet: casesTable.suspectedWalletAddress,
        count: count(),
      })
      .from(casesTable)
      .groupBy(casesTable.suspectedWalletAddress)
      .having(sql`count(*) > 1`);

    const [thisMonthRow] = await db
      .select({
        count: count(),
      })
      .from(casesTable)
      .where(
        sql`date_trunc('month', ${casesTable.createdAt}) = date_trunc('month', now())`
      );

    res.json({
      totalCases: Number(totalCasesRow?.count ?? 0),
      openCases: Number(openCasesRow?.count ?? 0),
      closedCases: Number(closedCasesRow?.count ?? 0),
      totalAmountLost: Number(amountRow?.total ?? 0),
      totalWallets: walletRows.length,
      uniqueWallets: walletRows.length,
      highRiskWallets: highRiskRows.length,
      linkedWallets: highRiskRows.length,
      casesThisMonth: Number(thisMonthRow?.count ?? 0),
      thisMonthCases: Number(thisMonthRow?.count ?? 0),
      alertsCount: Number(alertsRow?.count ?? 0),
      totalAlerts: Number(alertsRow?.count ?? 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
    });
  }
});

// GET /dashboard/recent-cases
router.get("/dashboard/recent-cases", async (_req: Request, res: Response): Promise<void> => {
  try {
    const recentCases = await db
      .select()
      .from(casesTable)
      .orderBy(desc(casesTable.createdAt))
      .limit(5);

    res.json(recentCases.map(formatCase));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch recent cases",
    });
  }
});

// GET /dashboard/alerts
router.get("/dashboard/alerts", async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await db
      .select()
      .from(alertsTable)
      .orderBy(desc(alertsTable.createdAt))
      .limit(10);

    res.json(
      alerts.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        severity: a.severity,
        caseId: a.caseId,
        firNo: a.firNo,
        isRead: a.isRead,
        createdAt: a.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch alerts",
    });
  }
});

// GET /dashboard/high-risk-wallets
router.get("/dashboard/high-risk-wallets", async (_req: Request, res: Response): Promise<void> => {
  try {
    const allCases = await db.select().from(casesTable);
    const walletMap = new Map<string, {
      walletAddress: string;
      caseCount: number;
      totalAmountLost: number;
      linkedFirs: string[];
      affectedStations: string[];
    }>();

    for (const c of allCases) {
      const wallet = c.suspectedWalletAddress;
      if (!wallet) continue;
      const amount = parseFloat(String(c.amountLost)) || 0;
      const existing = walletMap.get(wallet);
      if (!existing) {
        walletMap.set(wallet, {
          walletAddress: wallet,
          caseCount: 1,
          totalAmountLost: amount,
          linkedFirs: [c.firNo],
          affectedStations: [c.policeStation],
        });
      } else {
        existing.caseCount += 1;
        existing.totalAmountLost += amount;
        if (!existing.linkedFirs.includes(c.firNo)) {
          existing.linkedFirs.push(c.firNo);
        }
        if (!existing.affectedStations.includes(c.policeStation)) {
          existing.affectedStations.push(c.policeStation);
        }
      }
    }

    const result = Array.from(walletMap.values())
      .filter((w) => w.caseCount > 1)
      .sort((a, b) => b.caseCount - a.caseCount || b.totalAmountLost - a.totalAmountLost);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch high-risk wallets",
    });
  }
});

export default router;