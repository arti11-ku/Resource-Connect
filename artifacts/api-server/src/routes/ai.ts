import { Router, type IRouter } from "express";
import { db, aiAllocationsTable, resourcesTable, volunteersTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"];
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 8192 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }
  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

router.post("/ai/allocate", async (req, res) => {
  try {
    const { report, resources, volunteers, reportId, saveToDb } = req.body as {
      report: { type: string; affected_people: number; severity: string; location?: string };
      resources: { name: string; quantity: number; unit?: string }[];
      volunteers: { name: string; skills: string[]; availability?: string; location?: string }[];
      reportId?: number;
      saveToDb?: boolean;
    };

    const prompt = `You are an AI resource allocation assistant for a disaster relief NGO platform called SAHARA.

Given the following disaster report and available resources/volunteers, generate an optimal allocation plan.

Report:
${JSON.stringify(report, null, 2)}

Available Resources:
${JSON.stringify(resources, null, 2)}

Available Volunteers:
${JSON.stringify(volunteers, null, 2)}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "priority": "Critical" | "High" | "Medium" | "Low",
  "priority_score": <number 0-100>,
  "resources": [
    { "resource": "<name>", "quantity": <number>, "reason": "<why this amount>" }
  ],
  "volunteers": [
    { "name": "<volunteer name>", "match_score": <number 0-100>, "reason": "<why this volunteer>" }
  ],
  "summary": "<2-3 sentence summary of the allocation plan>",
  "reason": "<overall justification>"
}

Rules:
- Never allocate more than available quantity
- Prioritize based on affected people count and severity
- Match volunteers by skills to the disaster type
- Medical/flood disasters are highest priority`;

    const text = await callGemini(prompt);
    const parsed = JSON.parse(text);

    let savedAllocation = null;
    if (saveToDb !== false) {
      try {
        const [row] = await db.insert(aiAllocationsTable).values({
          reportId: reportId ?? null,
          priorityLevel: parsed.priority,
          priorityScore: parsed.priority_score,
          allocatedResources: parsed.resources,
          assignedVolunteers: parsed.volunteers,
          allocationReason: parsed.reason,
          allocationSummary: parsed.summary,
          status: "Pending",
        }).returning();
        savedAllocation = row;
      } catch {
      }
    }

    res.json({ success: true, allocation: parsed, saved: savedAllocation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

router.post("/ai/allocate-from-db", async (req, res) => {
  try {
    const { reportId, report } = req.body as {
      reportId?: number;
      report: { type: string; affected_people: number; severity: string; location?: string };
    };

    const [dbResources, dbVolunteers] = await Promise.all([
      db.select().from(resourcesTable),
      db.select({
        id: volunteersTable.id,
        skills: volunteersTable.skills,
        availability: volunteersTable.availability,
        currentStatus: volunteersTable.currentStatus,
        location: volunteersTable.location,
        name: usersTable.name,
      }).from(volunteersTable).leftJoin(usersTable, eq(volunteersTable.userId, usersTable.id))
        .where(eq(volunteersTable.currentStatus, "Available")),
    ]);

    const resources = dbResources.map(r => ({ name: r.resourceName, quantity: r.quantity, unit: r.unit ?? "units" }));
    const volunteers = dbVolunteers.map(v => ({ name: v.name ?? "Unknown", skills: v.skills, availability: v.availability, location: v.location ?? undefined }));

    const forwardRes = await fetch(`http://localhost:${process.env["PORT"]}/api/ai/allocate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report, resources, volunteers, reportId, saveToDb: true }),
    });
    const data = await forwardRes.json();
    res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

router.post("/ai/recommend-tasks", async (req, res) => {
  try {
    const { volunteer, tasks } = req.body as {
      volunteer: { name: string; skills: string[]; location?: string; pastCategories?: string[] };
      tasks: { id: string | number; title: string; description?: string; category?: string; skills?: string[]; location?: string; urgency?: string }[];
    };

    const prompt = `You are an AI volunteer task-matching assistant for SAHARA disaster relief platform.

Match the volunteer to the best tasks based on skills, past experience, and location.

Volunteer Profile:
${JSON.stringify(volunteer, null, 2)}

Available Tasks:
${JSON.stringify(tasks, null, 2)}

Respond ONLY with valid JSON (no markdown):
{
  "recommendations": [
    {
      "task_id": "<id>",
      "match_score": <number 0-100>,
      "reason": "<why this task suits this volunteer>",
      "priority": "High" | "Medium" | "Low"
    }
  ]
}

Return up to 3 best matches, sorted by match_score descending.`;

    const text = await callGemini(prompt);
    const parsed = JSON.parse(text);
    res.json({ success: true, ...parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

router.post("/ai/admin-overview", async (req, res) => {
  try {
    const { allocations, resources, volunteers, tasks } = req.body as {
      allocations: { id: string; report_type: string; priority: string; status: string; volunteer_count: number; resource_count: number }[];
      resources: { name: string; quantity: number; status: string }[];
      volunteers: { name: string; assignedTask?: string; skills: string[] }[];
      tasks: { title: string; status: string; priority: string }[];
    };

    const prompt = `You are an AI administrator assistant for SAHARA disaster relief platform.

Analyze the current state of all allocations, resources, and volunteers and provide an executive overview.

Current Allocations:
${JSON.stringify(allocations, null, 2)}

Resources:
${JSON.stringify(resources, null, 2)}

Volunteers:
${JSON.stringify(volunteers, null, 2)}

Tasks:
${JSON.stringify(tasks, null, 2)}

Respond ONLY with valid JSON (no markdown):
{
  "total_allocations": <number>,
  "resources_allocated": <number>,
  "volunteers_assigned": <number>,
  "pending_requests": <number>,
  "critical_reports": <number>,
  "efficiency_score": <number 0-100>,
  "alerts": ["<alert message>"],
  "recommendations": ["<recommendation>"],
  "summary": "<2-3 sentence executive summary>"
}`;

    const text = await callGemini(prompt);
    const parsed = JSON.parse(text);
    res.json({ success: true, overview: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
