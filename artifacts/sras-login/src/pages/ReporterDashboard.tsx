import { useState, useRef } from "react";
import {
  LayoutDashboard, ClipboardList, ShieldCheck, AlertTriangle,
  BarChart2, User, LogOut, Bell, Menu, X, ChevronDown,
  CheckCircle2, XCircle, Clock, Eye, Download, Flag,
  MessageSquare, Send, Filter, Search, ChevronRight,
  FileText, TrendingUp, Users, Zap, RefreshCw, Circle
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";

type Page = "overview" | "tasks" | "proofs" | "issues" | "reports" | "communication" | "profile";
type TaskStatus = "available" | "accepted" | "in-progress" | "completed";
type ProofStatus = "pending" | "approved" | "rejected";
type IssueType = "delay" | "invalid-proof" | "incomplete-work" | "other";

interface Task {
  id: number;
  title: string;
  description: string;
  volunteer: string;
  status: TaskStatus;
  deadline: string;
  category: string;
  location: string;
}

interface Proof {
  id: number;
  taskId: number;
  taskTitle: string;
  volunteer: string;
  fileName: string;
  fileType: "image" | "document";
  uploadedAt: string;
  status: ProofStatus;
  comment: string;
  emoji: string;
}

interface Issue {
  id: number;
  taskId: number;
  taskTitle: string;
  type: IssueType;
  description: string;
  raisedAt: string;
  escalated: boolean;
  fileName?: string;
}

interface Notification {
  id: number;
  icon: string;
  message: string;
  time: string;
  read: boolean;
}

interface Comment {
  id: number;
  taskId: number;
  author: string;
  text: string;
  time: string;
  isMe: boolean;
}

const ORANGE = "#FF7A00";
const ORANGE_LIGHT = "#FF9A40";

const MOCK_TASKS: Task[] = [
  { id: 1, title: "Flood Relief Distribution", description: "Help distribute essential supplies to flood-affected families.", volunteer: "Priya Sharma", status: "in-progress", deadline: "Apr 22, 2026", category: "Disaster Relief", location: "Kurla, Mumbai" },
  { id: 2, title: "Free Medical Camp", description: "Assist doctors at a free health screening camp.", volunteer: "Aarav Patel", status: "completed", deadline: "Apr 25, 2026", category: "Healthcare", location: "Dharavi, Mumbai" },
  { id: 3, title: "Women's Skill Workshop", description: "Conduct vocational skill sessions for underprivileged women.", volunteer: "Sneha Reddy", status: "available", deadline: "Apr 28, 2026", category: "Education", location: "Govandi, Mumbai" },
  { id: 4, title: "Tree Plantation Drive", description: "Join the city-wide plantation initiative.", volunteer: "Rohan Mehta", status: "accepted", deadline: "Apr 27, 2026", category: "Environment", location: "Sanjay Gandhi Park" },
  { id: 5, title: "Blood Donation Camp", description: "Support blood donation drives across the city.", volunteer: "Deepika Nair", status: "completed", deadline: "Apr 30, 2026", category: "Healthcare", location: "Dadar, Mumbai" },
  { id: 6, title: "Elderly Care Visit", description: "Spend time with elderly residents at a care home.", volunteer: "Vikram Singh", status: "in-progress", deadline: "May 2, 2026", category: "Healthcare", location: "Chembur, Mumbai" },
  { id: 7, title: "Mid-Day Meal Support", description: "Help serve nutritious meals to school children.", volunteer: "Anita Joshi", status: "completed", deadline: "Apr 20, 2026", category: "Food & Nutrition", location: "Andheri, Mumbai" },
  { id: 8, title: "Literacy Drive Weekend", description: "Teach basic literacy skills to underprivileged adults.", volunteer: "Karan Bose", status: "available", deadline: "Apr 22, 2026", category: "Education", location: "Bandra, Mumbai" },
];

const MOCK_PROOFS: Proof[] = [
  { id: 1, taskId: 2, taskTitle: "Free Medical Camp", volunteer: "Aarav Patel", fileName: "medical_camp_proof.jpg", fileType: "image", uploadedAt: "Apr 25, 2026 · 3:14 PM", status: "pending", comment: "", emoji: "🏥" },
  { id: 2, taskId: 7, taskTitle: "Mid-Day Meal Support", volunteer: "Anita Joshi", fileName: "meal_distribution.jpg", fileType: "image", uploadedAt: "Apr 20, 2026 · 2:45 PM", status: "approved", comment: "Great work, well documented!", emoji: "🍱" },
  { id: 3, taskId: 5, taskTitle: "Blood Donation Camp", volunteer: "Deepika Nair", fileName: "donation_records.pdf", fileType: "document", uploadedAt: "Apr 30, 2026 · 5:00 PM", status: "pending", comment: "", emoji: "🩸" },
  { id: 4, taskId: 1, taskTitle: "Flood Relief Distribution", volunteer: "Priya Sharma", fileName: "relief_distribution.jpg", fileType: "image", uploadedAt: "Apr 21, 2026 · 11:00 AM", status: "rejected", comment: "Image is blurry, please resubmit.", emoji: "🌊" },
];

const MOCK_ISSUES: Issue[] = [
  { id: 1, taskId: 4, taskTitle: "Tree Plantation Drive", type: "delay", description: "Volunteer has not started the task despite accepting it 3 days ago.", raisedAt: "Apr 20, 2026 · 9:30 AM", escalated: false },
  { id: 2, taskId: 4, taskTitle: "Flood Relief Distribution", type: "invalid-proof", description: "The uploaded proof image does not match the task location.", raisedAt: "Apr 21, 2026 · 2:00 PM", escalated: true, fileName: "screenshot.png" },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "📸", message: "Aarav Patel uploaded proof for 'Free Medical Camp'", time: "10 mins ago", read: false },
  { id: 2, icon: "✅", message: "Task 'Mid-Day Meal Support' marked as completed", time: "1 hour ago", read: false },
  { id: 3, icon: "⚠️", message: "Deadline approaching: 'Flood Relief Distribution' — Apr 22", time: "3 hours ago", read: false },
  { id: 4, icon: "🚩", message: "Issue escalated: 'Tree Plantation Drive' sent to Admin", time: "Yesterday", read: true },
  { id: 5, icon: "🩸", message: "Deepika Nair uploaded proof for 'Blood Donation Camp'", time: "Yesterday", read: true },
];

