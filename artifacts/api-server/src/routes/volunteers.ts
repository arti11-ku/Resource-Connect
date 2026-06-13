import { Router, type IRouter } from "express";
import { db, volunteersTable, usersTable, insertVolunteerSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/volunteers", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: volunteersTable.id,
        userId: volunteersTable.userId,
        skills: volunteersTable.skills,
        availability: volunteersTable.availability,
        currentStatus: volunteersTable.currentStatus,
        location: volunteersTable.location,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
      })
      .from(volunteersTable)
      .leftJoin(usersTable, eq(volunteersTable.userId, usersTable.id));
    res.json({ success: true, volunteers: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/volunteers/:id", async (req, res) => {
  try {
    const [row] = await db
      .select({
        id: volunteersTable.id,
        userId: volunteersTable.userId,
        skills: volunteersTable.skills,
        availability: volunteersTable.availability,
        currentStatus: volunteersTable.currentStatus,
        location: volunteersTable.location,
        name: usersTable.name,
        email: usersTable.email,
      })
      .from(volunteersTable)
      .leftJoin(usersTable, eq(volunteersTable.userId, usersTable.id))
      .where(eq(volunteersTable.id, Number(req.params["id"])));
    if (!row) return res.status(404).json({ success: false, error: "Volunteer not found" });
    res.json({ success: true, volunteer: row });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.post("/volunteers", async (req, res) => {
  try {
    const parsed = insertVolunteerSchema.parse(req.body);
    const [volunteer] = await db.insert(volunteersTable).values(parsed).returning();
    res.json({ success: true, volunteer });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.patch("/volunteers/:id", async (req, res) => {
  try {
    const [volunteer] = await db.update(volunteersTable)
      .set({ ...req.body })
      .where(eq(volunteersTable.id, Number(req.params["id"])))
      .returning();
    if (!volunteer) return res.status(404).json({ success: false, error: "Volunteer not found" });
    res.json({ success: true, volunteer });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.delete("/volunteers/:id", async (req, res) => {
  try {
    await db.delete(volunteersTable).where(eq(volunteersTable.id, Number(req.params["id"])));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

export default router;
