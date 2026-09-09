import { z } from "zod/v3";

export const HealthCheckResponse = z.object({ status: z.literal("ok") });

export const ListCasesQueryParams = z.object({
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  search: z.string().optional(),
});

export const CreateCaseBody = z.object({
  firNo: z.string().min(1),
  policeStation: z.string().min(1),
  date: z.string().min(1),
  victimName: z.string().min(1),
  victimContact: z.string().optional(),
  victimEmail: z.string().email().optional(),
  suspectedWalletAddress: z.string().min(1),
  txHash: z.string().optional(),
  cryptoType: z.string().min(1),
  amountLost: z.number().positive(),
  exchangeName: z.string().optional(),
  telegramId: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  suspectMobile: z.string().optional(),
  socialMediaHandle: z.string().optional(),
  ipAddress: z.string().optional(),
  bankDetails: z.string().optional(),
  blockchainNetwork: z.string().optional(),
  screenshotsCollected: z.boolean().optional(),
  evidenceAttached: z.boolean().optional(),
  remarks: z.string().optional(),
});

export const UpdateCaseBody = z.object({
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  remarks: z.string().optional(),
});

export const GetCaseParams = z.object({ id: z.coerce.number().int().positive() });
export const UpdateCaseParams = z.object({ id: z.coerce.number().int().positive() });
export const DeleteCaseParams = z.object({ id: z.coerce.number().int().positive() });
export const GetCaseMatchesParams = z.object({ id: z.coerce.number().int().positive() });
export const AddInvestigationNoteParams = z.object({ id: z.coerce.number().int().positive() });
export const AddInvestigationNoteBody = z.object({
  content: z.string().min(1),
  noteType: z.string().optional(),
});
export const ListInvestigationNotesParams = z.object({ id: z.coerce.number().int().positive() });