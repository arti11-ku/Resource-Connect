import { useState, useEffect, useCallback } from "react";
import { apiFetch, type BackendTask } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeDown, FadeUp, FadeIn, StaggerList, StaggerItem, HoverCard,
  MountFade, SlideInHeader, chartTooltipStyle, chartTooltipCursor
} from "../lib/AnimatedComponents";
import {
  LayoutDashboard, Building2, ClipboardList, Users, ShieldCheck,
  Package, LogOut, Bell, Menu, X, Plus, Pencil, Save, Trash2,
  CheckCircle2, XCircle, Clock, Eye, Upload, Search, ChevronDown,
  FileText, User, AlertCircle, Sparkles, Zap, Image as ImageIcon,
  TrendingUp, Activity, Target, MapPin, Settings as SettingsIcon
} from "lucide-react";
import SettingsPage from "../components/SettingsPage";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";
import AIChatbot from "../components/AIChatbot";
import ImageMarquee from "../components/ImageMarquee";
import FloatingBackground from "../components/FloatingBackground";
import { dashboardGalleryImages } from "../lib/dashboardGallery";
import { allocateTasks, predictPriority, verifyProof, type AIAllocation } from "../lib/ai";
import { loadReviewImages, subscribeToReviewImages, type ReviewImage, type ReviewCategory } from "../lib/smartReviewStore";

const ORANGE = "#FF7A00";
const ORANGE_LIGHT = "#FF9A40";

// ─── Types ───────────────────────────────────────────────────────────────────
type Page = "overview" | "profile" | "register" | "volunteers" | "tasks" | "proofs" | "resources" | "settings";
type TaskStatus = "assigned" | "in-progress" | "completed";
type ProofStatus = "pending" | "approved" | "rejected";
type ResourceStatus = "available" | "allocated" | "depleted";

interface NgoProfile {
  ngoName: string;
  adminName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  registrationId: string;
}

interface NgoRegistration {
  id: number;
  ngoName: string;
  registrationNumber: string;
  address: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface Volunteer {
  id: number;
  name: string;
  contact: string;
  skills: string[];
  availability: string;
  assignedTask?: string;
}

interface Task {
  id: number | string;
  title: string;
  description: string;
  deadline: string;
  priority: "low" | "medium" | "high";
  status: TaskStatus;
  assignedTo: string;
}

function backendStatusToNgo(s: BackendTask["status"]): TaskStatus {
  if (s === "completed") return "completed";
  if (s === "in_progress") return "in-progress";
  return "assigned";
}

function backendTaskToNgo(t: BackendTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description || "",
    deadline: t.deadline ? new Date(t.deadline).toLocaleDateString() : "",
    priority: t.priority,
    status: backendStatusToNgo(t.status),
    assignedTo: t.assigned_to || "",
  };
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
  category: ReviewCategory;
}

interface Resource {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  status: ResourceStatus;
  category: string;
}

