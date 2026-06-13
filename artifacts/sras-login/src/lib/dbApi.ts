const BASE = "/api";

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json() as Record<string, unknown>;
  if (!data["success"]) throw new Error(String(data["error"] ?? "API error"));
  return data as T;
}

export interface DbUser { id: number; name: string; email: string; role: string; phone?: string; createdAt: string; }
export interface DbNgo { id: number; userId: number; ngoName: string; registrationNumber: string; contactDetails?: string; address?: string; status: string; createdAt: string; ownerName?: string; ownerEmail?: string; }
export interface DbVolunteer { id: number; userId: number; name?: string; email?: string; phone?: string; skills: string[]; availability: string; currentStatus: string; location?: string; }
export interface DbResource { id: number; ngoId?: number; resourceName: string; category: string; quantity: number; unit: string; location?: string; status: string; updatedAt: string; }
export interface DbTask { id: number; reportId?: number; ngoId?: number; title: string; description: string; status: string; priority: string; assignedTo?: string; deadline?: string; category?: string; location?: string; skills: string[]; points: number; createdAt: string; }
export interface DbReport { id: number; reporterId: number; title: string; description: string; category: string; severity: string; location: string; status: string; createdAt: string; }
export interface DbAllocation { id: number; reportId?: number; priorityLevel: string; priorityScore: number; allocatedResources: unknown; assignedVolunteers: unknown; allocationReason?: string; allocationSummary?: string; status: string; createdAt: string; }

export interface DbStats {
  totalUsers: number; totalNgos: number; totalVolunteers: number; totalReports: number;
  totalTasks: number; totalResources: number; totalAllocations: number;
  allocationsApproved: number; allocationsRejected: number; allocationsPending: number;
}

export const dbApi = {
  getStats: () => req<{ success: true; stats: DbStats }>("/stats").then(r => r.stats),
  getUsers: () => req<{ success: true; users: DbUser[] }>("/users").then(r => r.users),
  getUser: (id: number) => req<{ success: true; user: DbUser }>(`/users/${id}`).then(r => r.user),
  createUser: (body: Partial<DbUser> & { passwordHash?: string }) => req<{ success: true; user: DbUser }>("/users", { method: "POST", body: JSON.stringify(body) }).then(r => r.user),
  updateUser: (id: number, body: Partial<DbUser>) => req<{ success: true; user: DbUser }>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(r => r.user),
  deleteUser: (id: number) => req<{ success: true }>(`/users/${id}`, { method: "DELETE" }),

  getNgos: () => req<{ success: true; ngos: DbNgo[] }>("/ngos").then(r => r.ngos),
  updateNgo: (id: number, body: Partial<DbNgo>) => req<{ success: true; ngo: DbNgo }>(`/ngos/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(r => r.ngo),
  deleteNgo: (id: number) => req<{ success: true }>(`/ngos/${id}`, { method: "DELETE" }),

  getVolunteers: () => req<{ success: true; volunteers: DbVolunteer[] }>("/volunteers").then(r => r.volunteers),
  updateVolunteer: (id: number, body: Partial<DbVolunteer>) => req<{ success: true; volunteer: DbVolunteer }>(`/volunteers/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(r => r.volunteer),

  getResources: () => req<{ success: true; resources: DbResource[] }>("/resources").then(r => r.resources),
  createResource: (body: Partial<DbResource>) => req<{ success: true; resource: DbResource }>("/resources", { method: "POST", body: JSON.stringify(body) }).then(r => r.resource),
  updateResource: (id: number, body: Partial<DbResource>) => req<{ success: true; resource: DbResource }>(`/resources/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(r => r.resource),
  deleteResource: (id: number) => req<{ success: true }>(`/resources/${id}`, { method: "DELETE" }),

  getTasks: () => req<{ success: true; tasks: DbTask[] }>("/tasks").then(r => r.tasks),
  createTask: (body: Partial<DbTask>) => req<{ success: true; task: DbTask }>("/tasks", { method: "POST", body: JSON.stringify(body) }).then(r => r.task),
  updateTask: (id: number, body: Partial<DbTask>) => req<{ success: true; task: DbTask }>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(r => r.task),
  deleteTask: (id: number) => req<{ success: true }>(`/tasks/${id}`, { method: "DELETE" }),

  getReports: () => req<{ success: true; reports: DbReport[] }>("/reports").then(r => r.reports),
  createReport: (body: Partial<DbReport>) => req<{ success: true; report: DbReport }>("/reports", { method: "POST", body: JSON.stringify(body) }).then(r => r.report),
  updateReport: (id: number, body: Partial<DbReport>) => req<{ success: true; report: DbReport }>(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(r => r.report),

  getAllocations: () => req<{ success: true; allocations: DbAllocation[] }>("/allocations").then(r => r.allocations),
  createAllocation: (body: Partial<DbAllocation>) => req<{ success: true; allocation: DbAllocation }>("/allocations", { method: "POST", body: JSON.stringify(body) }).then(r => r.allocation),
  updateAllocationStatus: (id: number, status: "Pending" | "Approved" | "Rejected") => req<{ success: true; allocation: DbAllocation }>(`/allocations/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }).then(r => r.allocation),
};
