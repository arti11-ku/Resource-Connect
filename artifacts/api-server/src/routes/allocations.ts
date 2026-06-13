import { Router, type IRouter } from "express";
import { db, aiAllocationsTable, insertAiAllocationSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/allocations", async (_req, res) => {
  try {
    const allocations = await db.select().from(aiAllocationsTable).orderBy(desc(aiAllocationsTable.createdAt));
    res.json({ success: true, allocations });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/allocations/:id", async (req, res) => {
  try {
    const [allocation] = await db.select().from(aiAllocationsTable)
      .where(eq(aiAllocationsTable.id, Number(req.params["id"])));
    if (!allocation) return res.status(404).json({ success: false, error: "Allocation not found" });
    res.json({ success: true, allocation });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/allocations/by-report/:reportId", async (req, res) => {
  try {
    const allocations = await db.select().from(aiAllocationsTable)
      .where(eq(aiAllocationsTable.reportId, Number(req.params["reportId"])))
      .orderBy(desc(aiAllocationsTable.createdAt));
    res.json({ success: true, allocations });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.post("/allocations", async (req, res) => {
  try {
    const parsed = insertAiAllocationSchema.parse(req.body);
    const [allocation] = await db.insert(aiAllocationsTable).values(parsed).returning();
    res.json({ success: true, allocation });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.patch("/allocations/:id/status", async (req, res) => {
  try {
    const { status } = req.body as { status: "Pending" | "Approved" | "Rejected" };
    const [allocation] = await db.update(aiAllocationsTable)
      .set({ status })
      .where(eq(aiAllocationsTable.id, Number(req.params["id"])))
      .returning();
    if (!allocation) return res.status(404).json({ success: false, error: "Allocation not found" });
    res.json({ success: true, allocation });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

export default router;
