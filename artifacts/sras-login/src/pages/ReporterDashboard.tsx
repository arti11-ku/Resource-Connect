import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeDown, FadeUp, FadeIn, StaggerList, StaggerItem, HoverCard, MountFade, SlideInHeader, chartTooltipStyle, chartTooltipCursor } from "../lib/AnimatedComponents";
import {
  LayoutDashboard, ClipboardList, ShieldCheck, AlertTriangle,
  BarChart2, User, LogOut, Bell, Menu, X, ChevronDown,
  CheckCircle2, XCircle, Clock, Eye, Download, Flag,
  MessageSquare, Send, Filter, Search, ChevronRight,
  FileText, TrendingUp, Users, Zap, RefreshCw, Circle,
  Upload, Plus, Pencil, Save, MapPin, Sparkles, Image as ImageIcon,
  Heart, Trees, UtensilsCrossed, Settings as SettingsIcon
} from "lucide-react";
import SettingsPage from "../components/SettingsPage";
import { useToast } from "../hooks/use-toast";
import { geminiChat, type GeminiMsg } from "../lib/chatApi";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";
import LocationPicker, { type LocationValue } from "../components/LocationPicker";
import { loadReviewImages, saveReviewImages } from "../lib/smartReviewStore";
import AIChatbot from "../components/AIChatbot";
import EmptyState from "../components/EmptyState";
import ImageMarquee from "../components/ImageMarquee";
import { dashboardGalleryImages } from "../lib/dashboardGallery";
import floatImg1 from "@assets/images_(5)_1776836265158.jpg";
import floatImg2 from "@assets/images_(4)_1776836265159.jpg";
import floatImg3 from "@assets/53bbbde9-f19f-4cbd-9f2b-f6e4f02f10ce_1776836265160.jpg";
import floatImg4 from "@assets/images_(3)_1776836265160.jpg";
import floatImg5 from "@assets/NGOsource-Content-2.0--23.11.20---Nigerian-NGOs_IS_1776836265161.jpg";
import floatImg6 from "@assets/images_(2)_1776836265161.jpg";
import floatImg7 from "@assets/Medical_Camp_1776836265162.jpeg";

const FLOATING_IMAGES = [floatImg1, floatImg2, floatImg3, floatImg4, floatImg5, floatImg6, floatImg7];

function Bar3DChart({ data, labelA = "Completed", labelB = "Delayed" }: {
  data: { name: string; completed: number; delayed: number }[];
  labelA?: string; labelB?: string;
}) {
  const W = 480, H = 210;
  const padL = 28, padB = 35, padT = 15, padR = 15;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const depth = 7;
  const maxVal = Math.max(...data.flatMap(d => [d.completed, d.delayed]), 1);
  const n = data.length;
  const groupW = chartW / n;
  const bw = Math.min(18, groupW * 0.28);
  const gap = 5;

  function bar3D(x: number, h: number, y0: number, colorFront: string, colorTop: string, colorSide: string) {
    if (h <= 0) return null;
    const yTop = y0 - h;
    return (
      <g>
        <rect x={x} y={yTop} width={bw} height={h} fill={colorFront} />
        <polygon points={`${x},${yTop} ${x + depth},${yTop - depth} ${x + bw + depth},${yTop - depth} ${x + bw},${yTop}`} fill={colorTop} />
        <polygon points={`${x + bw},${yTop} ${x + bw + depth},${yTop - depth} ${x + bw + depth},${y0 - depth} ${x + bw},${y0}`} fill={colorSide} />
      </g>
    );
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map(f => {
        const y = padT + chartH * (1 - f);
        return (
          <g key={f}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">{Math.round(maxVal * f)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const cx = padL + i * groupW + groupW / 2;
        const y0 = padT + chartH;
        const hA = (d.completed / maxVal) * chartH;
        const hB = (d.delayed / maxVal) * chartH;
        const xA = cx - bw - gap / 2;
        const xB = cx + gap / 2;
        return (
          <g key={d.name}>
            {bar3D(xA, hA, y0, "#22c55e", "#4ade80", "#15803d")}
            {bar3D(xB, hB, y0, "#f97316", "#fb923c", "#c2410c")}
            <text x={cx} y={H - 18} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.name}</text>
          </g>
        );
      })}
      <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#e2e8f0" strokeWidth="1" />
      <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#e2e8f0" strokeWidth="1" />
      <g transform={`translate(${padL}, ${H - 12})`}>
        <rect width="8" height="8" fill="#22c55e" rx="1.5" />
        <text x="11" y="7" fontSize="9" fill="#64748b">{labelA}</text>
        <rect x="70" width="8" height="8" fill="#f97316" rx="1.5" />
        <text x="81" y="7" fontSize="9" fill="#64748b">{labelB}</text>
      </g>
    </svg>
  );
}

