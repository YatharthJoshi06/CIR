// import { Router, type IRouter } from "express";
// import { db, officersTable } from "@workspace/db";
// import { eq } from "drizzle-orm";

// const router: IRouter = Router();
// const sessions = new Map<string, number>();

// function generateSessionId(): string {
//   return Math.random().toString(36).slice(2) + Date.now().toString(36);
// }

// router.post("/auth/login", async (req, res): Promise<void> => {
//   const { userId, password } = req.body ?? {};

//   if (!userId || !password) {
//     res.status(400).json({ error: "userId and password are required" });
//     return;
//   }

//   const [officer] = await db
//     .select()
//     .from(officersTable)
//     .where(eq(officersTable.userId, userId));

//   if (!officer || officer.passwordHash !== password) {
//     res.status(401).json({ error: "Invalid credentials" });
//     return;
//   }

//   const sessionId = generateSessionId();
//   sessions.set(sessionId, officer.id);

//   res.cookie("session_id", sessionId, {
//     httpOnly: true,
//     sameSite: "lax",
//     maxAge: 8 * 60 * 60 * 1000,
//   });

//   res.json({
//     officer: {
//       id: officer.id,
//       userId: officer.userId,
//       name: officer.name,
//       designation: officer.designation,
//       badgeNo: officer.badgeNo,
//       policeStation: officer.policeStation,
//     },
//   });
// });

// router.post("/auth/logout", (req, res): void => {
//   const sessionId = req.cookies?.session_id;
//   if (sessionId) sessions.delete(sessionId);
//   res.clearCookie("session_id");
//   res.json({ message: "Logged out successfully" });
// });

// router.get("/auth/me", async (req, res): Promise<void> => {
//   const sessionId = req.cookies?.session_id;
//   if (!sessionId) { res.status(401).json({ error: "Not authenticated" }); return; }

//   const officerId = sessions.get(sessionId);
//   if (!officerId) { res.status(401).json({ error: "Session expired" }); return; }

//   const [officer] = await db
//     .select()
//     .from(officersTable)
//     .where(eq(officersTable.id, officerId));

//   if (!officer) { res.status(401).json({ error: "Officer not found" }); return; }

//   res.json({
//     id: officer.id,
//     userId: officer.userId,
//     name: officer.name,
//     designation: officer.designation,
//     badgeNo: officer.badgeNo,
//     policeStation: officer.policeStation,
//   });
// });

// export { sessions };
// export default router;