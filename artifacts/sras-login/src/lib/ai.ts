// ─────────────────────────────────────────────────────────────────────────────
// SAHARA AI Engine
//
// Lightweight, rule-based "AI" helpers used across dashboards. The logic lives
// here (separate from UI) so each dashboard simply imports the function it
// needs. No external APIs required — these are deterministic heuristics.
// ─────────────────────────────────────────────────────────────────────────────

export type AIPriority = "high" | "medium" | "low";

export interface AITaskInput {
  id: number | string;
  title: string;
  description?: string;
  deadline?: string;       // human label or ISO
  category?: string;
  requiredSkills?: string[];
  location?: string;
}

export interface AIVolunteerInput {
  id: number | string;
  name: string;
  skills: string[];
  location?: string;       // city or "city, state"
  availability?: string;   // free-form ("Weekends", "Full Time"…)
  rating?: number;         // 0–5
  assignedTask?: string;   // current assignment, if any
}

// ─── 1. PRIORITY PREDICTION ──────────────────────────────────────────────────
// Combines deadline urgency + task type to produce a priority label.
const HIGH_KEYWORDS = ["medical", "health", "blood", "disaster", "flood", "rescue", "emergency", "ambulance", "fire"];
const MED_KEYWORDS = ["food", "water", "meal", "shelter", "relief", "nutrition", "elderly"];
const LOW_KEYWORDS = ["education", "literacy", "workshop", "tree", "plantation", "clean", "awareness"];

