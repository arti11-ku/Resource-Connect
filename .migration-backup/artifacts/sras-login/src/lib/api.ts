export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

export function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── Domain types matching the backend ──
export type BackendStatus = "pending" | "active" | "in_progress" | "completed";
export type BackendPriority = "low" | "medium" | "high";

export interface BackendTask {
  id: string;
  title: string;
  description: string;
  location: string;
  required_skills: string[];
  deadline: string | null;
  priority: BackendPriority;
  status: BackendStatus;
  ngo_id: string;
  issue_id: string | null;
  assigned_to: string | null;
  flagged: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  location?: string;
  required_skills?: string[];
  deadline?: string | null;
  priority?: BackendPriority;
}