const MOCK_COMMENTS: Comment[] = [
  { id: 1, taskId: 1, author: "Rajan Mehta (Reporter)", text: "Please update the status as soon as supplies are distributed.", time: "Apr 21 · 9:00 AM", isMe: true },
  { id: 2, taskId: 1, author: "Priya Sharma", text: "Understood! Will update by EOD.", time: "Apr 21 · 9:15 AM", isMe: false },
  { id: 3, taskId: 2, author: "Rajan Mehta (Reporter)", text: "Great job on the medical camp. Please upload your proof.", time: "Apr 25 · 2:00 PM", isMe: true },
  { id: 4, taskId: 2, author: "Aarav Patel", text: "Uploaded! Please check.", time: "Apr 25 · 3:14 PM", isMe: false },
];

const CHART_COMPLETION = [
  { name: "Apr 17", completed: 2, delayed: 0 },
  { name: "Apr 18", completed: 1, delayed: 1 },
  { name: "Apr 19", completed: 3, delayed: 0 },
  { name: "Apr 20", completed: 2, delayed: 1 },
  { name: "Apr 21", completed: 4, delayed: 0 },
  { name: "Apr 22", completed: 2, delayed: 2 },
];

const CHART_STATUS = [
  { name: "Completed", value: 3, color: "#22c55e" },
  { name: "In Progress", value: 2, color: ORANGE },
  { name: "Available", value: 2, color: "#94a3b8" },
  { name: "Accepted", value: 1, color: "#3b82f6" },
];

const VOLUNTEER_PERF = [
  { name: "Aarav", tasks: 45, points: 2180 },
  { name: "Sneha", tasks: 38, points: 1890 },
  { name: "Rohan", tasks: 32, points: 1560 },
  { name: "Priya", tasks: 28, points: 1240 },
  { name: "Deepika", tasks: 24, points: 1100 },
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  available: { label: "Available", color: "text-slate-600", bg: "bg-slate-100", icon: Circle },
  accepted: { label: "Accepted", color: "text-blue-600", bg: "bg-blue-100", icon: CheckCircle2 },
  "in-progress": { label: "In Progress", color: "text-orange-600", bg: "bg-orange-100", icon: RefreshCw },
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle2 },
};

