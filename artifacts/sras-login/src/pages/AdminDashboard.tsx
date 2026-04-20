import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeDown, FadeUp, FadeIn, StaggerList, StaggerItem, HoverCard,
  MountFade, SlideInHeader, chartTooltipStyle, chartTooltipCursor
} from "../lib/AnimatedComponents";
import {
  LayoutDashboard, Building2, Users, ClipboardList, Package,
  ShieldCheck, AlertTriangle, BarChart2, User, LogOut, Bell,
  Menu, X, Search, Pencil, Trash2, CheckCircle2, XCircle,
  Eye, Save, Ban, RefreshCw, TrendingUp, Download, Send,
  Plus, FileText, Flag
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";

const ORANGE = "#FF7A00";
const ORANGE_LIGHT = "#FF9A40";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "overview" | "ngos" | "users" | "resources" | "tasks" | "proofs" | "issues" | "reports" | "profile";
type NgoStatus = "pending" | "approved" | "rejected" | "blocked";
type UserRole = "ngo" | "donor" | "volunteer";
type UserStatus = "active" | "inactive";
type TaskStatus = "assigned" | "in-progress" | "completed" | "delayed";
type ProofStatus = "pending" | "approved" | "rejected";
type IssueType = "fraud" | "delay" | "misuse" | "other";
type ResourceStatus = "available" | "allocated" | "shortage";

interface AdminProfile { name: string; email: string; phone: string; role: string; }
interface NgoEntry {
  id: number; name: string; regNumber: string; type: string; location: string;
  status: NgoStatus; document: string; submittedAt: string;
}
interface UserEntry {
  id: number; name: string; email: string; role: UserRole; status: UserStatus;
  joinedAt: string; activity: string;
}
interface TaskEntry {
  id: number; title: string; ngo: string; volunteer: string;
  status: TaskStatus; deadline: string; category: string;
}
interface ProofEntry {
  id: number; taskTitle: string; submittedBy: string; role: string;
  uploadedAt: string; status: ProofStatus; emoji: string; suspicious: boolean;
}
interface IssueEntry {
  id: number; type: IssueType; description: string; raisedBy: string;
  target: string; raisedAt: string; severity: "high" | "medium" | "low"; resolved: boolean;
}
interface ResourceEntry {
  id: number; name: string; ngo: string; quantity: number; unit: string;
  status: ResourceStatus; category: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAdminProfile(): AdminProfile {
  try {
    const saved = localStorage.getItem("sahara_user");
    if (saved) {
      const u = JSON.parse(saved);
      if (u.name) return { name: u.name, email: u.email || "admin@sahara.org", phone: u.phone || "+91 99999 00000", role: "Super Admin" };
    }
  } catch {}
  return { name: "Arjun Sharma", email: "arjun.sharma@sahara.org", phone: "+91 99999 00000", role: "Super Admin" };
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${color}`}>{label}</span>;
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string; onClick?: () => void;
}) {
  return (
    <motion.div onClick={onClick} whileHover={{ scale: 1.04, y: -3, boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.97 }} transition={{ duration: 0.18, ease: "easeOut" }}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-orange-50 ${onClick ? "cursor-pointer" : ""}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs font-medium mt-1" style={{ color: ORANGE }}>{sub}</p>}
    </motion.div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INIT_NGOS: NgoEntry[] = [
  { id: 1, name: "Sahara NGO", regNumber: "NGO-MH-2024-0042", type: "Health", location: "Mumbai", status: "approved", document: "registration.pdf", submittedAt: "Mar 15, 2026" },
  { id: 2, name: "Asha Foundation", regNumber: "NGO-MH-2025-0118", type: "Food", location: "Pune", status: "approved", document: "cert.pdf", submittedAt: "Jan 8, 2026" },
  { id: 3, name: "Vidya Shakti", regNumber: "NGO-MH-2026-0201", type: "Education", location: "Nagpur", status: "pending", document: "docs.pdf", submittedAt: "Apr 10, 2026" },
  { id: 4, name: "GreenLeaf Trust", regNumber: "NGO-MH-2026-0198", type: "Environment", location: "Nashik", status: "pending", document: "docs.pdf", submittedAt: "Apr 12, 2026" },
  { id: 5, name: "FakeAid Org", regNumber: "NGO-XX-2026-0001", type: "Disaster Relief", location: "Unknown", status: "rejected", document: "invalid.pdf", submittedAt: "Apr 5, 2026" },
  { id: 6, name: "HealingHands", regNumber: "NGO-MH-2025-0099", type: "Health", location: "Aurangabad", status: "blocked", document: "cert.pdf", submittedAt: "Feb 20, 2026" },
];

const INIT_USERS: UserEntry[] = [
  { id: 1, name: "Ananya Kapoor", email: "ananya@sahara-ngo.org", role: "ngo", status: "active", joinedAt: "Mar 15, 2026", activity: "High" },
  { id: 2, name: "Vikram Joshi", email: "vikram@example.com", role: "donor", status: "active", joinedAt: "Apr 1, 2026", activity: "Medium" },
  { id: 3, name: "Priya Sharma", email: "priya@volunteer.org", role: "volunteer", status: "active", joinedAt: "Apr 5, 2026", activity: "High" },
  { id: 4, name: "Aarav Patel", email: "aarav@volunteer.org", role: "volunteer", status: "active", joinedAt: "Apr 7, 2026", activity: "High" },
  { id: 5, name: "Sneha Reddy", email: "sneha@donor.com", role: "donor", status: "inactive", joinedAt: "Mar 22, 2026", activity: "Low" },
  { id: 6, name: "Rohan Mehta", email: "rohan@volunteer.org", role: "volunteer", status: "active", joinedAt: "Apr 3, 2026", activity: "Medium" },
  { id: 7, name: "Deepika Nair", email: "deepika@ngo.org", role: "ngo", status: "inactive", joinedAt: "Feb 14, 2026", activity: "Low" },
  { id: 8, name: "Kiran Bose", email: "kiran@donor.in", role: "donor", status: "active", joinedAt: "Apr 10, 2026", activity: "Medium" },
];

const INIT_TASKS: TaskEntry[] = [
  { id: 1, title: "Food Distribution Drive", ngo: "Asha Foundation", volunteer: "Priya Sharma", status: "in-progress", deadline: "Apr 25, 2026", category: "Food" },
  { id: 2, title: "Free Medical Camp", ngo: "Sahara NGO", volunteer: "Aarav Patel", status: "assigned", deadline: "Apr 28, 2026", category: "Health" },
  { id: 3, title: "Literacy Workshop", ngo: "Vidya Shakti", volunteer: "Sneha Reddy", status: "delayed", deadline: "Apr 20, 2026", category: "Education" },
  { id: 4, title: "Blood Donation Camp", ngo: "Sahara NGO", volunteer: "Deepika Nair", status: "completed", deadline: "Apr 15, 2026", category: "Health" },
  { id: 5, title: "Tree Plantation Drive", ngo: "GreenLeaf Trust", volunteer: "Rohan Mehta", status: "assigned", deadline: "May 2, 2026", category: "Environment" },
  { id: 6, title: "Women's Skill Workshop", ngo: "Sahara NGO", volunteer: "Priya Sharma", status: "delayed", deadline: "Apr 18, 2026", category: "Education" },
];

const INIT_PROOFS: ProofEntry[] = [
  { id: 1, taskTitle: "Blood Donation Camp", submittedBy: "Deepika Nair", role: "Volunteer", uploadedAt: "Apr 15 · 4:30 PM", status: "pending", emoji: "🩸", suspicious: false },
  { id: 2, taskTitle: "Food Distribution Drive", submittedBy: "Asha Foundation", role: "NGO", uploadedAt: "Apr 23 · 2:00 PM", status: "approved", emoji: "🍱", suspicious: false },
  { id: 3, taskTitle: "Literacy Workshop", submittedBy: "Sneha Reddy", role: "Volunteer", uploadedAt: "Apr 19 · 9:00 AM", status: "rejected", emoji: "📚", suspicious: true },
  { id: 4, taskTitle: "Free Medical Camp", submittedBy: "Sahara NGO", role: "NGO", uploadedAt: "Apr 20 · 1:00 PM", status: "pending", emoji: "🏥", suspicious: false },
];

const INIT_ISSUES: IssueEntry[] = [
  { id: 1, type: "fraud", description: "FakeAid Org submitted fabricated registration documents.", raisedBy: "System", target: "FakeAid Org", raisedAt: "Apr 6, 2026 · 10:00 AM", severity: "high", resolved: false },
  { id: 2, type: "delay", description: "Literacy Workshop is 2 days overdue — volunteer unresponsive.", raisedBy: "Vidya Shakti", target: "Sneha Reddy", raisedAt: "Apr 21, 2026 · 9:00 AM", severity: "medium", resolved: false },
  { id: 3, type: "misuse", description: "HealingHands reported misallocation of medical kits to unapproved locations.", raisedBy: "System Audit", target: "HealingHands", raisedAt: "Apr 18, 2026 · 3:00 PM", severity: "high", resolved: false },
  { id: 4, type: "other", description: "Duplicate donor account detected for kiran@donor.in.", raisedBy: "System", target: "Kiran Bose", raisedAt: "Apr 11, 2026 · 8:30 AM", severity: "low", resolved: true },
];

const INIT_RESOURCES: ResourceEntry[] = [
  { id: 1, name: "Food Packets", ngo: "Asha Foundation", quantity: 500, unit: "packs", status: "available", category: "Food" },
  { id: 2, name: "Medical Kits", ngo: "Sahara NGO", quantity: 80, unit: "kits", status: "allocated", category: "Health" },
  { id: 3, name: "Blankets", ngo: "Sahara NGO", quantity: 200, unit: "pieces", status: "available", category: "Relief" },
  { id: 4, name: "Water Bottles", ngo: "GreenLeaf Trust", quantity: 0, unit: "bottles", status: "shortage", category: "Food" },
  { id: 5, name: "School Stationery", ngo: "Vidya Shakti", quantity: 150, unit: "sets", status: "available", category: "Education" },
  { id: 6, name: "Medicines", ngo: "HealingHands", quantity: 5, unit: "units", status: "shortage", category: "Health" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: "🆕", message: "Vidya Shakti submitted NGO registration — pending review", time: "30 mins ago", read: false },
  { id: 2, icon: "🚨", message: "High severity fraud alert: FakeAid Org", time: "2 hours ago", read: false },
  { id: 3, icon: "⚠️", message: "HealingHands: resource misuse detected by system audit", time: "Yesterday", read: false },
  { id: 4, icon: "📸", message: "New proof uploaded for 'Blood Donation Camp' — awaiting review", time: "Yesterday", read: true },
  { id: 5, icon: "✅", message: "Asha Foundation approved successfully", time: "2 days ago", read: true },
];

const CHART_ACTIVITY = [
  { week: "W1 Apr", tasks: 8, donations: 12 },
  { week: "W2 Apr", tasks: 14, donations: 18 },
  { week: "W3 Apr", tasks: 11, donations: 22 },
  { week: "W4 Apr", tasks: 18, donations: 30 },
];

const CHART_USERS = [
  { name: "NGOs", value: 6, color: ORANGE },
  { name: "Donors", value: 3, color: "#3b82f6" },
  { name: "Volunteers", value: 5, color: "#22c55e" },
];

// ─── Config Maps ──────────────────────────────────────────────────────────────
const NGO_STATUS: Record<NgoStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-yellow-700", bg: "bg-yellow-100" },
  approved: { label: "Approved", color: "text-green-700", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
  blocked: { label: "Blocked", color: "text-gray-700", bg: "bg-gray-200" },
};

const USER_ROLE: Record<UserRole, { label: string; color: string; bg: string }> = {
  ngo: { label: "NGO", color: "text-orange-700", bg: "bg-orange-100" },
  donor: { label: "Donor", color: "text-blue-700", bg: "bg-blue-100" },
  volunteer: { label: "Volunteer", color: "text-green-700", bg: "bg-green-100" },
};

const TASK_STATUS: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  assigned: { label: "Assigned", color: "text-blue-600", bg: "bg-blue-100" },
  "in-progress": { label: "In Progress", color: "text-orange-600", bg: "bg-orange-100" },
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-100" },
  delayed: { label: "Delayed", color: "text-red-600", bg: "bg-red-100" },
};

const ISSUE_SEVERITY: Record<IssueEntry["severity"], { color: string; bg: string }> = {
  high: { color: "text-red-700", bg: "bg-red-100" },
  medium: { color: "text-orange-700", bg: "bg-orange-100" },
  low: { color: "text-green-700", bg: "bg-green-100" },
};

const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  fraud: "🚨 Fraud Report",
  delay: "⏱ Task Delay",
  misuse: "⚠️ Resource Misuse",
  other: "ℹ️ Other",
};

const RESOURCE_STATUS: Record<ResourceStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "text-green-600", bg: "bg-green-100" },
  allocated: { label: "Allocated", color: "text-orange-600", bg: "bg-orange-100" },
  shortage: { label: "Shortage", color: "text-red-600", bg: "bg-red-100" },
};

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewPage({ ngos, users, tasks, resources, onNavigate }: {
  ngos: NgoEntry[]; users: UserEntry[]; tasks: TaskEntry[]; resources: ResourceEntry[]; onNavigate: (p: Page) => void;
}) {
  const pendingNgos = ngos.filter(n => n.status === "pending").length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const delayedTasks = tasks.filter(t => t.status === "delayed").length;
  const shortages = resources.filter(r => r.status === "shortage").length;

  return (
    <MountFade className="space-y-6">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Admin Overview</h2>
        <p className="text-sm text-gray-400">System-wide stats and platform activity at a glance.</p>
      </FadeIn>

      <StaggerList className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Building2, label: "Total NGOs", value: ngos.length, sub: `${pendingNgos} pending`, color: "bg-orange-500", page: "ngos" as Page },
          { icon: Users, label: "Users", value: users.length, sub: `${activeUsers} active`, color: "bg-blue-500", page: "users" as Page },
          { icon: ClipboardList, label: "Tasks", value: tasks.length, sub: `${delayedTasks} delayed`, color: "bg-purple-500", page: "tasks" as Page },
          { icon: Package, label: "Resources", value: resources.length, sub: `${shortages} shortages`, color: "bg-teal-500", page: "resources" as Page },
          { icon: AlertTriangle, label: "Open Issues", value: 3, sub: "2 high severity", color: "bg-red-500", page: "issues" as Page },
        ].map(({ icon, label, value, sub, color, page }) => (
          <StaggerItem key={label}>
            <StatCard icon={icon} label={label} value={value} sub={sub} color={color} onClick={() => onNavigate(page)} />
          </StaggerItem>
        ))}
      </StaggerList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeUp>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <h3 className="font-bold text-gray-800 mb-4">Platform Activity — Weekly</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CHART_ACTIVITY} barSize={14}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={chartTooltipCursor} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                <Bar dataKey="tasks" fill={ORANGE} name="Tasks" radius={[6, 6, 0, 0]} />
                <Bar dataKey="donations" fill="#3b82f6" name="Donations" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </HoverCard>
        </FadeUp>

        <FadeDown delay={0.08}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <h3 className="font-bold text-gray-800 mb-3">User Distribution</h3>
            <div className="flex items-center gap-6">
              <div style={{ transform: "perspective(320px) rotateX(28deg)", transformOrigin: "center bottom" }}>
                <PieChart width={160} height={130}>
                  <Pie data={CHART_USERS} cx="50%" cy="55%" innerRadius={36} outerRadius={56} dataKey="value" paddingAngle={3}>
                    {CHART_USERS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle}
                    formatter={(value, name) => {
                      const total = CHART_USERS.reduce((s, r) => s + r.value, 0);
                      return [`${value} (${Math.round((Number(value) / total) * 100)}%)`, name];
                    }} />
                </PieChart>
              </div>
              <div className="space-y-3 flex-1">
                {CHART_USERS.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-gray-600">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </HoverCard>
        </FadeDown>
      </div>

      <FadeUp delay={0.1}>
        <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {[
              { icon: "🆕", text: "Vidya Shakti submitted NGO registration", time: "30 mins ago", color: "bg-yellow-50" },
              { icon: "🚨", text: "Fraud alert raised for FakeAid Org", time: "2 hours ago", color: "bg-red-50" },
              { icon: "✅", text: "Asha Foundation NGO approved", time: "2 days ago", color: "bg-green-50" },
              { icon: "⚠️", text: "HealingHands: resource misuse flagged by system audit", time: "Yesterday", color: "bg-orange-50" },
            ].map((a, i) => (
              <motion.div key={i} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${a.color} hover:opacity-90 transition-opacity`}>
                <span className="text-base">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 font-medium truncate">{a.text}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{a.time}</p>
              </motion.div>
            ))}
          </div>
        </HoverCard>
      </FadeUp>
    </MountFade>
  );
}

