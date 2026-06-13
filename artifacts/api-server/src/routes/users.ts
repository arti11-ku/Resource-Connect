import { Router, type IRouter } from "express";
import { db, usersTable, insertUserSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/users", async (_req, res) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      phone: usersTable.phone,
      createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(usersTable.createdAt);
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const [user] = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      phone: usersTable.phone,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, Number(req.params["id"])));
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

router.post("/users", async (req, res) => {
  try {
    const parsed = insertUserSchema.parse(req.body);
    const [user] = await db.insert(usersTable).values(parsed).returning();
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const [user] = await db.update(usersTable)
      .set({ ...req.body })
      .where(eq(usersTable.id, Number(req.params["id"])))
      .returning();
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, error: String(e) });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, Number(req.params["id"])));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

export default router;