function daysUntil(deadline?: string): number {
  if (!deadline) return 30;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return 30;
  const ms = d.getTime() - Date.now();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export interface AIPriorityResult {
  priority: AIPriority;
  reason: string;
}

export function predictPriority(task: AITaskInput): AIPriorityResult {
  const text = `${task.title} ${task.description ?? ""} ${task.category ?? ""}`.toLowerCase();
  const days = daysUntil(task.deadline);

  let typeScore = 1; // low
  let typeLabel = "general";
  if (HIGH_KEYWORDS.some(k => text.includes(k))) { typeScore = 3; typeLabel = "medical / disaster"; }
  else if (MED_KEYWORDS.some(k => text.includes(k))) { typeScore = 2; typeLabel = "food / relief"; }
  else if (LOW_KEYWORDS.some(k => text.includes(k))) { typeScore = 1; typeLabel = "education / environment"; }

  let urgencyScore = 1;
  let urgencyLabel = "comfortable timeline";
  if (days <= 2) { urgencyScore = 3; urgencyLabel = `due in ${Math.max(0, days)}d`; }
  else if (days <= 7) { urgencyScore = 2; urgencyLabel = `due in ${days}d`; }
  else { urgencyScore = 1; urgencyLabel = `due in ${days}d`; }

  const total = typeScore + urgencyScore;
  let priority: AIPriority;
  if (total >= 5) priority = "high";
  else if (total >= 3) priority = "medium";
  else priority = "low";

  return {
    priority,
    reason: `Type: ${typeLabel} · ${urgencyLabel}`,
  };
}

// ─── 2. SMART TASK ASSIGNMENT (AUTO ALLOCATION) ──────────────────────────────
// Scores each volunteer for a task and picks the best match.
function skillMatchPct(required: string[], owned: string[]): number {
  if (!required || required.length === 0) return 70; // neutral baseline
  const o = owned.map(s => s.toLowerCase());
  const matched = required.filter(r => o.includes(r.toLowerCase())).length;
  return Math.round((matched / required.length) * 100);
}

// Toy "distance" — same city = 2km, same state = 12km, else 25km.
function approxDistanceKm(taskLoc?: string, volLoc?: string): number {
  if (!taskLoc || !volLoc) return 15;
  const [tCity, tState] = taskLoc.split(",").map(s => s.trim().toLowerCase());
  const [vCity, vState] = volLoc.split(",").map(s => s.trim().toLowerCase());
  if (tCity && vCity && tCity === vCity) return 2 + Math.floor(((tCity.length + vCity.length) % 5));
  if (tState && vState && tState === vState) return 12;
  return 25;
}

function availabilityScore(av?: string): number {
  if (!av) return 50;
  const a = av.toLowerCase();
  if (a.includes("full")) return 100;
  if (a.includes("weekend")) return 75;
  if (a.includes("evening")) return 65;
  if (a.includes("day")) return 70;
  return 50;
}

export interface AIAllocation {
  taskId: number | string;
  taskTitle: string;
  volunteerId: number | string | null;
  volunteerName: string | null;
  reason: string;            // human-readable explanation
  skillPct: number;
  distanceKm: number;
  rating: number;
  score: number;             // overall composite
}

export function allocateTasks(
  tasks: AITaskInput[],
  volunteers: AIVolunteerInput[]
): AIAllocation[] {
  // Track which volunteers were just assigned (avoid double-booking in one run).
  const justAssigned = new Set<number | string>();
  const results: AIAllocation[] = [];

  for (const task of tasks) {
    let best: { v: AIVolunteerInput; score: number; skill: number; dist: number; rating: number } | null = null;

    for (const v of volunteers) {
      if (justAssigned.has(v.id)) continue;
      if (v.assignedTask && v.assignedTask.trim() !== "") continue;

      const skill = skillMatchPct(task.requiredSkills ?? [], v.skills);
      const dist = approxDistanceKm(task.location, v.location);
      const distScore = Math.max(0, 100 - dist * 3);
      const avail = availabilityScore(v.availability);
      const rating = v.rating ?? 4.2;
      const ratingScore = (rating / 5) * 100;

      // Weighted: skill 40%, distance 25%, availability 15%, rating 20%
      const score = skill * 0.4 + distScore * 0.25 + avail * 0.15 + ratingScore * 0.2;

      if (!best || score > best.score) {
        best = { v, score, skill, dist, rating };
      }
    }

    if (best) {
      justAssigned.add(best.v.id);
      results.push({
        taskId: task.id,
        taskTitle: task.title,
        volunteerId: best.v.id,
        volunteerName: best.v.name,
        skillPct: best.skill,
        distanceKm: best.dist,
        rating: best.rating,
        score: Math.round(best.score),
        reason: `Assigned to ${best.v.name} (${best.skill}% skill match, ${best.dist}km away, ${best.rating.toFixed(1)}★ rating)`,
      });
    } else {
      results.push({
        taskId: task.id,
        taskTitle: task.title,
        volunteerId: null,
        volunteerName: null,
        skillPct: 0,
        distanceKm: 0,
        rating: 0,
        score: 0,
        reason: "No available volunteer matched — all volunteers are currently engaged.",
      });
    }
  }

  return results;
}

// ─── 3. RULE-BASED CHATBOT ───────────────────────────────────────────────────
export interface ChatContextTask {
  id: number | string;
  title: string;
  status?: string;
  priority?: AIPriority;
  deadline?: string;
}

export interface ChatContext {
  role: "volunteer" | "ngo" | "admin" | "donor" | "reporter";
  myTasks?: ChatContextTask[];
  availableTasks?: ChatContextTask[];
  username?: string;
}

export interface ChatReply {
  text: string;
  bullets?: string[];
}

const QUICK_REPLIES_BY_ROLE: Record<ChatContext["role"], string[]> = {
  volunteer: ["Show my tasks", "Which tasks are urgent?", "Assign me a task"],
  ngo: ["Show pending tasks", "Which tasks are urgent?", "Run AI allocation"],
  admin: ["Show urgent tasks", "How many NGOs?", "Help"],
  donor: ["My donations", "Where are funds going?", "Help"],
  reporter: ["Open issues", "How to report?", "Help"],
};

export function getQuickReplies(role: ChatContext["role"]): string[] {
  return QUICK_REPLIES_BY_ROLE[role] ?? ["Help"];
}

export function chatbotReply(message: string, ctx: ChatContext): ChatReply {
  const m = message.toLowerCase().trim();

  if (/^(hi|hello|hey|namaste)\b/.test(m)) {
    return {
      text: `Namaste${ctx.username ? ", " + ctx.username : ""}! I'm SAHARA AI. How can I help today?`,
      bullets: getQuickReplies(ctx.role),
    };
  }

  if (m.includes("my task") || m.includes("show me my")) {
    const list = ctx.myTasks ?? [];
    if (list.length === 0) {
      return { text: "You don't have any tasks assigned right now. Check the Available Tasks page to pick one." };
    }
    return {
      text: `You have ${list.length} task${list.length > 1 ? "s" : ""}:`,
      bullets: list.slice(0, 6).map(t => `${t.title}${t.status ? ` — ${t.status}` : ""}`),
    };
  }

  if (m.includes("urgent") || m.includes("priority") || m.includes("important")) {
    const pool = [...(ctx.myTasks ?? []), ...(ctx.availableTasks ?? [])];
    const urgent = pool.filter(t => t.priority === "high");
    if (urgent.length === 0) {
      return { text: "Good news — there are no high-priority tasks pending right now." };
    }
    return {
      text: `${urgent.length} high-priority task${urgent.length > 1 ? "s" : ""} need attention:`,
      bullets: urgent.slice(0, 6).map(t => `🔴 ${t.title}${t.deadline ? " · " + t.deadline : ""}`),
    };
  }

  if (m.includes("assign") && (m.includes("me") || m.includes("task"))) {
    const list = ctx.availableTasks ?? [];
    if (list.length === 0) {
      return { text: "There are no open tasks at the moment. Please check back soon!" };
    }
    const pick = list.find(t => t.priority === "high") ?? list[0];
    return {
      text: `Based on availability, I recommend: "${pick.title}". Open the Available Tasks page to accept it.`,
    };
  }

  if (m.includes("allocation") || m.includes("auto") || m.includes("allocate")) {
    return { text: "Open the Tasks page and click 'Run AI Allocation' to auto-match volunteers to tasks." };
  }

  if (m.includes("how many") && (m.includes("ngo") || m.includes("volunteer"))) {
    return { text: "You can see live counts on your dashboard overview cards." };
  }

  if (m.includes("help") || m === "?") {
    return {
      text: "Here's what I can do:",
      bullets: getQuickReplies(ctx.role),
    };
  }

  if (m.includes("thank")) {
    return { text: "Happy to help! Together we make a difference. 🌟" };
  }

  return {
    text: "I didn't quite catch that. Try one of these:",
    bullets: getQuickReplies(ctx.role),
  };
}

// ─── 4. PROOF VERIFICATION (SIMULATED) ───────────────────────────────────────
export type AICheckStatus = "pending" | "verified" | "suspicious";

export interface AIProofResult {
  status: AICheckStatus;
  confidence: number; // 0–100
  note: string;
}

// Deterministic "verification" based on filename hash so the same proof always
// resolves to the same status. Mimics what a real AI image check would output.
export function verifyProof(fileName: string, fileType: "image" | "document" = "image"): AIProofResult {
  if (!fileName) return { status: "pending", confidence: 0, note: "Awaiting file" };
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) hash = (hash * 31 + fileName.charCodeAt(i)) | 0;
  const bucket = Math.abs(hash) % 100;

  if (bucket < 70) {
    return {
      status: "verified",
      confidence: 80 + (bucket % 18),
      note: fileType === "image" ? "Image content matches task category." : "Document structure looks valid.",
    };
  }
  if (bucket < 90) {
    return {
      status: "pending",
      confidence: 50 + (bucket % 15),
      note: "AI confidence below threshold — needs human review.",
    };
  }
  return {
    status: "suspicious",
    confidence: 30 + (bucket % 20),
    note: "Possible duplicate or low-quality submission.",
  };
}