const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  delay: "Delay",
  "invalid-proof": "Invalid Proof",
  "incomplete-work": "Incomplete Work",
  other: "Other",
};

function getReporterProfile() {
  try {
    const saved = localStorage.getItem("sahara_user");
    if (saved) {
      const u = JSON.parse(saved);
      if (u.name) return {
        name: u.name,
        email: u.email || "reporter@sahara.org",
        phone: u.phone || "+91 98765 00000",
        location: u.city && u.state ? `${u.city}, ${u.state}` : u.city || "Mumbai, Maharashtra",
        occupation: u.occupation || "Field Reporter",
      };
    }
  } catch {}
  return { name: "Rajan Mehta", email: "rajan.mehta@sahara.org", phone: "+91 98765 00000", location: "Mumbai, Maharashtra", occupation: "Field Reporter" };
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-xl" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-orange-500 font-medium mt-1">{sub}</p>}
    </div>
  );
}

function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
        <p className="text-sm text-gray-400">Monitor all tasks, proofs, and field activity at a glance.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={ClipboardList} label="Active Tasks" value={4} sub="Currently running" color="bg-orange-500" />
        <StatCard icon={CheckCircle2} label="Completed" value={3} sub="This week" color="bg-green-500" />
        <StatCard icon={Clock} label="Pending" value={2} sub="Awaiting action" color="bg-blue-500" />
        <StatCard icon={Flag} label="Issues Flagged" value={2} sub="1 escalated" color="bg-red-500" />
        <StatCard icon={FileText} label="Reports" value={6} sub="Generated" color="bg-purple-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Task Completion (Last 6 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_COMPLETION} barSize={14}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="completed" fill="#22c55e" name="Completed" radius={[6, 6, 0, 0]} />
              <Bar dataKey="delayed" fill="#f97316" name="Delayed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Task Status Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={CHART_STATUS} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {CHART_STATUS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {CHART_STATUS.map(s => (
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
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <h3 className="font-bold text-gray-800 mb-4">Volunteer Performance</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={VOLUNTEER_PERF} layout="vertical" barSize={12}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={50} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
            <Bar dataKey="tasks" fill={ORANGE} name="Tasks" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [volunteerFilter, setVolunteerFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = MOCK_TASKS.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (volunteerFilter && !t.volunteer.toLowerCase().includes(volunteerFilter.toLowerCase())) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Task Monitoring</h2>
        <p className="text-sm text-gray-400">View-only access — reporters cannot edit tasks.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TaskStatus | "all")}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-orange-400 text-gray-600">
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="accepted">Accepted</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <input value={volunteerFilter} onChange={e => setVolunteerFilter(e.target.value)} placeholder="Filter by volunteer..."
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-orange-400 min-w-[180px]" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-orange-50/60">
                {["Task Title", "Category", "Volunteer", "Location", "Deadline", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, i) => {
                const sc = STATUS_CONFIG[task.status];
                const Icon = sc.icon;
                return (
                  <tr key={task.id} className={`border-b border-gray-50 hover:bg-orange-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 whitespace-nowrap">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{task.description}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{task.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Avatar name={task.volunteer} size="sm" />
                        <span className="text-gray-700 font-medium">{task.volunteer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{task.location}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{task.deadline}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.color} whitespace-nowrap`}>
                        <Icon size={11} />
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No tasks match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProofsPage() {
  const [proofs, setProofs] = useState<Proof[]>(MOCK_PROOFS);
  const [activeProof, setActiveProof] = useState<Proof | null>(null);
  const [comment, setComment] = useState("");
  const [filter, setFilter] = useState<ProofStatus | "all">("all");

  const filtered = proofs.filter(p => filter === "all" || p.status === filter);

  function handleAction(id: number, action: "approved" | "rejected") {
    setProofs(prev => prev.map(p => p.id === id ? { ...p, status: action, comment } : p));
    setActiveProof(null);
    setComment("");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Proof Verification</h2>
        <p className="text-sm text-gray-400">Review uploaded proofs and approve or reject submissions.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? "text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
            style={filter === f ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            {f === "all" ? "All Proofs" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && <span className="ml-1.5 text-xs opacity-80">({proofs.filter(p => p.status === f).length})</span>}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(proof => (
          <div key={proof.id} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">{proof.emoji}</div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{proof.taskTitle}</p>
                  <p className="text-xs text-gray-400">{proof.volunteer}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                proof.status === "approved" ? "bg-green-100 text-green-700" :
                proof.status === "rejected" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"}`}>
                {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-3">
              {proof.fileType === "image" ? <Eye size={15} className="text-orange-400 shrink-0" /> : <FileText size={15} className="text-orange-400 shrink-0" />}
              <span className="text-sm text-gray-600 truncate font-medium">{proof.fileName}</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Uploaded: {proof.uploadedAt}</p>
            {proof.comment && (
              <div className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-2.5 mb-3 border border-gray-100">
                💬 {proof.comment}
              </div>
            )}
            {proof.status === "pending" && (
              <button onClick={() => { setActiveProof(proof); setComment(""); }}
                className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                Review Proof
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 bg-white rounded-2xl border border-orange-50">No proofs in this category.</div>
        )}
      </div>

      {activeProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Review Proof</h3>
              <button onClick={() => setActiveProof(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
              <p className="font-semibold text-gray-800 text-sm">{activeProof.taskTitle}</p>
              <p className="text-xs text-gray-500 mt-0.5">By {activeProof.volunteer} · {activeProof.fileName}</p>
            </div>
            <div className="mb-4 h-36 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <span className="text-4xl">{activeProof.emoji}</span>
                <p className="text-xs text-gray-400 mt-2">{activeProof.fileType === "image" ? "Image preview" : "Document"}</p>
                <p className="text-xs text-gray-500 font-medium">{activeProof.fileName}</p>
              </div>
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment or feedback (optional)..."
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none mb-4"
              rows={3} />
            <div className="flex gap-3">
              <button onClick={() => handleAction(activeProof.id, "approved")}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition-colors">
                <CheckCircle2 size={15} /> Approve
              </button>
              <button onClick={() => handleAction(activeProof.id, "rejected")}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition-colors">
                <XCircle size={15} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ taskId: "", type: "delay" as IssueType, description: "", fileName: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    if (!form.taskId || !form.description) return;
    const task = MOCK_TASKS.find(t => t.id === Number(form.taskId));
    if (!task) return;
    const newIssue: Issue = {
      id: Date.now(), taskId: task.id, taskTitle: task.title,
      type: form.type, description: form.description,
      raisedAt: new Date().toLocaleString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      escalated: false, fileName: form.fileName || undefined,
    };
    setIssues(prev => [newIssue, ...prev]);
    setForm({ taskId: "", type: "delay", description: "", fileName: "" });
    setShowForm(false);
  }

  function handleEscalate(id: number) {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, escalated: true } : i));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Issue Reporting</h2>
          <p className="text-sm text-gray-400">Flag and track issues on tasks in the field.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
          <Flag size={15} /> Flag Issue
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
          <h3 className="font-bold text-gray-800 mb-4">Report a New Issue</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Task</label>
              <select value={form.taskId} onChange={e => setForm(f => ({ ...f, taskId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                <option value="">Select a task...</option>
                {MOCK_TASKS.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Issue Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as IssueType }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                <option value="delay">Delay</option>
                <option value="invalid-proof">Invalid Proof</option>
                <option value="incomplete-work">Incomplete Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none" rows={3} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Attach File (optional)</label>
              <input ref={fileRef} type="file" className="hidden" onChange={e => setForm(f => ({ ...f, fileName: e.target.files?.[0]?.name || "" }))} />
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-orange-300 text-orange-500 text-sm hover:bg-orange-50 transition-colors">
                <Download size={14} /> {form.fileName || "Choose file"}
              </button>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>Submit Issue</button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {issues.map(issue => (
          <div key={issue.id} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-base">⚠️</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{issue.taskTitle}</p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mt-0.5">
                    {ISSUE_TYPE_LABELS[issue.type]}
                  </span>
                </div>
              </div>
              {issue.escalated ? (
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">Escalated</span>
              ) : (
                <button onClick={() => handleEscalate(issue.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                  Escalate to Admin
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
            {issue.fileName && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 mb-3 w-fit">
                <FileText size={13} className="text-orange-400" />
                <span className="text-xs text-gray-600">{issue.fileName}</span>
              </div>
            )}
            <p className="text-xs text-gray-400">Raised: {issue.raisedAt}</p>
          </div>
        ))}
        {issues.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-orange-50">No issues reported.</div>
        )}
      </div>
    </div>
  );
}

function ReportsPage() {
  function downloadCSV() {
    const headers = ["Task", "Volunteer", "Status", "Deadline", "Category"];
    const rows = MOCK_TASKS.map(t => [t.title, t.volunteer, t.status, t.deadline, t.category]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sahara_report.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPDF() {
    window.print();
  }

  const completionRate = Math.round((MOCK_TASKS.filter(t => t.status === "completed").length / MOCK_TASKS.length) * 100);
  const delayedCount = MOCK_TASKS.filter(t => t.status !== "completed" && t.status !== "in-progress").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Reports & Analytics</h2>
          <p className="text-sm text-gray-400">Export and analyze field activity data.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors">
            <Download size={14} /> Download CSV
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <FileText size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 text-center">
          <p className="text-4xl font-bold text-green-500">{completionRate}%</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">Task Completion Rate</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 text-center">
          <p className="text-4xl font-bold text-orange-500">{delayedCount}</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">Tasks Delayed / Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 text-center">
          <p className="text-4xl font-bold text-blue-500">8</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">Total Volunteers Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Daily Completion Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CHART_COMPLETION}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 4 }} name="Completed" />
              <Line type="monotone" dataKey="delayed" stroke={ORANGE} strokeWidth={2.5} dot={{ fill: ORANGE, r: 4 }} name="Delayed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Volunteer Performance</h3>
          <div className="space-y-3">
            {VOLUNTEER_PERF.map((v, i) => (
              <div key={v.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                <Avatar name={v.name + " X"} size="sm" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">{v.name}</span>
                    <span className="text-xs text-gray-400">{v.tasks} tasks</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(v.tasks / 45) * 100}%`, background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE_LIGHT})` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <h3 className="font-bold text-gray-800 mb-4">All Tasks Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Task", "Volunteer", "Category", "Deadline", "Status"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TASKS.map(t => {
                const sc = STATUS_CONFIG[t.status];
                return (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-medium text-gray-800">{t.title}</td>
                    <td className="px-3 py-2.5 text-gray-600">{t.volunteer}</td>
                    <td className="px-3 py-2.5 text-gray-500">{t.category}</td>
                    <td className="px-3 py-2.5 text-gray-500">{t.deadline}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CommunicationPage() {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [selectedTask, setSelectedTask] = useState<number>(1);
  const [newMsg, setNewMsg] = useState("");
  const profile = getReporterProfile();

  const taskComments = comments.filter(c => c.taskId === selectedTask);

  function sendMessage() {
    if (!newMsg.trim()) return;
    const msg: Comment = {
      id: Date.now(), taskId: selectedTask,
      author: `${profile.name} (Reporter)`,
      text: newMsg.trim(),
      time: new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    setComments(prev => [...prev, msg]);
    setNewMsg("");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Communication Panel</h2>
        <p className="text-sm text-gray-400">Comment on tasks and coordinate with volunteers.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {MOCK_TASKS.slice(0, 5).map(t => (
          <button key={t.id} onClick={() => setSelectedTask(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedTask === t.id ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
            style={selectedTask === t.id ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            {t.title.split(" ").slice(0, 3).join(" ")}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-orange-50/40">
          <p className="font-bold text-gray-800 text-sm">{MOCK_TASKS.find(t => t.id === selectedTask)?.title}</p>
          <p className="text-xs text-gray-400">{MOCK_TASKS.find(t => t.id === selectedTask)?.volunteer}</p>
        </div>
        <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
          {taskComments.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">No messages yet for this task.</p>
          ) : taskComments.map(c => (
            <div key={c.id} className={`flex gap-2.5 ${c.isMe ? "flex-row-reverse" : ""}`}>
              <Avatar name={c.author} size="sm" />
              <div className={`max-w-[75%] ${c.isMe ? "items-end" : "items-start"} flex flex-col`}>
                <p className={`text-xs text-gray-400 mb-1 ${c.isMe ? "text-right" : ""}`}>{c.author}</p>
                <div className={`px-3 py-2 rounded-2xl text-sm ${c.isMe ? "text-white rounded-tr-sm" : "bg-gray-100 text-gray-700 rounded-tl-sm"}`}
                  style={c.isMe ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
                  {c.text}
                </div>
                <p className="text-[10px] text-gray-300 mt-1">{c.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
          <button onClick={sendMessage}
            className="p-2.5 rounded-xl text-white hover:opacity-90 transition-all"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const profile = getReporterProfile();
  const activityLog = [
    { icon: "✅", text: "Approved proof for 'Mid-Day Meal Support'", time: "Apr 20, 2026 · 3:00 PM" },
    { icon: "❌", text: "Rejected proof for 'Flood Relief Distribution' — blurry image", time: "Apr 21, 2026 · 11:15 AM" },
    { icon: "🚩", text: "Flagged issue on 'Tree Plantation Drive' — delay", time: "Apr 20, 2026 · 9:30 AM" },
    { icon: "📊", text: "Generated weekly task report", time: "Apr 19, 2026 · 5:00 PM" },
    { icon: "💬", text: "Commented on 'Flood Relief Distribution'", time: "Apr 21, 2026 · 9:00 AM" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Profile & Activity</h2>
        <p className="text-sm text-gray-400">Your reporter profile and recent actions.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }} />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #FF5500)` }}>
              {profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="mb-1">
              <p className="text-xl font-bold text-gray-900">{profile.name}</p>
              <p className="text-sm text-orange-500 font-semibold">Reporter · SAHARA</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Email", value: profile.email },
              { label: "Phone", value: profile.phone },
              { label: "Location", value: profile.location },
              { label: "Occupation", value: profile.occupation },
            ].map(f => (
              <div key={f.label} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                <p className="text-sm text-gray-700 font-medium">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activityLog.map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-50/40 transition-colors">
              <span className="text-lg leading-tight">{a.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{a.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: "overview", icon: LayoutDashboard, label: "Dashboard" },
  { page: "tasks", icon: ClipboardList, label: "Tasks" },
  { page: "proofs", icon: ShieldCheck, label: "Proof Verification" },
  { page: "issues", icon: AlertTriangle, label: "Issues" },
  { page: "reports", icon: BarChart2, label: "Reports" },
  { page: "communication", icon: MessageSquare, label: "Communication" },
  { page: "profile", icon: User, label: "Profile" },
];

export default function ReporterDashboard() {
  const [activePage, setActivePage] = useState<Page>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const profile = getReporterProfile();

  const unreadCount = notifications.filter(n => !n.read).length;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-5"}`}>
      <div className="flex items-center gap-2.5 mb-8">
        <img src={saharaLogo} alt="SAHARA" className="w-9 h-9 object-contain" />
        <span className="text-lg font-black tracking-tight" style={{ color: ORANGE }}>SAHARA</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={18} /></button>
        )}
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ page, icon: Icon, label }) => (
          <button key={page} onClick={() => { setActivePage(page); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activePage === page ? "text-white shadow-sm" : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"}`}
            style={activePage === page ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
      <button onClick={() => { window.location.href = "/"; }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all mt-4">
        <LogOut size={17} /> Logout
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-[Poppins,sans-serif]">
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 shrink-0 shadow-sm">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between gap-3 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-orange-500 transition-colors">
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-gray-800 text-base">{NAV_ITEMS.find(n => n.page === activePage)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)}
                className="relative p-2 rounded-xl hover:bg-orange-50 transition-colors text-gray-500">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ background: ORANGE }}>{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-bold text-sm text-gray-800">Notifications</span>
                    <button onClick={markAllRead} className="text-xs text-orange-500 font-semibold hover:underline">Mark all read</button>
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
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white`}
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-800 leading-tight">{profile.name}</p>
                <p className="text-[10px] text-orange-500 font-semibold">Reporter</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">
          {activePage === "overview" && <OverviewPage />}
          {activePage === "tasks" && <TasksPage />}
          {activePage === "proofs" && <ProofsPage />}
          {activePage === "issues" && <IssuesPage />}
          {activePage === "reports" && <ReportsPage />}
          {activePage === "communication" && <CommunicationPage />}
          {activePage === "profile" && <ProfilePage />}
        </main>
      </div>
      {notifOpen && <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />}
    </div>
  );
}
