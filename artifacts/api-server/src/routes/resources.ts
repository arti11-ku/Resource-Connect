import { Router, type IRouter } from "express";
import { db, resourcesTable, insertResourceSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/resources", async (_req, res) => {
  try {
    const resources = await db.select().from(resourcesTable).orderBy(desc(resourcesTable.updatedAt));
    res.json({ success: true, resources });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/resources/:id", async (req, res) => {
  try {
    const [resource] = await db.select().from(resourcesTable).where(eq(resourcesTable.id, Number(req.params["id"])));
    if (!resource) return res.status(404).json({ success: false, error: "Resource not found" });
    res.json({ success: true, resource });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/resources/by-ngo/:ngoId", async (req, res) => {
  try {
    const resources = await db.select().from(resourcesTable)
      .where(eq(resourcesTable.ngoId, Number(req.params["ngoId"])));
    res.json({ success: true, resources });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.post("/resources", async (req, res) => {
  try {
    const parsed = insertResourceSchema.parse(req.body);
    const [resource] = await db.insert(resourcesTable).values(parsed).returning();
    res.json({ success: true, resource });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.patch("/resources/:id", async (req, res) => {
  try {
    const [resource] = await db.update(resourcesTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(resourcesTable.id, Number(req.params["id"])))
      .returning();
    if (!resource) return res.status(404).json({ success: false, error: "Resource not found" });
    res.json({ success: true, resource });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.delete("/resources/:id", async (req, res) => {
  try {
    await db.delete(resourcesTable).where(eq(resourcesTable.id, Number(req.params["id"])));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

export default router;