// ─── 5. SMART RECOMMENDATIONS ────────────────────────────────────────────────
// Score each task by (skill overlap with volunteer + relevance to past work).
export interface AIRecommendation {
  taskId: number | string;
  score: number;        // 0-100
  matchedSkills: string[];
  reason: string;
}

export function recommendTasks(
  tasks: AITaskInput[],
  volunteer: { skills: string[]; pastCategories?: string[]; location?: string },
  limit = 4
): AIRecommendation[] {
  const lowSkills = volunteer.skills.map(s => s.toLowerCase());
  const past = (volunteer.pastCategories ?? []).map(c => c.toLowerCase());

  const scored = tasks.map(t => {
    const need = (t.requiredSkills ?? []).map(s => s.toLowerCase());
    const matched = need.filter(s => lowSkills.includes(s));
    const skillScore = need.length === 0 ? 30 : (matched.length / need.length) * 60;

    const cat = (t.category ?? "").toLowerCase();
    const categoryScore = past.includes(cat) ? 25 : 0;

    const distScore = Math.max(0, 15 - approxDistanceKm(t.location, volunteer.location));

    const score = Math.min(100, Math.round(skillScore + categoryScore + distScore));
    const matchedSkills = (t.requiredSkills ?? []).filter(s => lowSkills.includes(s.toLowerCase()));

    let reason = "";
    if (matchedSkills.length > 0) reason = `Matches your skills: ${matchedSkills.join(", ")}`;
    else if (categoryScore > 0) reason = `Similar to your past ${cat} work`;
    else reason = "A great way to broaden your impact";

    return { taskId: t.id, score, matchedSkills, reason };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