interface Notification {
  id: number;
  icon: string;
  message: string;
  time: string;
  read: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getNgoProfile(): NgoProfile {
  try {
    const saved = localStorage.getItem("sahara_user");
    if (saved) {
      const u = JSON.parse(saved);
      if (u.name) return {
        ngoName: u.ngoName || "Sahara NGO",
        adminName: u.name,
        email: u.email || "admin@sahara-ngo.org",
        phone: u.phone || "+91 98765 00000",
        address: u.city && u.state ? `${u.city}, ${u.state}` : "Mumbai, Maharashtra",
        description: u.description || "Dedicated to humanitarian aid, education, and community development across India.",
        registrationId: u.registrationId || "NGO-MH-2024-0042",
      };
    }
  } catch {}
  return {
    ngoName: "Sahara NGO",
    adminName: "Ananya Kapoor",
    email: "admin@sahara-ngo.org",
    phone: "+91 98765 00000",
    address: "Mumbai, Maharashtra",
    description: "Dedicated to humanitarian aid, education, and community development across India.",
    registrationId: "NGO-MH-2024-0042",
  };
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

function ScoreBar({ label, value, color, suffix }: { label: string; value: number; color: string; suffix?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5">
        <span>{label}</span>
        <span className="font-semibold text-gray-700">{suffix ?? `${pct}%`}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string; onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -3, boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-orange-50 ${onClick ? "cursor-pointer" : ""}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-orange-500 font-medium mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INIT_VOLUNTEERS: Volunteer[] = [
  { id: 1, name: "Priya Sharma", contact: "+91 98100 11111", skills: ["First Aid", "Teaching"], availability: "Weekends", assignedTask: "Food Distribution" },
  { id: 2, name: "Aarav Patel", contact: "+91 98200 22222", skills: ["Driving", "Logistics"], availability: "Full Time", assignedTask: "Medical Camp" },
  { id: 3, name: "Sneha Reddy", contact: "+91 98300 33333", skills: ["Counselling", "Teaching"], availability: "Evenings" },
  { id: 4, name: "Rohan Mehta", contact: "+91 98400 44444", skills: ["Construction", "Plumbing"], availability: "Weekends" },
  { id: 5, name: "Deepika Nair", contact: "+91 98500 55555", skills: ["Nursing", "First Aid"], availability: "Full Time", assignedTask: "Blood Donation Drive" },
];

const INIT_TASKS: Task[] = [
  { id: 1, title: "Food Distribution Drive", description: "Distribute food packets to flood-affected families.", deadline: "Apr 25, 2026", priority: "high", status: "in-progress", assignedTo: "Priya Sharma" },
  { id: 2, title: "Free Medical Camp", description: "Conduct health check-ups at Dharavi community center.", deadline: "Apr 28, 2026", priority: "high", status: "assigned", assignedTo: "Aarav Patel" },
  { id: 3, title: "Literacy Workshop", description: "Basic literacy sessions for underprivileged adults.", deadline: "May 2, 2026", priority: "medium", status: "assigned", assignedTo: "Sneha Reddy" },
  { id: 4, title: "Blood Donation Camp", description: "Coordinate donation drives across the city.", deadline: "May 5, 2026", priority: "medium", status: "completed", assignedTo: "Deepika Nair" },
  { id: 5, title: "Tree Plantation Drive", description: "Plant 200 saplings at Sanjay Gandhi National Park.", deadline: "May 8, 2026", priority: "low", status: "assigned", assignedTo: "Rohan Mehta" },
];

const INIT_PROOFS: Proof[] = [
  { id: 1, taskId: 4, taskTitle: "Blood Donation Camp", volunteer: "Deepika Nair", fileName: "donation_proof.jpg", fileType: "image", uploadedAt: "May 5 · 4:30 PM", status: "pending", comment: "", emoji: "🩸", category: "blood" },
  { id: 2, taskId: 1, taskTitle: "Food Distribution Drive", volunteer: "Priya Sharma", fileName: "distribution_photo.jpg", fileType: "image", uploadedAt: "Apr 23 · 2:00 PM", status: "approved", comment: "Well documented, great work!", emoji: "🍱", category: "food" },
  { id: 3, taskId: 2, taskTitle: "Free Medical Camp", volunteer: "Aarav Patel", fileName: "camp_report.pdf", fileType: "document", uploadedAt: "Apr 20 · 11:00 AM", status: "rejected", comment: "Report is incomplete, please resubmit.", emoji: "🏥", category: "other" },
  { id: 4, taskId: 5, taskTitle: "Tree Plantation Drive", volunteer: "Rohan Mehta", fileName: "saplings.jpg", fileType: "image", uploadedAt: "May 8 · 10:15 AM", status: "pending", comment: "", emoji: "🌳", category: "tree" },
];

const INIT_RESOURCES: Resource[] = [
  { id: 1, name: "Food Packets", quantity: 500, unit: "packs", status: "available", category: "Food" },
  { id: 2, name: "Medical Kits", quantity: 80, unit: "kits", status: "allocated", category: "Health" },
  { id: 3, name: "Blankets", quantity: 200, unit: "pieces", status: "available", category: "Relief" },
  { id: 4, name: "Water Bottles", quantity: 0, unit: "bottles", status: "depleted", category: "Food" },
  { id: 5, name: "School Stationery", quantity: 150, unit: "sets", status: "available", category: "Education" },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "📸", message: "Deepika Nair uploaded proof for 'Blood Donation Camp'", time: "10 mins ago", read: false },
  { id: 2, icon: "✅", message: "Task 'Blood Donation Camp' marked as completed", time: "1 hour ago", read: false },
  { id: 3, icon: "⚠️", message: "Resource 'Water Bottles' is depleted", time: "3 hours ago", read: false },
  { id: 4, icon: "🆕", message: "New volunteer Deepika Nair joined the team", time: "Yesterday", read: true },
  { id: 5, icon: "📋", message: "NGO registration submitted — pending approval", time: "2 days ago", read: true },
];

const CHART_TASKS = [
  { name: "Apr 17", active: 2, completed: 1 },
  { name: "Apr 18", active: 3, completed: 2 },
  { name: "Apr 19", active: 2, completed: 3 },
  { name: "Apr 20", active: 4, completed: 2 },
  { name: "Apr 21", active: 3, completed: 4 },
  { name: "Apr 22", active: 2, completed: 3 },
];

const CHART_RESOURCES = [
  { name: "Food", value: 35, color: "#22c55e" },
  { name: "Health", value: 25, color: ORANGE },
  { name: "Relief", value: 20, color: "#3b82f6" },
  { name: "Education", value: 20, color: "#a855f7" },
];

const PRIORITY_CONFIG: Record<Task["priority"], { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "text-red-600", bg: "bg-red-100" },
  medium: { label: "Medium", color: "text-orange-600", bg: "bg-orange-100" },
  low: { label: "Low", color: "text-green-600", bg: "bg-green-100" },
};

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  assigned: { label: "Assigned", color: "text-blue-600", bg: "bg-blue-100" },
  "in-progress": { label: "In Progress", color: "text-orange-600", bg: "bg-orange-100" },
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-100" },
};

const RESOURCE_STATUS_CONFIG: Record<ResourceStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "text-green-600", bg: "bg-green-100" },
  allocated: { label: "Allocated", color: "text-orange-600", bg: "bg-orange-100" },
  depleted: { label: "Depleted", color: "text-red-600", bg: "bg-red-100" },
};

