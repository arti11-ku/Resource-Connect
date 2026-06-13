import { db, usersTable, ngosTable, volunteersTable, resourcesTable, tasksTable, reportsTable, donationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  const [u1] = await db.insert(usersTable).values({ name: "Arjun Sharma", email: "arjun@sahara.org", passwordHash: "hashed_pw_1", role: "Admin", phone: "+91 98765 00001" }).onConflictDoNothing().returning();
  const [u2] = await db.insert(usersTable).values({ name: "Priya Patel", email: "priya@asha.org", passwordHash: "hashed_pw_2", role: "NGO", phone: "+91 98765 00002" }).onConflictDoNothing().returning();
  const [u3] = await db.insert(usersTable).values({ name: "Ravi Kumar", email: "ravi@sahara.org", passwordHash: "hashed_pw_3", role: "Volunteer", phone: "+91 98765 00003" }).onConflictDoNothing().returning();
  const [u4] = await db.insert(usersTable).values({ name: "Meera Singh", email: "meera@sahara.org", passwordHash: "hashed_pw_4", role: "Volunteer", phone: "+91 98765 00004" }).onConflictDoNothing().returning();
  const [u5] = await db.insert(usersTable).values({ name: "Kavita Nair", email: "kavita@sahara.org", passwordHash: "hashed_pw_5", role: "Reporter", phone: "+91 98765 00005" }).onConflictDoNothing().returning();
  const [u6] = await db.insert(usersTable).values({ name: "Arun Mehta", email: "arun@heal.org", passwordHash: "hashed_pw_6", role: "NGO", phone: "+91 98765 00006" }).onConflictDoNothing().returning();
  const [u7] = await db.insert(usersTable).values({ name: "Divya Joshi", email: "divya@sahara.org", passwordHash: "hashed_pw_7", role: "Volunteer", phone: "+91 98765 00007" }).onConflictDoNothing().returning();
  const [u8] = await db.insert(usersTable).values({ name: "Suresh Iyer", email: "suresh@sahara.org", passwordHash: "hashed_pw_8", role: "Volunteer", phone: "+91 98765 00008" }).onConflictDoNothing().returning();

  console.log("✅ Users seeded");

  if (u2) {
    await db.insert(ngosTable).values({ userId: u2.id, ngoName: "Asha Foundation", registrationNumber: "NGO-2024-001", contactDetails: "asha@foundation.org", address: "Mumbai, Maharashtra", status: "approved" }).onConflictDoNothing();
  }
  if (u6) {
    await db.insert(ngosTable).values({ userId: u6.id, ngoName: "HealingHands", registrationNumber: "NGO-2024-002", contactDetails: "healing@hands.org", address: "Delhi, India", status: "pending" }).onConflictDoNothing();
  }
  await db.insert(ngosTable).values({ userId: u1?.id ?? 1, ngoName: "Vidya Shakti", registrationNumber: "NGO-2024-003", contactDetails: "vidya@shakti.org", address: "Pune, Maharashtra", status: "pending" }).onConflictDoNothing();

  console.log("✅ NGOs seeded");

  if (u3) {
    await db.insert(volunteersTable).values({ userId: u3.id, skills: ["First Aid", "Driving", "Counseling"], availability: "Weekends", currentStatus: "Available", location: "Mumbai, Maharashtra" }).onConflictDoNothing();
  }
  if (u4) {
    await db.insert(volunteersTable).values({ userId: u4.id, skills: ["Teaching", "First Aid"], availability: "Flexible", currentStatus: "Available", location: "Mumbai, Maharashtra" }).onConflictDoNothing();
  }
  if (u7) {
    await db.insert(volunteersTable).values({ userId: u7.id, skills: ["Medical", "Counseling"], availability: "Weekdays", currentStatus: "Assigned", location: "Delhi, India" }).onConflictDoNothing();
  }
  if (u8) {
    await db.insert(volunteersTable).values({ userId: u8.id, skills: ["Driving", "Logistics"], availability: "Weekends", currentStatus: "Available", location: "Pune, Maharashtra" }).onConflictDoNothing();
  }

  console.log("✅ Volunteers seeded");

  const ngoRes = await db.select().from(ngosTable);
  const ngo1 = ngoRes[0];
  const ngo2 = ngoRes[1];

  if (ngo1) {
    await db.insert(resourcesTable).values([
      { ngoId: ngo1.id, resourceName: "Food Packets", category: "Food", quantity: 500, unit: "packets", location: "Kurla Warehouse", status: "available" },
      { ngoId: ngo1.id, resourceName: "Water Bottles", category: "Water", quantity: 1000, unit: "bottles", location: "Kurla Warehouse", status: "available" },
      { ngoId: ngo1.id, resourceName: "Medical Kits", category: "Medical", quantity: 50, unit: "kits", location: "Dharavi Centre", status: "available" },
      { ngoId: ngo1.id, resourceName: "Blankets", category: "Shelter", quantity: 200, unit: "blankets", location: "Kurla Warehouse", status: "allocated" },
    ]).onConflictDoNothing();
  }
  if (ngo2) {
    await db.insert(resourcesTable).values([
      { ngoId: ngo2.id, resourceName: "Medicines", category: "Medical", quantity: 0, unit: "units", location: "Delhi Store", status: "depleted" },
      { ngoId: ngo2.id, resourceName: "Tents", category: "Shelter", quantity: 30, unit: "tents", location: "Delhi Store", status: "available" },
    ]).onConflictDoNothing();
  }

  console.log("✅ Resources seeded");

  if (u5) {
    const [r1] = await db.insert(reportsTable).values({ reporterId: u5.id, title: "Flood in Kurla East", description: "Severe flooding affecting 500 families. Roads blocked. Urgent food and medical aid needed.", category: "Flood", severity: "Critical", location: "Kurla East, Mumbai", status: "Approved" }).returning();
    const [r2] = await db.insert(reportsTable).values({ reporterId: u5.id, title: "Medical Emergency — Dharavi", description: "Outbreak of waterborne illness. 120 patients reported. Need medical kits and clean water.", category: "Medical", severity: "High", location: "Dharavi, Mumbai", status: "Under Review" }).returning();

    if (r1 && ngo1) {
      await db.insert(tasksTable).values([
        { reportId: r1.id, ngoId: ngo1.id, title: "Flood Relief Distribution", description: "Distribute food and water to flood-affected families in Kurla East.", status: "in-progress", priority: "high", assignedTo: "Ravi Kumar", deadline: "2026-06-20", category: "Disaster Relief", location: "Kurla East, Mumbai", skills: ["Driving", "Logistics"], points: 120 },
        { reportId: r1.id, ngoId: ngo1.id, title: "Medical Camp Setup", description: "Set up a medical camp for flood victims.", status: "assigned", priority: "high", assignedTo: "Meera Singh", deadline: "2026-06-18", category: "Healthcare", location: "Kurla East, Mumbai", skills: ["First Aid", "Medical"], points: 150 },
      ]);
    }
    if (r2 && ngo1) {
      await db.insert(tasksTable).values([
        { reportId: r2.id, ngoId: ngo1.id, title: "Water Distribution — Dharavi", description: "Distribute clean water bottles to affected households.", status: "pending", priority: "high", deadline: "2026-06-22", category: "Healthcare", location: "Dharavi, Mumbai", skills: ["Driving"], points: 90 },
      ]);
    }
  }

  await db.insert(tasksTable).values([
    { title: "Women's Skill Workshop", description: "Conduct vocational skill sessions for underprivileged women.", status: "assigned", priority: "medium", deadline: "2026-06-28", category: "Education", location: "Govandi, Mumbai", skills: ["Teaching"], points: 85 },
    { title: "Tree Plantation Drive", description: "City-wide plantation initiative at Sanjay Gandhi Park.", status: "pending", priority: "low", deadline: "2026-06-27", category: "Environment", location: "Sanjay Gandhi Park, Mumbai", skills: [], points: 60 },
    { title: "Blood Donation Camp", description: "Support blood donation drives across the city.", status: "pending", priority: "high", deadline: "2026-06-30", category: "Healthcare", location: "Dadar, Mumbai", skills: ["First Aid"], points: 110 },
  ]).onConflictDoNothing();

  console.log("✅ Reports & Tasks seeded");

  await db.insert(donationsTable).values([
    { donorName: "Rajesh Gupta", donorEmail: "rajesh@example.com", amount: 5000, purpose: "Flood Relief" },
    { donorName: "Sunita Kapoor", donorEmail: "sunita@example.com", amount: 2500, purpose: "Medical Aid" },
    { donorName: "Anonymous", donorEmail: "anon@example.com", amount: 1000, purpose: "General Fund" },
  ]).onConflictDoNothing();

  console.log("✅ Donations seeded");
  console.log("🎉 Database seeded successfully!");
  process.exit(0);
}

seed().catch(e => { console.error("Seed failed:", e); process.exit(1); });
