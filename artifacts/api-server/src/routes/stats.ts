import { Router, type IRouter } from "express";
import { db, usersTable, ngosTable, volunteersTable, reportsTable, tasksTable, resourcesTable, aiAllocationsTable } from "@workspace/db";
import { count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [users, ngos, volunteers, reports, tasks, resources, allocations] = await Promise.all([
      db.select({ count: count() }).from(usersTable).then(r => r[0]),
      db.select({ count: count() }).from(ngosTable).then(r => r[0]),
      db.select({ count: count() }).from(volunteersTable).then(r => r[0]),
      db.select({ count: count() }).from(reportsTable).then(r => r[0]),
      db.select({ count: count() }).from(tasksTable).then(r => r[0]),
      db.select({ count: count() }).from(resourcesTable).then(r => r[0]),
      db.select({ count: count() }).from(aiAllocationsTable).then(r => r[0]),
    ]);

    const allocStats = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'Approved') as approved,
        COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'Pending') as pending
      FROM ai_allocations
    `);
    const row = (allocStats.rows?.[0] ?? {}) as Record<string, unknown>;

    res.json({
      success: true,
      stats: {
        totalUsers: Number(users?.count ?? 0),
        totalNgos: Number(ngos?.count ?? 0),
        totalVolunteers: Number(volunteers?.count ?? 0),
        totalReports: Number(reports?.count ?? 0),
        totalTasks: Number(tasks?.count ?? 0),
        totalResources: Number(resources?.count ?? 0),
        totalAllocations: Number(allocations?.count ?? 0),
        allocationsApproved: Number(row["approved"] ?? 0),
        allocationsRejected: Number(row["rejected"] ?? 0),
        allocationsPending: Number(row["pending"] ?? 0),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

export default router;
