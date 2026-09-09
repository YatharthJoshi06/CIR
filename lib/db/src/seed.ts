import { db, officersTable } from "./index.js";

async function seed() {
  await db.insert(officersTable).values([
    { userId: "yatharth", passwordHash: "yatharth123", name: "Admin Officer", designation: "Admin", badgeNo: "ADM001", policeStation: "Cyber Crime HQ" },
    { userId: "officer001", passwordHash: "Pass@1234", name: "Rajesh Kumar", designation: "Inspector", badgeNo: "INS001", policeStation: "Cyber Crime Cell Delhi" },
    { userId: "officer002", passwordHash: "Pass@1234", name: "Priya Sharma", designation: "Sub-Inspector", badgeNo: "SI002", policeStation: "Cyber Crime Cell Mumbai" },
  ]).onConflictDoNothing();
  console.log("Seeded successfully");
  process.exit(0);
}

seed().catch(console.error);