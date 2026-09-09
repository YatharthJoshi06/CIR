import { Router, type IRouter } from "express";
import { db, casesTable, investigationNotesTable } from "@workspace/db";
import { eq, ilike, and, or } from "drizzle-orm";
import { findMatches, computeRiskLevel, createMatchAlerts } from "../lib/matching.js";

const router: IRouter = Router();

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

// GET /cases
router.get("/cases", async (req, res): Promise<void> => {
  const { status, search, riskLevel } = req.query as Record<string, string>;
  const conditions = [];

  if (status) conditions.push(eq(casesTable.status, status));
  if (riskLevel) conditions.push(eq(casesTable.riskLevel, riskLevel));
  if (search) {
    conditions.push(or(
      ilike(casesTable.firNo, `%${search}%`),
      ilike(casesTable.victimName, `%${search}%`),
      ilike(casesTable.suspectedWalletAddress, `%${search}%`),
      ilike(casesTable.policeStation, `%${search}%`)
    ));
  }

  const cases = await db
    .select()
    .from(casesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(casesTable.createdAt);

  res.json(cases.map(formatCase));
});

// POST /cases
router.post("/cases", async (req, res): Promise<void> => {
  const data = req.body;

  if (!data.firNo || !data.policeStation || !data.date || !data.victimName ||
      !data.suspectedWalletAddress || !data.cryptoType || !data.amountLost) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [newCase] = await db.insert(casesTable).values({
    firNo: data.firNo,
    policeStation: data.policeStation,
    date: data.date,
    victimName: data.victimName,
    victimContact: data.victimContact ?? null,
    victimEmail: data.victimEmail ?? null,
    suspectedWalletAddress: data.suspectedWalletAddress,
    txHash: data.txHash ?? null,
    cryptoType: data.cryptoType,
    amountLost: String(data.amountLost),
    exchangeName: data.exchangeName ?? null,
    telegramId: data.telegramId ?? null,
    websiteUrl: data.websiteUrl ?? null,
    suspectMobile: data.suspectMobile ?? null,
    socialMediaHandle: data.socialMediaHandle ?? null,
    ipAddress: data.ipAddress ?? null,
    bankDetails: data.bankDetails ?? null,
    blockchainNetwork: data.blockchainNetwork ?? null,
    screenshotsCollected: data.screenshotsCollected ?? false,
    evidenceAttached: data.evidenceAttached ?? false,
    remarks: data.remarks ?? null,
    status: "open",
    riskLevel: "low",
    linkedCaseCount: 0,
  }).returning();

  const matches = await findMatches(newCase);
  const riskLevel = computeRiskLevel(matches.totalLinkedCases);

  const [updatedCase] = await db
    .update(casesTable)
    .set({ riskLevel, linkedCaseCount: matches.totalLinkedCases })
    .where(eq(casesTable.id, newCase.id))
    .returning();

  await createMatchAlerts(updatedCase, matches);

  res.status(201).json({
    case: formatCase(updatedCase),
    matches: {
      walletMatches: matches.walletMatches.map(formatCase),
      telegramMatches: matches.telegramMatches.map(formatCase),
      mobileMatches: matches.mobileMatches.map(formatCase),
      websiteMatches: matches.websiteMatches.map(formatCase),
      totalLinkedCases: matches.totalLinkedCases,
    },
  });
});

// GET /cases/:id
router.get("/cases/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [c] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!c) { res.status(404).json({ error: "Case not found" }); return; }

  const matches = await findMatches(c);
  res.json({
    case: formatCase(c),
    matches: {
      walletMatches: matches.walletMatches.map(formatCase),
      telegramMatches: matches.telegramMatches.map(formatCase),
      mobileMatches: matches.mobileMatches.map(formatCase),
      websiteMatches: matches.websiteMatches.map(formatCase),
      totalLinkedCases: matches.totalLinkedCases,
    },
  });
});

// PATCH /cases/:id
router.patch("/cases/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const updates: Record<string, unknown> = {};
  if (req.body.status != null) updates.status = req.body.status;
  if (req.body.riskLevel != null) updates.riskLevel = req.body.riskLevel;
  if (req.body.remarks != null) updates.remarks = req.body.remarks;

  const [updated] = await db
    .update(casesTable)
    .set(updates)
    .where(eq(casesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Case not found" }); return; }
  res.json(formatCase(updated));
});

// POST /cases/:id/notes
router.post("/cases/:id/notes", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  if (!req.body.content) { res.status(400).json({ error: "Content is required" }); return; }

  const [note] = await db.insert(investigationNotesTable).values({
    caseId: id,
    content: req.body.content,
    noteType: req.body.noteType ?? null,
  }).returning();

  res.status(201).json({
    id: note.id,
    caseId: note.caseId,
    content: note.content,
    noteType: note.noteType,
    officerId: note.officerId,
    createdAt: note.createdAt.toISOString(),
  });
});

// GET /cases/:id/matches
router.get("/cases/:id/matches", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [c] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!c) { res.status(404).json({ error: "Case not found" }); return; }

  const matches = await findMatches(c);
  res.json({
    walletMatches: matches.walletMatches.map(formatCase),
    telegramMatches: matches.telegramMatches.map(formatCase),
    mobileMatches: matches.mobileMatches.map(formatCase),
    websiteMatches: matches.websiteMatches.map(formatCase),
    totalLinkedCases: matches.totalLinkedCases,
  });
});

export default router;