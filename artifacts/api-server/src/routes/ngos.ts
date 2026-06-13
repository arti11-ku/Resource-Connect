import { Router, type IRouter } from "express";
import { db, ngosTable, usersTable, insertNgoSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/ngos", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: ngosTable.id,
        userId: ngosTable.userId,
        ngoName: ngosTable.ngoName,
        registrationNumber: ngosTable.registrationNumber,
        contactDetails: ngosTable.contactDetails,
        address: ngosTable.address,
        status: ngosTable.status,
        createdAt: ngosTable.createdAt,
        ownerName: usersTable.name,
        ownerEmail: usersTable.email,
      })
      .from(ngosTable)
      .leftJoin(usersTable, eq(ngosTable.userId, usersTable.id))
      .orderBy(desc(ngosTable.createdAt));
    res.json({ success: true, ngos: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/ngos/:id", async (req, res) => {
  try {
    const [ngo] = await db.select().from(ngosTable).where(eq(ngosTable.id, Number(req.params["id"])));
    if (!ngo) return res.status(404).json({ success: false, error: "NGO not found" });
    res.json({ success: true, ngo });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.post("/ngos", async (req, res) => {
  try {
    const parsed = insertNgoSchema.parse(req.body);
    const [ngo] = await db.insert(ngosTable).values(parsed).returning();
    res.json({ success: true, ngo });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.patch("/ngos/:id", async (req, res) => {
  try {
    const [ngo] = await db.update(ngosTable)
      .set({ ...req.body })
      .where(eq(ngosTable.id, Number(req.params["id"])))
      .returning();
    if (!ngo) return res.status(404).json({ success: false, error: "NGO not found" });
    res.json({ success: true, ngo });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.delete("/ngos/:id", async (req, res) => {
  try {
    await db.delete(ngosTable).where(eq(ngosTable.id, Number(req.params["id"])));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

export default router;
