const API_BASE = "/api";

export interface GeminiAllocateInput {
  report: {
    type: string;
    affected_people: number;
    severity: string;
    location?: string;
  };
  resources: { name: string; quantity: number; unit?: string }[];
  volunteers: { name: string; skills: string[]; availability?: string; location?: string }[];
}

export interface GeminiAllocation {
  priority: string;
  priority_score: number;
  resources: { resource: string; quantity: number; reason: string }[];
  volunteers: { name: string; match_score: number; reason: string }[];
  summary: string;
  reason: string;
}

export interface GeminiRecommendation {
  task_id: string | number;
  match_score: number;
  reason: string;
  priority: string;
}

export interface GeminiAdminOverview {
  total_allocations: number;
  resources_allocated: number;
  volunteers_assigned: number;
  pending_requests: number;
  critical_reports: number;
  efficiency_score: number;
  alerts: string[];
  recommendations: string[];
  summary: string;
}

export async function geminiAllocate(input: GeminiAllocateInput): Promise<GeminiAllocation> {
  const res = await fetch(`${API_BASE}/ai/allocate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json() as { success: boolean; allocation?: GeminiAllocation; error?: string };
  if (!data.success || !data.allocation) throw new Error(data.error ?? "Allocation failed");
  return data.allocation;
}

export async function geminiRecommendTasks(
  volunteer: { name: string; skills: string[]; location?: string; pastCategories?: string[] },
  tasks: { id: string | number; title: string; description?: string; category?: string; skills?: string[]; location?: string; urgency?: string }[]
): Promise<GeminiRecommendation[]> {
  const res = await fetch(`${API_BASE}/ai/recommend-tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ volunteer, tasks }),
  });
  const data = await res.json() as { success: boolean; recommendations?: GeminiRecommendation[]; error?: string };
  if (!data.success) throw new Error(data.error ?? "Recommendation failed");
  return data.recommendations ?? [];
}

export async function geminiAdminOverview(payload: {
  allocations: { id: string; report_type: string; priority: string; status: string; volunteer_count: number; resource_count: number }[];
  resources: { name: string; quantity: number; status: string }[];
  volunteers: { name: string; assignedTask?: string; skills: string[] }[];
  tasks: { title: string; status: string; priority: string }[];
}): Promise<GeminiAdminOverview> {
  const res = await fetch(`${API_BASE}/ai/admin-overview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json() as { success: boolean; overview?: GeminiAdminOverview; error?: string };
  if (!data.success || !data.overview) throw new Error(data.error ?? "Overview failed");
  return data.overview;
}
