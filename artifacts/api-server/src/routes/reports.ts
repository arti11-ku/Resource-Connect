import { Router, type IRouter } from "express";
import { db, reportsTable, insertReportSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/reports", async (_req, res) => {
  try {
    const reports = await db.select().from(reportsTable).orderBy(desc(reportsTable.createdAt));
    res.json({ success: true, reports });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/reports/:id", async (req, res) => {
  try {
    const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, Number(req.params["id"])));
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });
    res.json({ success: true, report });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/reports/by-reporter/:reporterId", async (req, res) => {
  try {
    const reports = await db.select().from(reportsTable)
      .where(eq(reportsTable.reporterId, Number(req.params["reporterId"])))
      .orderBy(desc(reportsTable.createdAt));
    res.json({ success: true, reports });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const parsed = insertReportSchema.parse(req.body);
    const [report] = await db.insert(reportsTable).values(parsed).returning();
    res.json({ success: true, report });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.patch("/reports/:id", async (req, res) => {
  try {
    const [report] = await db.update(reportsTable)
      .set({ ...req.body })
      .where(eq(reportsTable.id, Number(req.params["id"])))
      .returning();
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });
    res.json({ success: true, report });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.delete("/reports/:id", async (req, res) => {
  try {
    await db.delete(reportsTable).where(eq(reportsTable.id, Number(req.params["id"])));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

export default router;