// ─── Overview Page ────────────────────────────────────────────────────────────
function OverviewPage({ volunteers, tasks, resources, onNavigate }: {
  volunteers: Volunteer[]; tasks: Task[]; resources: Resource[]; onNavigate: (p: Page) => void;
}) {
  const activeTasks = tasks.filter(t => t.status === "in-progress").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status === "assigned").length;
  const totalResources = resources.reduce((s, r) => s + r.quantity, 0);

  const resourcePie = [
    { name: "Available", value: resources.filter(r => r.status === "available").length, color: "#22c55e" },
    { name: "Allocated", value: resources.filter(r => r.status === "allocated").length, color: ORANGE },
    { name: "Depleted", value: resources.filter(r => r.status === "depleted").length, color: "#ef4444" },
  ];

  return (
    <MountFade className="space-y-6">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">NGO Dashboard Overview</h2>
        <p className="text-sm text-gray-400">Monitor tasks, volunteers, and resources at a glance.</p>
      </FadeIn>

      <StaggerList className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: ClipboardList, label: "Active Tasks", value: activeTasks, sub: "Currently running", color: "bg-orange-500", page: "tasks" as Page },
          { icon: CheckCircle2, label: "Completed", value: completedTasks, sub: "This week", color: "bg-green-500", page: "tasks" as Page },
          { icon: Clock, label: "Pending", value: pendingTasks, sub: "Awaiting start", color: "bg-blue-500", page: "tasks" as Page },
          { icon: Users, label: "Volunteers", value: volunteers.length, sub: "Registered", color: "bg-purple-500", page: "volunteers" as Page },
          { icon: Package, label: "Resources", value: totalResources, sub: "Total units", color: "bg-teal-500", page: "resources" as Page },
        ].map(({ icon, label, value, sub, color, page }) => (
          <StaggerItem key={label}>
            <StatCard icon={icon} label={label} value={value} sub={sub} color={color} onClick={() => onNavigate(page)} />
          </StaggerItem>
        ))}
      </StaggerList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeUp>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <h3 className="font-bold text-gray-800 mb-4">Task Progress — Bar Chart</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CHART_TASKS} barSize={14}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={chartTooltipCursor} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                <Bar dataKey="active" fill={ORANGE} name="Active" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="#22c55e" name="Completed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </HoverCard>
        </FadeUp>

        <FadeDown delay={0.08}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <h3 className="font-bold text-gray-800 mb-3">Resource Distribution — Pie Chart</h3>
            <div className="flex items-center gap-6">
              <div style={{ transform: "perspective(320px) rotateX(28deg)", transformOrigin: "center bottom" }}>
                <PieChart width={160} height={130}>
                  <Pie data={CHART_RESOURCES} cx="50%" cy="55%" innerRadius={36} outerRadius={56} dataKey="value" paddingAngle={3}>
                    {CHART_RESOURCES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value, name) => {
                    const total = CHART_RESOURCES.reduce((s, r) => s + r.value, 0);
                    return [`${value} (${Math.round((Number(value) / total) * 100)}%)`, name];
                  }} />
                </PieChart>
              </div>
              <div className="space-y-2 flex-1">
                {CHART_RESOURCES.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-gray-600">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {resourcePie.map(r => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="text-xs text-gray-600">{r.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{r.value} resources</span>
                </div>
              ))}
            </div>
          </HoverCard>
        </FadeDown>
      </div>

      <FadeUp delay={0.1}>
        <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {tasks.slice(0, 4).map(t => {
              const sc = TASK_STATUS_CONFIG[t.status];
              const pc = PRIORITY_CONFIG[t.priority];
              return (
                <motion.div key={t.id}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-orange-50/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Assigned to {t.assignedTo} · {t.deadline}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pc.bg} ${pc.color}`}>{pc.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </HoverCard>
      </FadeUp>

      <FadeUp delay={0.18}>
        <ImageMarquee images={dashboardGalleryImages} />
      </FadeUp>
    </MountFade>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage() {
  const [profile, setProfile] = useState<NgoProfile>(getNgoProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  function handleSave() {
    setProfile(draft);
    try {
      const saved = localStorage.getItem("sahara_user");
      const u = saved ? JSON.parse(saved) : {};
      localStorage.setItem("sahara_user", JSON.stringify({ ...u, ...draft, name: draft.adminName }));
    } catch {}
    setEditing(false);
  }

  const initials = profile.adminName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <MountFade className="space-y-5 max-w-2xl">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">NGO Profile</h2>
        <p className="text-sm text-gray-400">Your organisation's profile and account details.</p>
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
                  <p className="text-xl font-bold text-gray-900">{profile.ngoName}</p>
                  <p className="text-sm font-semibold" style={{ color: ORANGE }}>NGO · SAHARA</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => editing ? (setDraft(profile), setEditing(false)) : setEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${editing ? "bg-gray-100 text-gray-600" : "text-white"}`}
                style={!editing ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
                <Pencil size={14} /> {editing ? "Cancel" : "Edit Profile"}
              </motion.button>
            </div>

            {editing ? (
              <div className="space-y-3">
                {[
                  { label: "NGO Name", key: "ngoName" },
                  { label: "Admin Name", key: "adminName" },
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "phone" },
                  { label: "Address", key: "address" },
                  { label: "Registration ID", key: "registrationId" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                    <input value={(draft as Record<string, string>)[key]}
                      onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                  <textarea value={draft.description}
                    onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-2"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                  <Save size={15} /> Save Changes
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-0.5">Description</p>
                  <p className="text-sm text-gray-700">{profile.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Admin Name", value: profile.adminName },
                    { label: "Email", value: profile.email },
                    { label: "Phone", value: profile.phone },
                    { label: "Address", value: profile.address },
                    { label: "Registration ID", value: profile.registrationId },
                  ].map(f => (
                    <div key={f.label} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                      <p className="text-sm text-gray-700 font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeUp>
    </MountFade>
  );
}

// ─── Register NGO Page ────────────────────────────────────────────────────────
function RegisterNgoPage() {
  const [registrations, setRegistrations] = useState<NgoRegistration[]>([
    { id: 1, ngoName: "Sahara NGO", registrationNumber: "NGO-MH-2024-0042", address: "Mumbai, Maharashtra", type: "Health", status: "approved", submittedAt: "Mar 15, 2026" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ngoName: "", registrationNumber: "", address: "", type: "Education", document: "" });

  function handleSubmit() {
    if (!form.ngoName.trim() || !form.registrationNumber.trim()) return;
    const newReg: NgoRegistration = {
      id: Date.now(), ...form, status: "pending",
      submittedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
    setRegistrations(prev => [newReg, ...prev]);
    setForm({ ngoName: "", registrationNumber: "", address: "", type: "Education", document: "" });
    setShowForm(false);
  }

  const statusColor: Record<NgoRegistration["status"], string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <MountFade className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FadeIn>
          <h2 className="text-xl font-bold text-gray-900 mb-1">NGO Registration</h2>
          <p className="text-sm text-gray-400">Register your organisation and track approval status.</p>
        </FadeIn>
        <motion.button onClick={() => setShowForm(v => !v)}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
          <Plus size={16} /> Register Your NGO
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
            <h3 className="font-bold text-gray-800 mb-4">New NGO Registration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "NGO Name *", key: "ngoName", placeholder: "Enter NGO name" },
                { label: "Registration Number *", key: "registrationNumber", placeholder: "e.g. NGO-MH-2026-XXXX" },
                { label: "Address", key: "address", placeholder: "City, State" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                  <input value={(form as Record<string, string>)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">NGO Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {["Education", "Health", "Food", "Environment", "Disaster Relief", "Women Empowerment", "Other"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Document / Image Upload</label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-orange-200 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all">
                  <Upload size={16} className="text-orange-400" />
                  <span className="text-sm text-gray-500">{form.document || "Click to upload registration document"}</span>
                  <input type="file" className="hidden" onChange={e => setForm(f => ({ ...f, document: e.target.files?.[0]?.name || "" }))} />
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>Submit Registration</motion.button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerList className="space-y-3">
        {registrations.map(r => (
          <StaggerItem key={r.id}>
            <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-bold text-gray-900 text-base">{r.ngoName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Reg. No: {r.registrationNumber}</p>
                  <p className="text-xs text-gray-400">{r.address} · {r.type}</p>
                  <p className="text-xs text-gray-300 mt-1">Submitted: {r.submittedAt}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor[r.status]}`}>{r.status}</span>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerList>
    </MountFade>
  );
}

// ─── Volunteer Management Page ────────────────────────────────────────────────
function VolunteersPage({ volunteers, setVolunteers, tasks }: {
  volunteers: Volunteer[]; setVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>; tasks: Task[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", contact: "", skills: "", availability: "Weekends" });
  const [search, setSearch] = useState("");
  const [assignModal, setAssignModal] = useState<Volunteer | null>(null);

  const filtered = volunteers.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSubmit() {
    if (!form.name.trim()) return;
    const skillsArr = form.skills.split(",").map(s => s.trim()).filter(Boolean);
    if (editId !== null) {
      setVolunteers(prev => prev.map(v => v.id === editId ? { ...v, name: form.name, contact: form.contact, skills: skillsArr, availability: form.availability } : v));
      setEditId(null);
    } else {
      setVolunteers(prev => [...prev, { id: Date.now(), name: form.name, contact: form.contact, skills: skillsArr, availability: form.availability }]);
    }
    setForm({ name: "", contact: "", skills: "", availability: "Weekends" });
    setShowForm(false);
  }

  function startEdit(v: Volunteer) {
    setForm({ name: v.name, contact: v.contact, skills: v.skills.join(", "), availability: v.availability });
    setEditId(v.id);
    setShowForm(true);
  }

  function handleDelete(id: number) {
    setVolunteers(prev => prev.filter(v => v.id !== id));
  }

  function handleAssign(volunteer: Volunteer, taskTitle: string) {
    setVolunteers(prev => prev.map(v => v.id === volunteer.id ? { ...v, assignedTask: taskTitle } : v));
    setAssignModal(null);
  }

  return (
    <MountFade className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FadeIn>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Volunteer Management</h2>
          <p className="text-sm text-gray-400">Manage your team of volunteers.</p>
        </FadeIn>
        <motion.button onClick={() => { setEditId(null); setForm({ name: "", contact: "", skills: "", availability: "Weekends" }); setShowForm(v => !v); }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
          <Plus size={16} /> Add Volunteer
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
            <h3 className="font-bold text-gray-800 mb-4">{editId !== null ? "Edit Volunteer" : "Add New Volunteer"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Contact</label>
                <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Skills (comma separated)</label>
                <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  placeholder="First Aid, Teaching, Driving" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Availability</label>
                <select value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {["Weekends", "Evenings", "Full Time", "On Call"].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                {editId !== null ? "Save Changes" : "Add Volunteer"}
              </motion.button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search volunteers or skills..."
          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
      </div>

      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(v => (
          <StaggerItem key={v.id}>
            <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
              <div className="flex items-start gap-3">
                <Avatar name={v.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{v.name}</p>
                  <p className="text-xs text-gray-400">{v.contact}</p>
                  <p className="text-xs text-gray-400 mt-0.5">⏱ {v.availability}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {v.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">{s}</span>
                    ))}
                  </div>
                  {v.assignedTask && (
                    <p className="text-xs text-blue-600 font-medium mt-1.5">📌 {v.assignedTask}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={() => startEdit(v)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors flex items-center justify-center gap-1">
                  <Pencil size={11} /> Edit
                </motion.button>
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={() => setAssignModal(v)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                  <ClipboardList size={11} /> Assign
                </motion.button>
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={() => handleDelete(v.id)}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center">
                  <Trash2 size={11} />
                </motion.button>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerList>

      <AnimatePresence>
        {assignModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setAssignModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-gray-800 mb-1">Assign Task</h3>
              <p className="text-sm text-gray-400 mb-4">Select a task for {assignModal.name}</p>
              <div className="space-y-2">
                {tasks.filter(t => t.status !== "completed").map(t => (
                  <motion.button key={t.id} whileHover={{ x: 4 }}
                    onClick={() => handleAssign(assignModal, t.title)}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all">
                    <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.deadline}</p>
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setAssignModal(null)} className="w-full mt-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MountFade>
  );
}

// ─── Task Management Page ─────────────────────────────────────────────────────
function TasksPage({ tasks, setTasks, volunteers }: {
  tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; volunteers: Volunteer[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<Task["id"] | null>(null);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", priority: "medium" as Task["priority"], assignedTo: "" });
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [aiAllocations, setAiAllocations] = useState<AIAllocation[] | null>(null);
  const [aiRunning, setAiRunning] = useState(false);

  const filtered = tasks.filter(t => statusFilter === "all" || t.status === statusFilter);

  // Live AI suggestion for the form's priority based on title/description/deadline.
  const aiSuggestion = form.title.trim()
    ? predictPriority({
        id: "draft",
        title: form.title,
        description: form.description,
        deadline: form.deadline || undefined,
      })
    : null;

  // Auto-allocate unassigned tasks to available volunteers.
  function runAIAllocation() {
    setAiRunning(true);
    const unassigned = tasks.filter(t => !t.assignedTo || t.assignedTo.trim() === "");
    const result = allocateTasks(
      unassigned.map(t => ({
        id: t.id, title: t.title, description: t.description,
        deadline: t.deadline, requiredSkills: [],
      })),
      volunteers.map(v => ({
        id: v.id, name: v.name, skills: v.skills,
        availability: v.availability, assignedTask: v.assignedTask,
        rating: 4.0 + ((v.id * 7) % 10) / 10,
      }))
    );
    // Apply assignments locally so the UI reflects changes.
    setTasks(prev => prev.map(t => {
      const a = result.find(r => r.taskId === t.id && r.volunteerName);
      return a ? { ...t, assignedTo: a.volunteerName ?? t.assignedTo } : t;
    }));
    setAiAllocations(result);
    setTimeout(() => setAiRunning(false), 400);
  }

  const refreshTasks = useCallback(async () => {
    try {
      const data = await apiFetch<BackendTask[]>("/tasks/ngo");
      setTasks(data.map(backendTaskToNgo));
    } catch {
      // keep current list on error
    }
  }, [setTasks]);

  useEffect(() => { refreshTasks(); }, [refreshTasks]);

  async function handleSubmit() {
    if (!form.title.trim() || submitting) return;
    setSubmitError(null);

    if (editId !== null) {
      setTasks(prev => prev.map(t => t.id === editId ? { ...t, ...form } : t));
      setEditId(null);
      setForm({ title: "", description: "", deadline: "", priority: "medium", assignedTo: "" });
      setShowForm(false);
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch<BackendTask>("/tasks/create", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: "",
          required_skills: [],
          deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
          priority: form.priority,
        }),
      });
      await refreshTasks();
      setForm({ title: "", description: "", deadline: "", priority: "medium", assignedTo: "" });
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(t: Task) {
    setForm({ title: t.title, description: t.description, deadline: t.deadline, priority: t.priority, assignedTo: t.assignedTo });
    setEditId(t.id);
    setShowForm(true);
  }

  function advanceStatus(id: Task["id"]) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: TaskStatus = t.status === "assigned" ? "in-progress" : t.status === "in-progress" ? "completed" : "completed";
      return { ...t, status: next };
    }));
  }

  function handleDelete(id: Task["id"]) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  // Chart data derived from current tasks
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const pendingCount = tasks.filter(t => t.status !== "completed").length;
  const statusBarData = [
    { name: "Completed", value: completedCount, fill: "#22c55e" },
    { name: "In Progress", value: tasks.filter(t => t.status === "in-progress").length, fill: ORANGE },
    { name: "Assigned", value: tasks.filter(t => t.status === "assigned").length, fill: "#3b82f6" },
  ];
  const priorityPieData = (["high", "medium", "low"] as const).map(p => ({
    name: p[0].toUpperCase() + p.slice(1),
    value: tasks.filter(t => t.priority === p).length,
    color: p === "high" ? "#ef4444" : p === "medium" ? ORANGE : "#22c55e",
  })).filter(d => d.value > 0);
  const categoryAreaData = [
    { name: "Mon", food: 3, blood: 2, trees: 1 },
    { name: "Tue", food: 4, blood: 3, trees: 2 },
    { name: "Wed", food: 2, blood: 4, trees: 3 },
    { name: "Thu", food: 5, blood: 2, trees: 4 },
    { name: "Fri", food: 4, blood: 5, trees: 2 },
    { name: "Sat", food: 6, blood: 3, trees: 5 },
    { name: "Sun", food: 3, blood: 4, trees: 4 },
  ];

  return (
    <MountFade className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FadeIn>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Task Management</h2>
          <p className="text-sm text-gray-400">Create, assign, and track tasks for your volunteers.</p>
        </FadeIn>
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button onClick={runAIAllocation} disabled={aiRunning}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-orange-400 text-orange-600 bg-white hover:bg-orange-50 disabled:opacity-60">
            <Sparkles size={16} /> {aiRunning ? "Running…" : "Run AI Allocation"}
          </motion.button>
          <motion.button onClick={() => { setEditId(null); setForm({ title: "", description: "", deadline: "", priority: "medium", assignedTo: "" }); setShowForm(v => !v); }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <Plus size={16} /> Create Task
          </motion.button>
        </div>
      </div>

      {/* ─── Data Visualization Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FadeUp>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-orange-500" />
              <h3 className="font-bold text-gray-800 text-sm">Tasks by Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={statusBarData} barSize={28}>
                <defs>
                  <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#16a34a" /></linearGradient>
                  <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ORANGE_LIGHT} /><stop offset="100%" stopColor={ORANGE} /></linearGradient>
                  <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={chartTooltipCursor} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusBarData.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? "url(#barGreen)" : i === 1 ? "url(#barOrange)" : "url(#barBlue)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </HoverCard>
        </FadeUp>

        <FadeUp delay={0.05}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-orange-500" />
              <h3 className="font-bold text-gray-800 text-sm">Priority Distribution</h3>
            </div>
            <div className="flex items-center gap-3" style={{ minHeight: 170 }}>
              <div style={{ transform: "perspective(360px) rotateX(28deg)", transformOrigin: "center bottom" }}>
                <PieChart width={160} height={140}>
                  <defs>
                    {priorityPieData.map((s, i) => (
                      <linearGradient id={`pieGrad${i}`} key={i} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie data={priorityPieData} cx="50%" cy="55%" innerRadius={36} outerRadius={62} dataKey="value" paddingAngle={4}>
                    {priorityPieData.map((_, i) => <Cell key={i} fill={`url(#pieGrad${i})`} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </div>
              <div className="flex-1 space-y-2">
                {priorityPieData.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-xs text-gray-600">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </HoverCard>
        </FadeUp>

        <FadeUp delay={0.1}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 h-full">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-orange-500" />
              <h3 className="font-bold text-gray-800 text-sm">Category Trend (this week)</h3>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={categoryAreaData}>
                <defs>
                  <linearGradient id="areaFood" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ORANGE} stopOpacity={0.5} /><stop offset="100%" stopColor={ORANGE} stopOpacity={0} /></linearGradient>
                  <linearGradient id="areaBlood" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="areaTrees" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={chartTooltipCursor} />
                <Area type="monotone" dataKey="food" stroke={ORANGE} fill="url(#areaFood)" strokeWidth={2} />
                <Area type="monotone" dataKey="blood" stroke="#ef4444" fill="url(#areaBlood)" strokeWidth={2} />
                <Area type="monotone" dataKey="trees" stroke="#22c55e" fill="url(#areaTrees)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </HoverCard>
        </FadeUp>
      </div>

      <AnimatePresence>
        {aiAllocations && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-5 shadow-md border-2 border-orange-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${ORANGE}, transparent 60%)` }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-800">AI Smart Allocation</h3>
                    <p className="text-[11px] text-gray-500">Best matches based on skills, location & availability</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wide ml-2">
                    {aiAllocations.filter(a => a.volunteerName).length}/{aiAllocations.length} matched
                  </span>
                </div>
                <button onClick={() => setAiAllocations(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={16} /></button>
              </div>
              {aiAllocations.length === 0 ? (
                <p className="text-xs text-gray-400">All tasks already have an assignee — nothing to allocate.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiAllocations.map((a, idx) => (
                    <motion.div
                      key={String(a.taskId)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-xl border ${a.volunteerName ? "bg-gradient-to-br from-orange-50 to-white border-orange-200" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Zap size={14} className="text-orange-500 shrink-0" />
                          <p className="font-bold text-gray-800 text-sm truncate">{a.taskTitle}</p>
                        </div>
                        {a.volunteerName && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shrink-0">
                            {a.score}/100
                          </span>
                        )}
                      </div>
                      {a.volunteerName ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                              {a.volunteerName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                            </div>
                            <p className="text-xs font-semibold text-gray-700">{a.volunteerName}</p>
                          </div>
                          <div className="space-y-1.5">
                            <ScoreBar label="Skill match" value={a.skillPct} color="#22c55e" />
                            <ScoreBar label="Distance" value={Math.max(0, 100 - a.distanceKm * 3)} color="#3b82f6" suffix={`${a.distanceKm}km`} />
                            <ScoreBar label="Rating" value={(a.rating / 5) * 100} color={ORANGE} suffix={`${a.rating.toFixed(1)}★`} />
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 italic">{a.reason}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
            <h3 className="font-bold text-gray-800 mb-4">{editId !== null ? "Edit Task" : "Create New Task"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Task title" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Assign To</label>
                <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  <option value="">Select volunteer</option>
                  {volunteers.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block flex items-center justify-between">
                  <span>Priority</span>
                  {aiSuggestion && aiSuggestion.priority !== form.priority && (
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, priority: aiSuggestion.priority }))}
                      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold normal-case tracking-normal hover:bg-orange-200">
                      <Sparkles size={10} /> AI suggests: {aiSuggestion.priority}
                    </button>
                  )}
                </label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task["priority"] }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {aiSuggestion && (
                  <p className="text-[10px] text-gray-400 mt-1 italic">💡 {aiSuggestion.reason}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Brief description of the task..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none" />
              </div>
            </div>
            {submitError && (
              <p className="mt-3 text-xs text-red-500">{submitError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <motion.button whileHover={!submitting ? { scale: 1.03 } : {}} whileTap={!submitting ? { scale: 0.97 } : {}} onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                {submitting ? "Saving..." : editId !== null ? "Save Changes" : "Create Task"}
              </motion.button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 flex-wrap">
        {(["all", "assigned", "in-progress", "completed"] as const).map(s => (
          <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
            style={statusFilter === s ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            {s === "all" ? "All" : s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </motion.button>
        ))}
      </div>

      <StaggerList className="space-y-3">
        {filtered.map(t => {
          const sc = TASK_STATUS_CONFIG[t.status];
          const pc = PRIORITY_CONFIG[t.priority];
          return (
            <StaggerItem key={t.id}>
              <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800">{t.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pc.bg} ${pc.color}`}>{pc.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.description}</p>
                    <p className="text-xs text-gray-400 mt-1">👤 {t.assignedTo || "Unassigned"} · 📅 {t.deadline}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {t.status !== "completed" && (
                      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        onClick={() => advanceStatus(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1"
                        style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                        <CheckCircle2 size={11} />
                        {t.status === "assigned" ? "Start" : "Complete"}
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => startEdit(t)}
                      className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">
                      <Pencil size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => handleDelete(t.id)}
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
    </MountFade>
  );
}

// ─── Proof Verification Page ──────────────────────────────────────────────────
function ProofsPage({ proofs, setProofs }: { proofs: Proof[]; setProofs: React.Dispatch<React.SetStateAction<Proof[]>> }) {
  const [previewProof, setPreviewProof] = useState<Proof | null>(null);
  const [comment, setComment] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProofStatus | "all">("all");
  const [reviewImages, setReviewImages] = useState<ReviewImage[]>(() => loadReviewImages());

  useEffect(() => {
    const unsubscribe = subscribeToReviewImages(() => setReviewImages(loadReviewImages()));
    return unsubscribe;
  }, []);

  // Map proof → matching review image (by category, then any image)
  function imageForProof(p: Proof): ReviewImage | null {
    const matches = reviewImages.filter(i => i.category === p.category);
    if (matches.length > 0) {
      // Pick deterministic image based on proof.id so same proof always shows same image
      return matches[p.id % matches.length];
    }
    return null;
  }

  function handleDecision(id: number, decision: "approved" | "rejected", commentText: string) {
    setProofs(prev => prev.map(p => p.id === id ? { ...p, status: decision, comment: commentText } : p));
    setPreviewProof(null);
    setComment("");
  }

  const filtered = proofs.filter(p => filterStatus === "all" || p.status === filterStatus);

  const statusColor: Record<ProofStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const categoryGradient: Record<ReviewCategory, string> = {
    blood: "from-red-100 to-pink-50",
    tree: "from-green-100 to-emerald-50",
    food: "from-amber-100 to-orange-50",
    other: "from-slate-100 to-gray-50",
  };

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Proof Verification</h2>
        <p className="text-sm text-gray-400">
          Review and approve or reject volunteer proof submissions. Images sourced from the Reporter Smart Review gallery.
        </p>
      </FadeIn>

      {reviewImages.length === 0 && (
        <FadeUp>
          <div className="rounded-2xl p-4 border border-orange-200 bg-orange-50/60 text-xs text-orange-700 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>No proof images uploaded yet. Ask a Reporter to upload images via <strong>Reports → Smart Review Gallery</strong> — they'll appear here automatically, categorized by activity type.</span>
          </div>
        </FadeUp>
      )}

      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map(s => (
          <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterStatus === s ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
            style={filterStatus === s ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </motion.button>
        ))}
      </div>

      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const img = imageForProof(p);
          const ai = verifyProof(p.fileName, p.fileType);
          const aiCls = ai.status === "verified" ? "bg-green-100 text-green-700"
            : ai.status === "suspicious" ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700";
          const aiLabel = ai.status === "verified" ? "AI: Verified" : ai.status === "suspicious" ? "AI: Suspicious" : "Pending AI Check";

          return (
            <StaggerItem key={p.id}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(255,122,0,0.15)" }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden cursor-pointer"
                onClick={() => { setPreviewProof(p); setComment(p.comment); }}>
                <div className={`relative h-44 bg-gradient-to-br ${categoryGradient[p.category]} flex items-center justify-center overflow-hidden`}>
                  {img ? (
                    <img src={img.src} alt={p.taskTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center px-3">
                      <span className="text-5xl mb-1">{p.emoji}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{p.fileType}</span>
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shadow-sm ${statusColor[p.status]}`}>{p.status}</span>
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm bg-white/90 text-gray-700`}>{p.category}</span>
                  <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-sm">
                    <Eye size={14} />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{p.taskTitle}</p>
                  </div>
                  <p className="text-xs text-gray-500">👤 {p.volunteer}</p>
                  <p className="text-xs text-gray-400">{p.uploadedAt}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${aiCls}`}>
                    <Sparkles size={9} /> {aiLabel} · {ai.confidence}%
                  </span>
                  {p.comment && (
                    <p className="text-xs italic text-gray-500 line-clamp-2">💬 "{p.comment}"</p>
                  )}

                  {p.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={(e) => { e.stopPropagation(); handleDecision(p.id, "approved", p.comment); }}
                        className="flex-1 py-1.5 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600">
                        <CheckCircle2 size={11} /> Approve
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={(e) => { e.stopPropagation(); handleDecision(p.id, "rejected", p.comment); }}
                        className="flex-1 py-1.5 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600">
                        <XCircle size={11} /> Reject
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerList>

      <AnimatePresence>
        {previewProof && (() => {
          const img = imageForProof(previewProof);
          return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setPreviewProof(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className={`relative bg-gradient-to-br ${categoryGradient[previewProof.category]} flex items-center justify-center`} style={{ minHeight: 320 }}>
                {img ? (
                  <img src={img.src} alt={previewProof.taskTitle} className="w-full max-h-[60vh] object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <span className="text-7xl mb-2">{previewProof.emoji}</span>
                    <p className="text-sm text-gray-500 font-medium">{previewProof.fileName}</p>
                  </div>
                )}
                <button onClick={() => setPreviewProof(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{previewProof.taskTitle}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">By {previewProof.volunteer} · {previewProof.uploadedAt}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColor[previewProof.status]}`}>{previewProof.status}</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Reviewer Comment</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Add a review comment..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none" />
                </div>
                {previewProof.status === "pending" ? (
                  <div className="flex gap-3 pt-1">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleDecision(previewProof.id, "approved", comment)}
                      className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition-colors">
                      <CheckCircle2 size={15} /> Approve
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleDecision(previewProof.id, "rejected", comment)}
                      className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition-colors">
                      <XCircle size={15} /> Reject
                    </motion.button>
                  </div>
                ) : (
                  <div className={`text-center py-2.5 rounded-xl text-sm font-bold ${previewProof.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {previewProof.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
          );
        })()}
      </AnimatePresence>
    </MountFade>
  );
}

// ─── Resource Management Page ─────────────────────────────────────────────────
function ResourcesPage({ resources, setResources }: { resources: Resource[]; setResources: React.Dispatch<React.SetStateAction<Resource[]>> }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "", status: "available" as ResourceStatus, category: "Food" });

  function handleSubmit() {
    if (!form.name.trim() || !form.quantity) return;
    const qty = parseInt(form.quantity) || 0;
    if (editId !== null) {
      setResources(prev => prev.map(r => r.id === editId ? { ...r, name: form.name, quantity: qty, unit: form.unit, status: form.status, category: form.category } : r));
      setEditId(null);
    } else {
      setResources(prev => [...prev, { id: Date.now(), name: form.name, quantity: qty, unit: form.unit, status: form.status, category: form.category }]);
    }
    setForm({ name: "", quantity: "", unit: "", status: "available", category: "Food" });
    setShowForm(false);
  }

  function startEdit(r: Resource) {
    setForm({ name: r.name, quantity: String(r.quantity), unit: r.unit, status: r.status, category: r.category });
    setEditId(r.id);
    setShowForm(true);
  }

  function handleDelete(id: number) {
    setResources(prev => prev.filter(r => r.id !== id));
  }

  return (
    <MountFade className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FadeIn>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Resource Management</h2>
          <p className="text-sm text-gray-400">Track and manage all NGO resources and inventory.</p>
        </FadeIn>
        <motion.button onClick={() => { setEditId(null); setForm({ name: "", quantity: "", unit: "", status: "available", category: "Food" }); setShowForm(v => !v); }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
          <Plus size={16} /> Add Resource
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
            <h3 className="font-bold text-gray-800 mb-4">{editId !== null ? "Edit Resource" : "Add New Resource"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Resource Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Food Packets" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Quantity *</label>
                <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Unit</label>
                <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="packs, kits, pieces..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {["Food", "Health", "Relief", "Education", "Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Allocation Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ResourceStatus }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="depleted">Depleted</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                {editId !== null ? "Save Changes" : "Add Resource"}
              </motion.button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(r => {
          const sc = RESOURCE_STATUS_CONFIG[r.status];
          return (
            <StaggerItem key={r.id}>
              <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.category}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{r.quantity}</p>
                    <p className="text-xs text-gray-400">{r.unit}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => startEdit(r)}
                      className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">
                      <Pencil size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => handleDelete(r.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors">
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((r.quantity / 500) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: r.status === "depleted" ? "#ef4444" : r.status === "allocated" ? ORANGE : "#22c55e" }} />
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </MountFade>
  );
}

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: "overview", icon: LayoutDashboard, label: "Dashboard" },
  { page: "profile", icon: User, label: "NGO Profile" },
  { page: "register", icon: Building2, label: "Register NGO" },
  { page: "volunteers", icon: Users, label: "Volunteers" },
  { page: "tasks", icon: ClipboardList, label: "Tasks" },
  { page: "proofs", icon: ShieldCheck, label: "Proof Verification" },
  { page: "resources", icon: Package, label: "Resources" },
  { page: "settings", icon: SettingsIcon, label: "Settings" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NgoDashboard() {
  const [activePage, setActivePage] = useState<Page>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INIT_VOLUNTEERS);
  const [tasks, setTasks] = useState<Task[]>(INIT_TASKS);
  const [proofs, setProofs] = useState<Proof[]>(INIT_PROOFS);
  const [resources, setResources] = useState<Resource[]>(INIT_RESOURCES);

  const profile = getNgoProfile();
  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = profile.adminName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-5"}`}>
      <div className="flex items-center gap-2.5 mb-8">
        <img src={saharaLogo} alt="SAHARA" className="w-9 h-9 object-contain" />
        <span className="text-lg font-black tracking-tight" style={{ color: ORANGE }}>SAHARA</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={18} /></button>
        )}
      </div>
      <div className="mb-4 px-2">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">NGO Panel</p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ page, icon: Icon, label }) => (
          <motion.button key={page}
            onClick={() => { setActivePage(page); setSidebarOpen(false); }}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.12 }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activePage === page ? "text-white shadow-sm" : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"}`}
            style={activePage === page ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            <Icon size={17} />
            {label}
          </motion.button>
        ))}
      </nav>
      <motion.button whileHover={{ x: 2 }} transition={{ duration: 0.12 }}
        onClick={() => { window.location.href = "/"; }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all mt-4">
        <LogOut size={17} /> Logout
      </motion.button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-[Poppins,sans-serif] relative">
      <FloatingBackground />
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 shrink-0 shadow-sm relative z-10">
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
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
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
              <button
                type="button"
                onClick={() => setActivePage("profile")}
                aria-label="Open profile"
                className="flex items-center gap-2.5 p-1 -m-1 rounded-xl hover:bg-orange-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-800 leading-tight">{profile.adminName}</p>
                  <p className="text-[10px] font-semibold" style={{ color: ORANGE }}>NGO Admin</p>
                </div>
              </button>
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
              {activePage === "overview" && <OverviewPage volunteers={volunteers} tasks={tasks} resources={resources} onNavigate={setActivePage} />}
              {activePage === "profile" && <ProfilePage />}
              {activePage === "register" && <RegisterNgoPage />}
              {activePage === "volunteers" && <VolunteersPage volunteers={volunteers} setVolunteers={setVolunteers} tasks={tasks} />}
              {activePage === "tasks" && <TasksPage tasks={tasks} setTasks={setTasks} volunteers={volunteers} />}
              {activePage === "proofs" && <ProofsPage proofs={proofs} setProofs={setProofs} />}
              {activePage === "settings" && <SettingsPage role="NGO" />}
              {activePage === "resources" && <ResourcesPage resources={resources} setResources={setResources} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {notifOpen && <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />}

      <AIChatbot
        context={{
          role: "ngo",
          username: profile.adminName.split(" ")[0],
          myTasks: tasks.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, deadline: t.deadline })),
          availableTasks: tasks.filter(t => !t.assignedTo || t.status === "assigned").map(t => ({
            id: t.id, title: t.title, priority: t.priority, deadline: t.deadline,
          })),
        }}
      />
    </div>
  );
}