// ─── NGO Management ───────────────────────────────────────────────────────────
function NgoManagementPage({ ngos, setNgos }: { ngos: NgoEntry[]; setNgos: React.Dispatch<React.SetStateAction<NgoEntry[]>> }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NgoStatus | "all">("all");
  const [previewDoc, setPreviewDoc] = useState<NgoEntry | null>(null);

  const filtered = ngos.filter(n => {
    if (statusFilter !== "all" && n.status !== statusFilter) return false;
    if (search && !n.name.toLowerCase().includes(search.toLowerCase()) && !n.regNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function updateStatus(id: number, status: NgoStatus) {
    setNgos(prev => prev.map(n => n.id === id ? { ...n, status } : n));
  }

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">NGO Management</h2>
        <p className="text-sm text-gray-400">Review, approve, reject, or block NGO registrations.</p>
      </FadeIn>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search NGOs..."
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-orange-400 text-gray-600">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <StaggerList className="space-y-3">
        {filtered.map(n => {
          const sc = NGO_STATUS[n.status];
          return (
            <StaggerItem key={n.id}>
              <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800">{n.name}</p>
                      <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                    </div>
                    <p className="text-xs text-gray-400">Reg: {n.regNumber} · {n.type} · {n.location}</p>
                    <p className="text-xs text-gray-300 mt-0.5">Submitted: {n.submittedAt}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => setPreviewDoc(n)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Eye size={11} /> Doc
                    </motion.button>
                    {n.status === "pending" && (
                      <>
                        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                          onClick={() => updateStatus(n.id, "approved")}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                          <CheckCircle2 size={11} /> Approve
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                          onClick={() => updateStatus(n.id, "rejected")}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <XCircle size={11} /> Reject
                        </motion.button>
                      </>
                    )}
                    {n.status === "approved" && (
                      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        onClick={() => updateStatus(n.id, "blocked")}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        <Ban size={11} /> Block
                      </motion.button>
                    )}
                    {n.status === "blocked" && (
                      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        onClick={() => updateStatus(n.id, "approved")}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                        <CheckCircle2 size={11} /> Unblock
                      </motion.button>
                    )}
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerList>

      <AnimatePresence>
        {previewDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setPreviewDoc(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Document Preview</h3>
                <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="w-full h-40 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center mb-4">
                <span className="text-5xl mb-2">📄</span>
                <p className="text-sm text-gray-600 font-medium">{previewDoc.document}</p>
                <p className="text-xs text-gray-400">Submitted by {previewDoc.name}</p>
              </div>
              <p className="text-xs text-gray-400 text-center">Documents are stored securely and accessible only to admins.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MountFade>
  );
}

// ─── User Management ──────────────────────────────────────────────────────────
function UserManagementPage({ users, setUsers }: { users: UserEntry[]; setUsers: React.Dispatch<React.SetStateAction<UserEntry[]>> }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [editUser, setEditUser] = useState<UserEntry | null>(null);
  const [editDraft, setEditDraft] = useState<UserEntry | null>(null);

  const filtered = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toggleStatus(id: number) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
  }

  function deleteUser(id: number) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function saveEdit() {
    if (!editDraft) return;
    setUsers(prev => prev.map(u => u.id === editDraft.id ? editDraft : u));
    setEditUser(null);
    setEditDraft(null);
  }

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">User Management</h2>
        <p className="text-sm text-gray-400">View, edit, activate, or remove platform users.</p>
      </FadeIn>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-orange-400 text-gray-600">
          <option value="all">All Roles</option>
          <option value="ngo">NGO</option>
          <option value="donor">Donor</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-orange-400 text-gray-600">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <StaggerList className="space-y-3">
        {filtered.map(u => {
          const rc = USER_ROLE[u.role];
          return (
            <StaggerItem key={u.id}>
              <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                    {u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                      <Badge label={rc.label} color={rc.color} bg={rc.bg} />
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{u.email} · Joined {u.joinedAt} · Activity: {u.activity}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => { setEditUser(u); setEditDraft({ ...u }); }}
                      className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">
                      <Pencil size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => toggleStatus(u.id)}
                      className={`p-1.5 rounded-lg transition-colors ${u.status === "active" ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                      {u.status === "active" ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => deleteUser(u.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors">
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerList>

      <AnimatePresence>
        {editUser && editDraft && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setEditUser(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Edit User</h3>
                <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {[{ label: "Full Name", key: "name" }, { label: "Email", key: "email" }].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                    <input value={(editDraft as Record<string, string>)[key]}
                      onChange={e => setEditDraft(d => d ? { ...d, [key]: e.target.value } : d)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Status</label>
                  <select value={editDraft.status} onChange={e => setEditDraft(d => d ? { ...d, status: e.target.value as UserStatus } : d)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveEdit}
                className="w-full py-2.5 rounded-xl text-white font-bold text-sm mt-4 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                <Save size={14} /> Save Changes
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MountFade>
  );
}

// ─── Resource Monitoring ──────────────────────────────────────────────────────
function ResourceMonitorPage({ resources, setResources }: { resources: ResourceEntry[]; setResources: React.Dispatch<React.SetStateAction<ResourceEntry[]>> }) {
  const [filter, setFilter] = useState<ResourceStatus | "all">("all");

  const filtered = resources.filter(r => filter === "all" || r.status === filter);
  const shortages = resources.filter(r => r.status === "shortage");

  function updateStatus(id: number, status: ResourceStatus) {
    setResources(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Resource Monitoring</h2>
        <p className="text-sm text-gray-400">Track resource distribution and identify shortages across NGOs.</p>
      </FadeIn>

      {shortages.length > 0 && (
        <FadeDown>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">⚠️ {shortages.length} Resource Shortage{shortages.length > 1 ? "s" : ""} Detected</p>
              <p className="text-xs text-red-600 mt-0.5">{shortages.map(s => `${s.name} (${s.ngo})`).join(" · ")}</p>
            </div>
          </div>
        </FadeDown>
      )}

      <div className="flex gap-2 flex-wrap">
        {(["all", "available", "allocated", "shortage"] as const).map(s => (
          <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filter === s ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
            style={filter === s ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            {s === "all" ? "All" : s}
          </motion.button>
        ))}
      </div>

      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => {
          const sc = RESOURCE_STATUS[r.status];
          return (
            <StaggerItem key={r.id}>
              <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.ngo} · {r.category}</p>
                  </div>
                  <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                </div>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{r.quantity}</p>
                    <p className="text-xs text-gray-400">{r.unit}</p>
                  </div>
                  <div className="flex gap-1">
                    {r.status !== "available" && (
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        onClick={() => updateStatus(r.id, "available")}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                        Mark Available
                      </motion.button>
                    )}
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }}
                    animate={{ width: r.status === "shortage" ? "5%" : `${Math.min((r.quantity / 500) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: r.status === "shortage" ? "#ef4444" : r.status === "allocated" ? ORANGE : "#22c55e" }} />
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </MountFade>
  );
}

// ─── Task Monitoring ──────────────────────────────────────────────────────────
function TaskMonitorPage({ tasks }: { tasks: TaskEntry[] }) {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = tasks.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.ngo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const delayed = tasks.filter(t => t.status === "delayed");

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Task & Activity Monitoring</h2>
        <p className="text-sm text-gray-400">View all tasks across NGOs, track delays and inactive assignments.</p>
      </FadeIn>

      {delayed.length > 0 && (
        <FadeDown>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">{delayed.length} Delayed Task{delayed.length > 1 ? "s" : ""}</p>
              <p className="text-xs text-red-600 mt-0.5">{delayed.map(t => t.title).join(" · ")}</p>
            </div>
          </div>
        </FadeDown>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks or NGOs..."
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "assigned", "in-progress", "completed", "delayed"] as const).map(s => (
            <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === s ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
              style={filter === s ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
              {s === "all" ? "All" : s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      <StaggerList className="space-y-3">
        {filtered.map(t => {
          const sc = TASK_STATUS[t.status];
          return (
            <StaggerItem key={t.id}>
              <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800 text-sm">{t.title}</p>
                      <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                    </div>
                    <p className="text-xs text-gray-400">NGO: {t.ngo} · Volunteer: {t.volunteer}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📅 {t.deadline} · {t.category}</p>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </MountFade>
  );
}

// ─── Proof & Verification ─────────────────────────────────────────────────────
function ProofVerificationPage({ proofs, setProofs }: { proofs: ProofEntry[]; setProofs: React.Dispatch<React.SetStateAction<ProofEntry[]>> }) {
  const [preview, setPreview] = useState<ProofEntry | null>(null);
  const [comment, setComment] = useState("");
  const [filter, setFilter] = useState<ProofStatus | "all">("all");

  const filtered = proofs.filter(p => filter === "all" || p.status === filter);

  function handleDecision(id: number, decision: "approved" | "rejected") {
    setProofs(prev => prev.map(p => p.id === id ? { ...p, status: decision } : p));
    setPreview(null);
    setComment("");
  }

  const statusColor: Record<ProofStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Proof & Verification</h2>
        <p className="text-sm text-gray-400">Review, approve, or reject proof submitted by NGOs and volunteers.</p>
      </FadeIn>

      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map(s => (
          <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filter === s ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
            style={filter === s ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </motion.button>
        ))}
      </div>

      <StaggerList className="space-y-3">
        {filtered.map(p => (
          <StaggerItem key={p.id}>
            <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-orange-50 border border-orange-100 shrink-0">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-bold text-gray-800 text-sm">{p.taskTitle}</p>
                    {p.suspicious && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">⚠️ Suspicious</span>}
                  </div>
                  <p className="text-xs text-gray-400">{p.submittedBy} ({p.role}) · {p.uploadedAt}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${statusColor[p.status]}`}>{p.status}</span>
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={() => { setPreview(p); setComment(""); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <Eye size={11} /> Review
                  </motion.button>
                </div>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerList>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Proof Review</h3>
                <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              {preview.suspicious && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle size={14} /> This proof has been flagged as potentially suspicious.
                </div>
              )}
              <div className="w-full h-40 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center mb-4">
                <span className="text-5xl mb-2">{preview.emoji}</span>
                <p className="text-sm text-gray-600 font-medium">{preview.taskTitle}</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">{preview.submittedBy} · {preview.uploadedAt}</p>
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Admin Comment</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Add a decision comment..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none" />
              </div>
              {preview.status === "pending" ? (
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleDecision(preview.id, "approved")}
                    className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition-colors">
                    <CheckCircle2 size={15} /> Approve
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleDecision(preview.id, "rejected")}
                    className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition-colors">
                    <XCircle size={15} /> Reject
                  </motion.button>
                </div>
              ) : (
                <div className={`text-center py-2.5 rounded-xl text-sm font-bold ${preview.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {preview.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MountFade>
  );
}

// ─── Issues & Alerts ──────────────────────────────────────────────────────────
function IssuesPage({ issues, setIssues }: { issues: IssueEntry[]; setIssues: React.Dispatch<React.SetStateAction<IssueEntry[]>> }) {
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("all");

  const filtered = issues.filter(i => {
    if (filter === "unresolved") return !i.resolved;
    if (filter === "resolved") return i.resolved;
    return true;
  });

  function resolve(id: number) {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, resolved: true } : i));
  }

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Issues & Alerts</h2>
        <p className="text-sm text-gray-400">Manage fraud reports, delays, and resource misuse alerts.</p>
      </FadeIn>

      <div className="flex gap-2">
        {(["all", "unresolved", "resolved"] as const).map(f => (
          <motion.button key={f} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filter === f ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
            style={filter === f ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </motion.button>
        ))}
      </div>

      <StaggerList className="space-y-3">
        {filtered.map(issue => {
          const sv = ISSUE_SEVERITY[issue.severity];
          return (
            <StaggerItem key={issue.id}>
              <HoverCard className={`bg-white rounded-2xl p-5 shadow-sm border ${issue.resolved ? "border-gray-100 opacity-70" : "border-orange-50"}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <p className="font-bold text-gray-800 text-sm">{ISSUE_TYPE_LABELS[issue.type]}</p>
                      <Badge label={issue.severity.toUpperCase()} color={sv.color} bg={sv.bg} />
                      {issue.resolved && <Badge label="Resolved" color="text-green-700" bg="bg-green-100" />}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-1">{issue.description}</p>
                    <p className="text-xs text-gray-400">Target: <span className="font-semibold text-gray-600">{issue.target}</span> · Raised by: {issue.raisedBy}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{issue.raisedAt}</p>
                  </div>
                  {!issue.resolved && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        onClick={() => resolve(issue.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                        <CheckCircle2 size={11} /> Resolve
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <Send size={11} /> Warn
                      </motion.button>
                    </div>
                  )}
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </MountFade>
  );
}

// ─── Reports & Analytics ──────────────────────────────────────────────────────
function ReportsPage({ ngos, users, tasks, resources }: {
  ngos: NgoEntry[]; users: UserEntry[]; tasks: TaskEntry[]; resources: ResourceEntry[];
}) {
  const reports = [
    { title: "NGO Performance Report", desc: `${ngos.filter(n => n.status === "approved").length} approved NGOs, ${ngos.filter(n => n.status === "pending").length} pending review.`, icon: "🏛️", category: "NGO" },
    { title: "Donation Usage Report", desc: `${users.filter(u => u.role === "donor").length} donors registered. High activity on Health & Food categories.`, icon: "💰", category: "Finance" },
    { title: "Resource Distribution Report", desc: `${resources.filter(r => r.status === "shortage").length} shortages detected. ${resources.filter(r => r.status === "available").length} resources available.`, icon: "📦", category: "Resources" },
    { title: "Task Completion Report", desc: `${tasks.filter(t => t.status === "completed").length} completed, ${tasks.filter(t => t.status === "delayed").length} delayed across all NGOs.`, icon: "✅", category: "Tasks" },
    { title: "Volunteer Activity Report", desc: `${users.filter(u => u.role === "volunteer").length} volunteers, ${users.filter(u => u.role === "volunteer" && u.activity === "High").length} with high activity.`, icon: "🤝", category: "Volunteers" },
  ];

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Reports & Analytics</h2>
        <p className="text-sm text-gray-400">System-wide performance and distribution reports.</p>
      </FadeIn>

      <FadeUp>
        <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Platform Activity Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_ACTIVITY} barSize={16}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={chartTooltipCursor} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Bar dataKey="tasks" fill={ORANGE} name="Tasks" radius={[6, 6, 0, 0]} />
              <Bar dataKey="donations" fill="#3b82f6" name="Donations" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </HoverCard>
      </FadeUp>

      <StaggerList className="space-y-3">
        {reports.map((r, i) => (
          <StaggerItem key={i}>
            <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-xl shrink-0">{r.icon}</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                    <FileText size={11} /> PDF
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                    <Download size={11} /> CSV
                  </motion.button>
                </div>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerList>
    </MountFade>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>(getAdminProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  function handleSave() {
    setProfile(draft);
    try {
      const saved = localStorage.getItem("sahara_user");
      const u = saved ? JSON.parse(saved) : {};
      localStorage.setItem("sahara_user", JSON.stringify({ ...u, name: draft.name, email: draft.email, phone: draft.phone }));
    } catch {}
    setEditing(false);
  }

  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <MountFade className="space-y-5 max-w-2xl">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Admin Profile</h2>
        <p className="text-sm text-gray-400">Your account and system access details.</p>
      </FadeIn>
      <FadeUp>
        <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
          <div className="h-1.5" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }} />
          <div className="px-6 pt-5 pb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #FF5500)` }}>
                  {initials}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{profile.name}</p>
                  <p className="text-sm font-semibold" style={{ color: ORANGE }}>{profile.role} · SAHARA</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => editing ? (setDraft(profile), setEditing(false)) : setEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${editing ? "bg-gray-100 text-gray-600" : "text-white"}`}
                style={!editing ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
                <Pencil size={14} /> {editing ? "Cancel" : "Edit Profile"}
              </motion.button>
            </div>

            {editing ? (
              <div className="space-y-3">
                {[{ label: "Full Name", key: "name" }, { label: "Email", key: "email" }, { label: "Phone", key: "phone" }].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                    <input value={(draft as Record<string, string>)[key]}
                      onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                  </div>
                ))}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-2"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                  <Save size={15} /> Save Changes
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[{ label: "Email", value: profile.email }, { label: "Phone", value: profile.phone }, { label: "Role", value: profile.role }].map(f => (
                  <div key={f.label} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                    <p className="text-sm text-gray-700 font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FadeUp>
    </MountFade>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: "overview", icon: LayoutDashboard, label: "Dashboard" },
  { page: "ngos", icon: Building2, label: "NGO Management" },
  { page: "users", icon: Users, label: "User Management" },
  { page: "resources", icon: Package, label: "Resources" },
  { page: "tasks", icon: ClipboardList, label: "Task Monitor" },
  { page: "proofs", icon: ShieldCheck, label: "Proof Verification" },
  { page: "issues", icon: AlertTriangle, label: "Issues & Alerts" },
  { page: "reports", icon: BarChart2, label: "Reports" },
  { page: "profile", icon: User, label: "Profile" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activePage, setActivePage] = useState<Page>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [ngos, setNgos] = useState<NgoEntry[]>(INIT_NGOS);
  const [users, setUsers] = useState<UserEntry[]>(INIT_USERS);
  const [tasks] = useState<TaskEntry[]>(INIT_TASKS);
  const [proofs, setProofs] = useState<ProofEntry[]>(INIT_PROOFS);
  const [issues, setIssues] = useState<IssueEntry[]>(INIT_ISSUES);
  const [resources, setResources] = useState<ResourceEntry[]>(INIT_RESOURCES);

  const profile = getAdminProfile();
  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-5"}`}>
      <div className="flex items-center gap-2.5 mb-6">
        <img src={saharaLogo} alt="SAHARA" className="w-9 h-9 object-contain" />
        <span className="text-lg font-black tracking-tight" style={{ color: ORANGE }}>SAHARA</span>
        {mobile && <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={18} /></button>}
      </div>
      <div className="mb-3 px-2">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Super Admin</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ page, icon: Icon, label }) => (
          <motion.button key={page}
            onClick={() => { setActivePage(page); setSidebarOpen(false); }}
            whileHover={{ x: 2 }} transition={{ duration: 0.12 }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activePage === page ? "text-white shadow-sm" : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"}`}
            style={activePage === page ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            <Icon size={16} /><span className="truncate">{label}</span>
          </motion.button>
        ))}
      </nav>
      <motion.button whileHover={{ x: 2 }} transition={{ duration: 0.12 }}
        onClick={() => { window.location.href = "/"; }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all mt-3">
        <LogOut size={16} /> Logout
      </motion.button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-[Poppins,sans-serif]">
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 shrink-0 shadow-sm">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <Sidebar mobile />
          </motion.div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SlideInHeader>
          <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between gap-3 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-orange-500 transition-colors">
                <Menu size={20} />
              </button>
              <h1 className="font-bold text-gray-800 text-base">{NAV_ITEMS.find(n => n.page === activePage)?.label}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                  onClick={() => setNotifOpen(v => !v)}
                  className="relative p-2 rounded-xl hover:bg-orange-50 transition-colors text-gray-500">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ background: ORANGE }}>{unreadCount}</motion.span>
                  )}
                </motion.button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.2 }}
                      className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-bold text-sm text-gray-800">Notifications</span>
                        <button onClick={markAllRead} className="text-xs font-semibold hover:underline" style={{ color: ORANGE }}>Mark all read</button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 border-b border-gray-50 flex gap-3 items-start hover:bg-orange-50/30 transition-colors ${!n.read ? "bg-orange-50/50" : ""}`}>
                            <span className="text-lg leading-tight">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 leading-snug">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: ORANGE }} />}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-gray-800 leading-tight">{profile.name}</p>
                  <p className="text-[10px] font-semibold" style={{ color: ORANGE }}>Super Admin</p>
                </div>
              </div>
            </div>
          </header>
        </SlideInHeader>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}>
              {activePage === "overview" && <OverviewPage ngos={ngos} users={users} tasks={tasks} resources={resources} onNavigate={setActivePage} />}
              {activePage === "ngos" && <NgoManagementPage ngos={ngos} setNgos={setNgos} />}
              {activePage === "users" && <UserManagementPage users={users} setUsers={setUsers} />}
              {activePage === "resources" && <ResourceMonitorPage resources={resources} setResources={setResources} />}
              {activePage === "tasks" && <TaskMonitorPage tasks={tasks} />}
              {activePage === "proofs" && <ProofVerificationPage proofs={proofs} setProofs={setProofs} />}
              {activePage === "issues" && <IssuesPage issues={issues} setIssues={setIssues} />}
              {activePage === "reports" && <ReportsPage ngos={ngos} users={users} tasks={tasks} resources={resources} />}
              {activePage === "profile" && <ProfilePage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {notifOpen && <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />}
    </div>
  );
}