function Pie3DChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        position: "absolute", bottom: -4, left: "50%",
        transform: "translateX(-50%)",
        width: 110, height: 14,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.1)",
        filter: "blur(5px)",
      }} />
      <div style={{ transform: "perspective(320px) rotateX(36deg)", transformOrigin: "center bottom" }}>
        <PieChart width={160} height={130}>
          <Pie data={data} cx="50%" cy="52%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
}

type Page = "overview" | "tasks" | "proofs" | "issues" | "reports" | "communication" | "profile" | "settings";
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
  location?: LocationValue;
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

function FloatingBackground() {
  const positions = [
    { top: "4%", left: "3%", size: 70, delay: 0, dx: 18, dy: -14 },
    { top: "10%", left: "28%", size: 64, delay: 0.4, dx: -16, dy: 18 },
    { top: "6%", left: "55%", size: 70, delay: 0.8, dx: 20, dy: 16 },
    { top: "12%", right: "5%", size: 70, delay: 0.2, dx: -22, dy: 14 },
    { top: "26%", left: "12%", size: 70, delay: 1.1, dx: 14, dy: 20 },
    { top: "30%", left: "42%", size: 70, delay: 0.5, dx: -18, dy: -16 },
    { top: "24%", right: "18%", size: 70, delay: 1.4, dx: 16, dy: 18 },
    { top: "44%", left: "4%", size: 70, delay: 0.7, dx: 20, dy: -18 },
    { top: "48%", left: "32%", size: 70, delay: 1.2, dx: -14, dy: 16 },
    { top: "46%", left: "62%", size: 70, delay: 0.3, dx: 18, dy: 18 },
    { top: "50%", right: "4%", size: 70, delay: 1.6, dx: -16, dy: -14 },
    { top: "64%", left: "18%", size: 70, delay: 0.9, dx: 14, dy: 16 },
    { top: "68%", left: "48%", size: 70, delay: 1.3, dx: -18, dy: 14 },
    { top: "66%", right: "10%", size: 70, delay: 0.6, dx: 20, dy: -16 },
    { top: "84%", left: "6%", size: 70, delay: 1.0, dx: 16, dy: -18 },
    { top: "86%", left: "36%", size: 70, delay: 1.5, dx: -20, dy: 14 },
    { top: "82%", left: "66%", size: 70, delay: 0.5, dx: 18, dy: 18 },
    { top: "88%", right: "6%", size: 70, delay: 1.1, dx: -16, dy: -14 },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {positions.map((p, i) => (
        <motion.img
          key={i}
          src={FLOATING_IMAGES[i % FLOATING_IMAGES.length]}
          alt=""
          style={{
            position: "absolute",
            top: p.top,
            left: (p as any).left,
            right: (p as any).right,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            objectFit: "cover",
            opacity: 0.28,
            boxShadow: "0 10px 28px rgba(255,122,0,0.25)",
          }}
          animate={{
            x: [0, p.dx, 0, -p.dx, 0],
            y: [0, p.dy, 0, -p.dy, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{ duration: 10 + (i % 6), repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}

function OverviewPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <MountFade className="space-y-6 relative">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
        <p className="text-sm text-gray-400">Monitor all tasks, proofs, and field activity at a glance.</p>
      </FadeIn>

      <StaggerList className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: ClipboardList, label: "Active Tasks", value: 4, sub: "Currently running", color: "bg-orange-500", page: "tasks" as Page },
          { icon: CheckCircle2, label: "Completed", value: 3, sub: "This week", color: "bg-green-500", page: "tasks" as Page },
          { icon: Clock, label: "Pending", value: 2, sub: "Awaiting action", color: "bg-blue-500", page: "tasks" as Page },
          { icon: Flag, label: "Issues Flagged", value: 2, sub: "1 escalated", color: "bg-red-500", page: "issues" as Page },
          { icon: FileText, label: "Reports", value: 6, sub: "Generated", color: "bg-purple-500", page: "reports" as Page },
        ].map(({ icon, label, value, sub, color, page }) => (
          <StaggerItem key={label}>
            <motion.button
              onClick={() => onNavigate(page)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="text-left cursor-pointer w-full"
              style={{ display: "block" }}>
              <StatCard icon={icon} label={label} value={value} sub={sub} color={color} />
            </motion.button>
          </StaggerItem>
        ))}
      </StaggerList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeUp>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <h3 className="font-bold text-gray-800 mb-3">Task Completion — 3D Bar Chart</h3>
            <Bar3DChart data={CHART_COMPLETION} />
          </HoverCard>
        </FadeUp>
        <FadeDown delay={0.08}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <h3 className="font-bold text-gray-800 mb-3">Task Status Distribution — 3D</h3>
            <div className="flex items-center gap-6">
              <Pie3DChart data={CHART_STATUS} />
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
          </HoverCard>
        </FadeDown>
      </div>

      <FadeUp delay={0.1}>
        <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Volunteer Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VOLUNTEER_PERF} layout="vertical" barSize={12}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={chartTooltipCursor} />
              <Bar dataKey="tasks" fill={ORANGE} name="Tasks" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </HoverCard>
      </FadeUp>

      <FadeUp delay={0.18}>
        <ImageMarquee images={dashboardGalleryImages} />
      </FadeUp>
    </MountFade>
  );
}

function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [volunteerFilter, setVolunteerFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", volunteer: "", deadline: "", category: "Healthcare", location: "" });
  const [extraTasks, setExtraTasks] = useState<Task[]>([]);

  const allTasks = [...extraTasks, ...MOCK_TASKS];

  const filtered = allTasks.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (volunteerFilter && !t.volunteer.toLowerCase().includes(volunteerFilter.toLowerCase())) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleTaskSubmit() {
    if (!taskForm.title.trim() || !taskForm.volunteer.trim()) return;
    const newTask: Task = {
      id: Date.now(), title: taskForm.title, description: taskForm.description,
      volunteer: taskForm.volunteer, status: "available",
      deadline: taskForm.deadline || "TBD", category: taskForm.category,
      location: taskForm.location || "TBD",
    };
    setExtraTasks(prev => [newTask, ...prev]);
    setTaskForm({ title: "", description: "", volunteer: "", deadline: "", category: "Healthcare", location: "" });
    setShowTaskForm(false);
  }

  return (
    <MountFade className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FadeIn>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Task Monitoring</h2>
          <p className="text-sm text-gray-400">View and manage all field tasks.</p>
        </FadeIn>
        <motion.button onClick={() => setShowTaskForm(v => !v)}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.15 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
          <Plus size={16} /> Add Task
        </motion.button>
      </div>

      {showTaskForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
          <h3 className="font-bold text-gray-800 mb-4">Create New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Title *</label>
              <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Task title..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Volunteer *</label>
              <input value={taskForm.volunteer} onChange={e => setTaskForm(f => ({ ...f, volunteer: e.target.value }))}
                placeholder="Assigned volunteer..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
              <select value={taskForm.category} onChange={e => setTaskForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                {["Healthcare", "Education", "Disaster Relief", "Environment", "Food & Nutrition"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Deadline</label>
              <input type="date" value={taskForm.deadline} onChange={e => setTaskForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Location</label>
              <input value={taskForm.location} onChange={e => setTaskForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Location..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
              <input value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short description..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleTaskSubmit}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>Create Task</button>
            <button onClick={() => setShowTaskForm(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}
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
                <tr>
                  <td colSpan={6} className="py-6">
                    <EmptyState
                      variant="tasks"
                      compact
                      title="No tasks match your filters"
                      description="Try a different status or category to see more results."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MountFade>
  );
}

function ProofsPage() {
  const { toast } = useToast();
  const [proofs, setProofs] = useState<Proof[]>(MOCK_PROOFS);
  const [activeProof, setActiveProof] = useState<Proof | null>(null);
  const [detailProof, setDetailProof] = useState<Proof | null>(null);
  const [comment, setComment] = useState("");
  const [filter, setFilter] = useState<ProofStatus | "all">("all");

  const filtered = proofs.filter(p => filter === "all" || p.status === filter);

  function handleAction(id: number, action: "approved" | "rejected") {
    setProofs(prev => prev.map(p => p.id === id ? { ...p, status: action, comment } : p));
    setActiveProof(null);
    setComment("");
    toast({
      title: action === "approved" ? "Proof Approved" : "Proof Rejected",
      description: action === "approved"
        ? "The volunteer has been notified of the approval."
        : "The volunteer has been notified to resubmit.",
    });
  }

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Proof Verification</h2>
        <p className="text-sm text-gray-400">Review uploaded proofs and approve or reject submissions.</p>
      </FadeIn>
      <FadeIn delay={0.05}>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <motion.button key={f} onClick={() => setFilter(f)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize ${filter === f ? "text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
              style={filter === f ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
              {f === "all" ? "All Proofs" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && <span className="ml-1.5 text-xs opacity-80">({proofs.filter(p => p.status === f).length})</span>}
            </motion.button>
          ))}
        </div>
      </FadeIn>
      <StaggerList className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(proof => (
          <StaggerItem key={proof.id}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 cursor-pointer"
            onClick={() => setDetailProof(proof)}>
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
              <span className="text-sm text-gray-600 truncate font-medium flex-1">{proof.fileName}</span>
            </div>

            <p className="text-xs text-gray-400 mb-3">Uploaded: {proof.uploadedAt}</p>

            {proof.comment && (
              <div className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-2.5 mb-3 border border-gray-100">
                💬 {proof.comment}
              </div>
            )}
            {proof.status === "pending" ? (
              <motion.button
                onClick={(e) => { e.stopPropagation(); setActiveProof(proof); setComment(""); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="w-full py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                Review Proof
              </motion.button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setDetailProof(proof); }}
                className="w-full py-2 rounded-xl text-sm font-semibold text-orange-600 border border-orange-200 hover:bg-orange-50 transition-colors flex items-center justify-center gap-1.5">
                <Eye size={14} /> View Details
              </button>
            )}
          </HoverCard>
          </StaggerItem>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl border border-orange-50">
            <EmptyState
              variant="proofs"
              title="No proofs in this category"
              description="Once volunteers submit proof of completed work, it'll show up here for your review."
            />
          </div>
        )}
      </StaggerList>

      <AnimatePresence>
      {activeProof && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <motion.div
            initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
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
                <p className="text-xs text-gray-400 mt-2">{activeProof.fileType === "image" ? "Submitted by volunteer" : "Document"}</p>
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
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 transition-all">
                <CheckCircle2 size={15} /> Approve
              </button>
              <button onClick={() => handleAction(activeProof.id, "rejected")}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 transition-all">
                <XCircle size={15} /> Reject
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {detailProof && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setDetailProof(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
          <motion.div
            initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{detailProof.emoji}</span>
                <div>
                  <p className="font-bold text-sm">Proof Details</p>
                  <p className="text-xs opacity-90">{detailProof.taskTitle}</p>
                </div>
              </div>
              <button onClick={() => setDetailProof(null)} className="p-1 rounded-lg hover:bg-white/20"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-1">Volunteer</p>
                  <p className="text-sm font-semibold text-gray-800">{detailProof.volunteer}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    detailProof.status === "approved" ? "bg-green-100 text-green-700" :
                    detailProof.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"}`}>
                    {detailProof.status.charAt(0).toUpperCase() + detailProof.status.slice(1)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-1">File Name</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{detailProof.fileName}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-1">File Type</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{detailProof.fileType}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 col-span-2">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-1">Uploaded At</p>
                  <p className="text-sm font-semibold text-gray-800">{detailProof.uploadedAt}</p>
                </div>
                {detailProof.comment && (
                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 col-span-2">
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-1">Reviewer Comment</p>
                    <p className="text-sm text-gray-700 italic">{detailProof.comment}</p>
                  </div>
                )}
              </div>
              {detailProof.status === "pending" && (
                <button
                  onClick={() => { setActiveProof(detailProof); setDetailProof(null); setComment(""); }}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                  Review This Proof
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </MountFade>
  );
}

function IssuesPage() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ taskId: "", type: "delay" as IssueType, description: "", fileName: "" });
  const [pickedLocation, setPickedLocation] = useState<LocationValue | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    if (!form.taskId || !form.description) {
      toast({ title: "Missing fields", description: "Please select a task and add a description.", variant: "destructive" });
      return;
    }
    const task = MOCK_TASKS.find(t => t.id === Number(form.taskId));
    if (!task) return;
    const newIssue: Issue = {
      id: Date.now(), taskId: task.id, taskTitle: task.title,
      type: form.type, description: form.description,
      raisedAt: new Date().toLocaleString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      escalated: false, fileName: form.fileName || undefined,
      location: pickedLocation || undefined,
    };
    setIssues(prev => [newIssue, ...prev]);
    setForm({ taskId: "", type: "delay", description: "", fileName: "" });
    setPickedLocation(null);
    setShowForm(false);
    toast({ title: "Issue Flagged", description: `"${task.title}" has been added to Issue Reporting.` });
  }

  function handleEscalate(id: number) {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, escalated: true } : i));
    toast({ title: "Issue Escalated", description: "Admin team has been notified." });
  }

  return (
    <MountFade className="space-y-5">
      <div className="flex items-center justify-between">
        <FadeIn>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Issue Reporting</h2>
          <p className="text-sm text-gray-400">Flag and track issues on tasks in the field.</p>
        </FadeIn>
        <motion.button onClick={() => setShowForm(v => !v)}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.15 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
          <Flag size={15} /> Flag Issue
        </motion.button>
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Location (optional)</label>
              <LocationPicker value={pickedLocation} onChange={setPickedLocation} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Attach File (optional)</label>
              <input ref={fileRef} type="file" className="hidden" onChange={e => setForm(f => ({ ...f, fileName: e.target.files?.[0]?.name || "" }))} />
              <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-orange-300 text-orange-500 text-sm hover:bg-orange-50 transition-colors">
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

      <StaggerList className="space-y-4">
        {issues.map(issue => (
          <StaggerItem key={issue.id}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
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
            {issue.location && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 border border-orange-100 mb-3">
                <MapPin size={13} className="text-orange-500 mt-0.5 shrink-0" />
                <div className="text-xs text-gray-700 min-w-0">
                  <p className="font-semibold truncate">{issue.location.address}</p>
                  <p className="text-[11px] text-gray-500">
                    {issue.location.lat.toFixed(5)}, {issue.location.lng.toFixed(5)}
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400">Raised: {issue.raisedAt}</p>
          </HoverCard>
          </StaggerItem>
        ))}
        {issues.length === 0 && (
          <div className="bg-white rounded-2xl border border-orange-50">
            <EmptyState
              variant="issues"
              title="No issues reported yet"
              description="Use the Flag Issue form to raise the first concern from the field."
            />
          </div>
        )}
      </StaggerList>
    </MountFade>
  );
}

interface ReportEntry {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
}

interface ReviewImage {
  id: number;
  src: string;
  name: string;
  label: string;
  category: ReviewCategory;
  uploadedAt: string;
}

const CATEGORY_KEYWORDS: Record<Exclude<ReviewCategory, "other">, string[]> = {
  blood: ["blood", "donation", "donor", "transfusion", "plasma", "bloodbank", "blood-bank"],
  tree: ["tree", "plant", "plantation", "sapling", "forest", "green", "reforest"],
  food: ["food", "meal", "feed", "feeding", "ration", "hunger", "kitchen", "distribution"],
};

function classifyImage(label: string, fileName: string): ReviewCategory {
  const text = `${label} ${fileName}`.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Exclude<ReviewCategory, "other">, string[]][]) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return "other";
}

const CATEGORY_META: Record<ReviewCategory, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  blood: { label: "Blood Donation", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: Heart },
  tree: { label: "Tree Plantation", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: Trees },
  food: { label: "Food Distribution", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: UtensilsCrossed },
  other: { label: "Other Reviews", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: ImageIcon },
};

function SmartReviewSection() {
  const { toast } = useToast();
  const [images, setImages] = useState<ReviewImage[]>(() => loadReviewImages() as ReviewImage[]);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState<ReviewImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveReviewImages(images); }, [images]);

  function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (!ev.target?.result) return;
        const cat = classifyImage(label, file.name);
        const img: ReviewImage = {
          id: Date.now() + Math.random(),
          src: ev.target.result as string,
          name: file.name,
          label: label.trim() || file.name.replace(/\.[^.]+$/, ""),
          category: cat,
          uploadedAt: new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        };
        setImages(prev => [img, ...prev]);
        toast({
          title: "Image Categorized",
          description: `Sent to ${CATEGORY_META[cat].label}.`,
        });
      };
      reader.readAsDataURL(file);
    });
    setLabel("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const grouped: Record<ReviewCategory, ReviewImage[]> = { blood: [], tree: [], food: [], other: [] };
  for (const img of images) grouped[img.category].push(img);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={16} className="text-orange-500" /> Smart Review Gallery
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Upload review images — they'll be auto-sorted into categories using context.</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-dashed border-orange-300 bg-orange-50/40 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3">
          <input value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Optional label/context (e.g. 'Blood donation drive in Dadar')"
            className="px-3 py-2.5 rounded-xl border border-orange-200 text-sm bg-white focus:outline-none focus:border-orange-400" />
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
          <motion.button onClick={() => fileRef.current?.click()}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <Upload size={15} /> Upload Image
          </motion.button>
        </div>
        <p className="text-xs text-gray-500">
          Tip: include keywords like <span className="font-semibold text-red-600">blood</span>, <span className="font-semibold text-green-600">tree</span> or <span className="font-semibold text-amber-600">food</span> in the label or filename for accurate categorization.
        </p>
      </div>

      {(["blood", "tree", "food", "other"] as ReviewCategory[]).map(cat => {
        const list = grouped[cat];
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        return (
          <div key={cat} className={`rounded-xl border ${meta.bg} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon size={16} className={meta.color} />
                <p className={`font-bold text-sm ${meta.color}`}>{meta.label}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 text-gray-600">{list.length}</span>
            </div>
            {list.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No images yet — upload one with this category's keywords.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {list.map(img => (
                  <motion.button key={img.id}
                    whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setActive(img)}
                    className="relative group rounded-lg overflow-hidden border border-white shadow-sm aspect-square cursor-pointer">
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                      <p className="text-[10px] text-white font-medium p-1.5 opacity-0 group-hover:opacity-100 truncate w-full bg-black/40">
                        {img.label}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
          <motion.div
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button onClick={() => setActive(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <X size={18} />
            </button>
            <img src={active.src} alt={active.label} className="w-full max-h-[70vh] object-contain bg-black" />
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-bold text-gray-800">{active.label}</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_META[active.category].bg} ${CATEGORY_META[active.category].color}`}>
                  {CATEGORY_META[active.category].label}
                </span>
              </div>
              <p className="text-xs text-gray-500">{active.name}</p>
              <p className="text-xs text-gray-400">Uploaded {active.uploadedAt}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function ReportsPage() {
  const [showForm, setShowForm] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", description: "", category: "Task Summary", deadline: "" });
  const [extraReports, setExtraReports] = useState<ReportEntry[]>([]);

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

  function handleReportSubmit() {
    if (!reportForm.title.trim() || !reportForm.description.trim()) return;
    const newReport: ReportEntry = {
      id: Date.now(),
      title: reportForm.title,
      description: reportForm.description,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      category: reportForm.category,
    };
    setExtraReports(prev => [newReport, ...prev]);
    setReportForm({ title: "", description: "", category: "Task Summary", deadline: "" });
    setShowForm(false);
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
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <Plus size={16} /> New Report
          </button>
          <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors">
            <Download size={14} /> Download CSV
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors">
            <FileText size={14} /> Download PDF
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
          <h3 className="font-bold text-gray-800 mb-4">Create New Report</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Title *</label>
              <input value={reportForm.title} onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Report title..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
              <select value={reportForm.category} onChange={e => setReportForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                <option>Task Summary</option>
                <option>Volunteer Performance</option>
                <option>Issue Report</option>
                <option>Field Activity</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description *</label>
              <textarea value={reportForm.description} onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the report content..."
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none" rows={3} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Deadline (optional)</label>
              <input type="date" value={reportForm.deadline} onChange={e => setReportForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handleReportSubmit}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>Submit Report</button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <SmartReviewSection />

      {extraReports.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Created Reports ({extraReports.length})</h3>
          {extraReports.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                <FileText size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-gray-800 text-sm">{r.title}</p>
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">{r.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{r.description}</p>
                <p className="text-xs text-gray-400 mt-1">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
          <h3 className="font-bold text-gray-800 mb-3">Daily Completion Trend — 3D</h3>
          <div style={{ perspective: "900px" }}>
            <div style={{ transform: "rotateX(18deg)", transformOrigin: "bottom center" }}>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={CHART_COMPLETION}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: "rgba(255,122,0,0.2)", strokeWidth: 1.5 }} />
                  <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#22c55e", r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7, strokeWidth: 2 }} name="Completed" />
                  <Line type="monotone" dataKey="delayed" stroke={ORANGE} strokeWidth={3} dot={{ fill: ORANGE, r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7, strokeWidth: 2 }} name="Delayed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
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

interface AIChatItem {
  id: number;
  from: "user" | "bot";
  text: string;
}

function CommunicationPage() {
  const [tab, setTab] = useState<"team" | "ai">("team");
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [selectedTask, setSelectedTask] = useState<number>(1);
  const [newMsg, setNewMsg] = useState("");
  const profile = getReporterProfile();

  const [aiMessages, setAiMessages] = useState<AIChatItem[]>([
    { id: 1, from: "bot", text: `Hi ${profile.name.split(" ")[0]}! I'm SAHARA AI. Ask me anything about your tasks, proofs, or volunteers.` },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiSending, setAiSending] = useState(false);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "ai") {
      requestAnimationFrame(() => {
        aiScrollRef.current?.scrollTo({ top: aiScrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }, [tab, aiMessages, aiSending]);

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

  async function sendAIMessage(raw: string) {
    const text = raw.trim();
    if (!text || aiSending) return;
    const userMsg: AIChatItem = { id: Date.now(), from: "user", text };
    setAiMessages(m => [...m, userMsg]);
    setAiInput("");
    setAiSending(true);
    const history: GeminiMsg[] = [...aiMessages, userMsg]
      .slice(-10)
      .map(m => ({ role: m.from === "user" ? "user" : "model", text: m.text }));
    try {
      const reply = await geminiChat({
        messages: history,
        role: "reporter",
        username: profile.name.split(" ")[0],
      });
      setAiMessages(m => [...m, { id: Date.now() + 1, from: "bot", text: reply || "I'm here — could you rephrase that?" }]);
    } catch {
      setAiMessages(m => [...m, { id: Date.now() + 1, from: "bot", text: "I couldn't reach the AI service just now. Please try again." }]);
    } finally {
      setAiSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Communication Panel</h2>
        <p className="text-sm text-gray-400">Coordinate with volunteers or chat with the AI assistant.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab("team")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === "team" ? "text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
          style={tab === "team" ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
          <MessageSquare size={14} /> Team Chat
        </button>
        <button onClick={() => setTab("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === "ai" ? "text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
          style={tab === "ai" ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
          <Sparkles size={14} /> AI Assistant
        </button>
      </div>

      {tab === "ai" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="px-4 py-3 text-white flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <motion.div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
              animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
              <Sparkles size={15} />
            </motion.div>
            <div>
              <p className="font-bold text-sm">SAHARA AI Assistant</p>
              <p className="text-xs opacity-90">Powered by Gemini · session history</p>
            </div>
          </div>
          <div ref={aiScrollRef} className="p-4 space-y-3 max-h-96 overflow-y-auto bg-orange-50/30">
            {aiMessages.map(m => (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                  m.from === "user" ? "text-white rounded-br-md" : "bg-white text-gray-700 border border-orange-100 rounded-bl-md"
                }`}
                  style={m.from === "user" ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </motion.div>
            ))}
            {aiSending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white border border-orange-100 rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400"
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          <form onSubmit={e => { e.preventDefault(); sendAIMessage(aiInput); }}
            className="p-3 border-t border-orange-100 flex gap-2">
            <input value={aiInput} onChange={e => setAiInput(e.target.value)}
              placeholder={aiSending ? "SAHARA AI is thinking…" : "Ask the AI anything…"}
              disabled={aiSending}
              className="flex-1 px-3 py-2 rounded-xl border border-orange-200 text-sm focus:outline-none focus:border-orange-400 disabled:bg-gray-50" />
            <motion.button type="submit"
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              disabled={!aiInput.trim() || aiSending}
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
              <Send size={15} />
            </motion.button>
          </form>
        </motion.div>
      ) : (
      <>
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
            <EmptyState
              variant="messages"
              compact
              title="No messages yet"
              description="Start the conversation — your team will see it instantly."
            />
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
      </>
      )}
    </div>
  );
}

function ProfilePage() {
  const [profileData, setProfileData] = useState(getReporterProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profileData);

  function handleSave() {
    setProfileData(draft);
    try {
      const saved = localStorage.getItem("sahara_user");
      const u = saved ? JSON.parse(saved) : {};
      const updated = {
        ...u,
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        city: draft.location,
        occupation: draft.occupation,
      };
      localStorage.setItem("sahara_user", JSON.stringify(updated));
    } catch {}
    setEditing(false);
  }

  function handleCancel() {
    setDraft(profileData);
    setEditing(false);
  }

  const activityLog = [
    { icon: "✅", text: "Approved proof for 'Mid-Day Meal Support'", time: "Apr 20, 2026 · 3:00 PM" },
    { icon: "❌", text: "Rejected proof for 'Flood Relief Distribution' — blurry image", time: "Apr 21, 2026 · 11:15 AM" },
    { icon: "🚩", text: "Flagged issue on 'Tree Plantation Drive' — delay", time: "Apr 20, 2026 · 9:30 AM" },
    { icon: "📊", text: "Generated weekly task report", time: "Apr 19, 2026 · 5:00 PM" },
    { icon: "💬", text: "Commented on 'Flood Relief Distribution'", time: "Apr 21, 2026 · 9:00 AM" },
  ];

  const initials = profileData.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Profile & Activity</h2>
        <p className="text-sm text-gray-400">Your reporter profile and recent actions.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }} />
        <div className="px-6 pt-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #FF5500)` }}>
                {initials}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{profileData.name}</p>
                <p className="text-sm text-orange-500 font-semibold">Reporter · SAHARA</p>
              </div>
            </div>
            <button onClick={() => editing ? handleCancel() : setEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${editing ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "text-white hover:opacity-90"}`}
              style={!editing ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
              <Pencil size={14} /> {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              {[
                { label: "Full Name", key: "name" },
                { label: "Email", key: "email" },
                { label: "Phone", key: "phone" },
                { label: "Location", key: "location" },
                { label: "Occupation", key: "occupation" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                  <input
                    value={(draft as Record<string, string>)[key]}
                    onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                </div>
              ))}
              <button onClick={handleSave}
                className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                <Save size={15} /> Save Changes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Email", value: profileData.email },
                { label: "Phone", value: profileData.phone },
                { label: "Location", value: profileData.location },
                { label: "Occupation", value: profileData.occupation },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                  <p className="text-sm text-gray-700 font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          )}
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
  { page: "settings", icon: SettingsIcon, label: "Settings" },
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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-[Poppins,sans-serif] relative">
      <FloatingBackground />
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 shrink-0 shadow-sm relative z-10">
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
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
            <button
              type="button"
              onClick={() => setActivePage("profile")}
              aria-label="Open profile"
              className="flex items-center gap-2.5 p-1 -m-1 rounded-xl hover:bg-orange-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white`}
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-tight">{profile.name}</p>
                <p className="text-[10px] text-orange-500 font-semibold">Reporter</p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">
          {activePage === "overview" && <OverviewPage onNavigate={setActivePage} />}
          {activePage === "tasks" && <TasksPage />}
          {activePage === "proofs" && <ProofsPage />}
          {activePage === "issues" && <IssuesPage />}
          {activePage === "reports" && <ReportsPage />}
          {activePage === "communication" && <CommunicationPage />}
          {activePage === "settings" && <SettingsPage role="Reporter" />}
          {activePage === "profile" && <ProfilePage />}
        </main>
      </div>
      {notifOpen && <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />}

      <AIChatbot context={{ role: "reporter", username: profile.name.split(" ")[0] }} />
    </div>
  );
}
