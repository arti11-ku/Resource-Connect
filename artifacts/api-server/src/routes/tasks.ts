import { Router, type IRouter } from "express";
import { db, tasksTable, insertTaskSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/tasks", async (_req, res) => {
  try {
    const tasks = await db.select().from(tasksTable).orderBy(desc(tasksTable.createdAt));
    res.json({ success: true, tasks });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/tasks/:id", async (req, res) => {
  try {
    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, Number(req.params["id"])));
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    res.json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const parsed = insertTaskSchema.parse(req.body);
    const [task] = await db.insert(tasksTable).values(parsed).returning();
    res.json({ success: true, task });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const [task] = await db.update(tasksTable)
      .set({ ...req.body })
      .where(eq(tasksTable.id, Number(req.params["id"])))
      .returning();
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    res.json({ success: true, task });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    await db.delete(tasksTable).where(eq(tasksTable.id, Number(req.params["id"])));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

export default router;
