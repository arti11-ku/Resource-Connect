import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard, CheckSquare, ClipboardList, Trophy, User, LogOut,
  Bell, MapPin, Clock, Star, ChevronRight, Menu, X,
  Flame, TrendingUp, Calendar, Filter, Settings,
  Zap, Shield, Award, AlertCircle, CheckCircle2, Circle, RefreshCw,
  Heart, Leaf, BookOpen, Stethoscope
} from "lucide-react";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";

type Page = "dashboard" | "available-tasks" | "my-tasks" | "scoreboard" | "profile" | "settings";

const volunteer = {
  name: "Priya Sharma",
  role: "Volunteer",
  location: "Mumbai, Maharashtra",
  avatar: "PS",
  email: "priya.sharma@example.com",
  phone: "+91 98765 43210",
  skills: ["First Aid", "Teaching", "Counseling", "Driving"],
  availability: { day: true, night: false, weekdays: true, weekends: true },
  points: 1240,
  rank: 4,
  tasksCompleted: 28,
  activeTasks: 2,
  streak: 7,
  joinedDate: "January 2024",
  nextRankPoints: 1360,
  topTenPoints: 1360,
};

const availableTasks = [
  {
    id: 1, title: "Flood Relief Distribution", location: "Kurla, Mumbai",
    date: "Apr 22, 2026", time: "9:00 AM – 1:00 PM",
    skills: ["First Aid", "Driving"], urgency: "high", category: "Disaster Relief",
    points: 120, slots: 3, description: "Help distribute essential supplies to flood-affected families."
  },
  {
    id: 2, title: "Free Medical Camp", location: "Dharavi, Mumbai",
    date: "Apr 25, 2026", time: "10:00 AM – 4:00 PM",
    skills: ["First Aid", "Counseling"], urgency: "high", category: "Healthcare",
    points: 150, slots: 2, description: "Assist doctors and nurses at a free health screening camp."
  },
  {
    id: 3, title: "Women's Skill Workshop", location: "Govandi, Mumbai",
    date: "Apr 28, 2026", time: "10:00 AM – 1:00 PM",
    skills: ["Teaching"], urgency: "medium", category: "Education",
    points: 85, slots: 5, description: "Conduct vocational skill sessions for underprivileged women."
  },
  {
    id: 4, title: "Tree Plantation Drive", location: "Sanjay Gandhi Park",
    date: "Apr 27, 2026", time: "7:00 AM – 10:00 AM",
    skills: [], urgency: "low", category: "Environment",
    points: 60, slots: 10, description: "Join us for a city-wide plantation initiative."
  },
  {
    id: 5, title: "Blood Donation Camp", location: "Dadar, Mumbai",
    date: "Apr 30, 2026", time: "8:00 AM – 5:00 PM",
    skills: ["First Aid"], urgency: "high", category: "Healthcare",
    points: 110, slots: 1, description: "Support blood donation drives across the city."
  },
  {
    id: 6, title: "Elderly Care Visit", location: "Chembur, Mumbai",
    date: "May 2, 2026", time: "2:00 PM – 5:00 PM",
    skills: ["Counseling"], urgency: "medium", category: "Healthcare",
    points: 75, slots: 4, description: "Spend time with elderly residents at a care home."
  },
];

const myTasks = [
  {
    id: 10, title: "Mid-Day Meal Support", location: "Andheri, Mumbai",
    date: "Apr 20, 2026", time: "11:00 AM – 2:00 PM",
    status: "in-progress", category: "Food & Nutrition", points: 60
  },
  {
    id: 11, title: "Literacy Drive – Weekend", location: "Bandra, Mumbai",
    date: "Apr 22, 2026", time: "9:00 AM – 12:00 PM",
    status: "pending", category: "Education", points: 90
  },
  {
    id: 12, title: "Community Clean-Up", location: "Colaba, Mumbai",
    date: "Apr 15, 2026", time: "6:00 AM – 9:00 AM",
    status: "completed", category: "Environment", points: 50
  },
  {
    id: 13, title: "Orphanage Visit & Workshop", location: "Chembur, Mumbai",
    date: "Apr 10, 2026", time: "10:00 AM – 1:00 PM",
    status: "completed", category: "Education", points: 100
  },
];

const leaderboard = [
  { rank: 1, name: "Aarav Patel", points: 2180, tasks: 45, city: "Pune", avatar: "AP", badge: "Hero Contributor" },
  { rank: 2, name: "Sneha Reddy", points: 1890, tasks: 38, city: "Hyderabad", avatar: "SR", badge: "Active Volunteer" },
  { rank: 3, name: "Rohan Mehta", points: 1560, tasks: 32, city: "Bangalore", avatar: "RM", badge: "Hero Contributor" },
  { rank: 4, name: "Priya Sharma", points: 1240, tasks: 28, city: "Mumbai", avatar: "PS", badge: "Active Volunteer", isMe: true },
  { rank: 5, name: "Deepika Nair", points: 1100, tasks: 24, city: "Chennai", avatar: "DN", badge: "Active Volunteer" },
  { rank: 6, name: "Vikram Singh", points: 980, tasks: 21, city: "Delhi", avatar: "VS", badge: "Beginner" },
  { rank: 7, name: "Anita Joshi", points: 850, tasks: 18, city: "Jaipur", avatar: "AJ", badge: "Beginner" },
  { rank: 8, name: "Karan Bose", points: 720, tasks: 15, city: "Kolkata", avatar: "KB", badge: "Beginner" },
];

const badges = [
  { id: "beginner", icon: "🌱", label: "Beginner", desc: "Completed first 5 tasks", earned: true },
  { id: "active", icon: "⚡", label: "Active Volunteer", desc: "25+ tasks completed", earned: true },
  { id: "hero", icon: "🏆", label: "Hero Contributor", desc: "50+ tasks & 2000+ pts", earned: false },
  { id: "streak", icon: "🔥", label: "On Fire", desc: "7-day activity streak", earned: true },
  { id: "healer", icon: "💊", label: "Healer", desc: "5 healthcare tasks", earned: true },
  { id: "educator", icon: "📚", label: "Educator", desc: "5 education tasks", earned: false },
];

const urgencyConfig = {
  high: { label: "High Priority", cls: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  medium: { label: "Medium Priority", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  low: { label: "Low Priority", cls: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

const categoryIcons: Record<string, React.ElementType> = {
  "Disaster Relief": AlertCircle,
  "Healthcare": Stethoscope,
  "Education": BookOpen,
  "Environment": Leaf,
  "Food & Nutrition": Heart,
};

const statusConfig = {
  pending: { label: "Pending", icon: Circle, cls: "bg-yellow-100 text-yellow-700" },
  "in-progress": { label: "In Progress", icon: RefreshCw, cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", icon: CheckCircle2, cls: "bg-green-100 text-green-700" },
};

const badgeConfig: Record<string, string> = {
  "Hero Contributor": "bg-orange-100 text-orange-700 border-orange-200",
  "Active Volunteer": "bg-blue-100 text-blue-700 border-blue-200",
  "Beginner": "bg-gray-100 text-gray-600 border-gray-200",
};

function Avatar({ initials, size = "md" }: { initials: string; size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-20 h-20 text-2xl"
  };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, textColor }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string; textColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className={textColor} />
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
      {sub && <p className={`text-xs font-medium mt-1 ${textColor}`}>{sub}</p>}
    </div>
  );
}

function TaskCard({ task, onAccept }: { task: typeof availableTasks[0]; onAccept: (id: number) => void }) {
  const urgency = urgencyConfig[task.urgency as keyof typeof urgencyConfig];
  const CategoryIcon = categoryIcons[task.category] || ClipboardList;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 hover:shadow-md hover:border-orange-100 transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <CategoryIcon size={17} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-snug">{task.title}</h3>
            <span className="text-xs text-gray-400">{task.category}</span>
          </div>
        </div>
        <span className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${urgency.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
          {urgency.label}
        </span>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">{task.description}</p>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={12} className="text-orange-400 shrink-0" /> {task.location}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar size={12} className="text-orange-400 shrink-0" /> {task.date}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} className="text-orange-400 shrink-0" /> {task.time}
        </div>
      </div>

      {task.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.skills.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-orange-50">
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-xl px-3 py-1.5">
          <Zap size={13} className="text-orange-500" />
          <span className="text-sm font-bold text-orange-700">+{task.points} pts</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{task.slots} slot{task.slots !== 1 ? "s" : ""} left</span>
          <button
            onClick={() => onAccept(task.id)}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
          >
            Accept Task
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const progressPct = Math.round((volunteer.points / volunteer.nextRankPoints) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FF7A00 0%, #FF9A40 60%, #FFB347 100%)" }}>
        <div className="absolute right-0 top-0 opacity-10">
          <svg width="180" height="120" viewBox="0 0 180 120">
            <circle cx="150" cy="20" r="60" fill="white" />
            <circle cx="30" cy="100" r="40" fill="white" />
          </svg>
        </div>
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium mb-1">Good morning,</p>
          <h2 className="text-2xl font-bold mb-1">{volunteer.name} 👋</h2>
          <p className="text-orange-100 text-sm">Ready to make an impact today?</p>
          <div className="flex items-center gap-2 mt-4">
            <Flame size={16} className="text-yellow-300" />
            <span className="text-sm font-semibold text-yellow-200">{volunteer.streak}-day streak — keep it going!</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Tasks Completed" value={volunteer.tasksCompleted}
          sub="+3 this month" color="bg-orange-100" textColor="text-orange-600" />
        <StatCard icon={Star} label="Points Earned" value={volunteer.points.toLocaleString()}
          sub="Active Volunteer tier" color="bg-yellow-100" textColor="text-yellow-600" />
        <StatCard icon={ClipboardList} label="Active Tasks" value={volunteer.activeTasks}
          sub="In progress now" color="bg-blue-100" textColor="text-blue-600" />
        <StatCard icon={Trophy} label="Leaderboard Rank" value={`#${volunteer.rank}`}
          sub="Top 5% volunteer" color="bg-purple-100" textColor="text-purple-600" />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-700">Progress to next rank</p>
          <span className="text-xs text-orange-500 font-semibold">{volunteer.points} / {volunteer.nextRankPoints} pts</span>
        </div>
        <div className="h-2.5 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #FF7A00, #FFB347)" }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          You are <span className="font-semibold text-orange-600">{volunteer.nextRankPoints - volunteer.points} points</span> away from <span className="font-semibold">Top 3</span>
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Available Tasks</h3>
          <button onClick={() => onNavigate("available-tasks")}
            className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors flex items-center gap-1">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {availableTasks.slice(0, 4).map(task => (
            <TaskCard key={task.id} task={task} onAccept={() => {}} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">My Tasks</h3>
            <button onClick={() => onNavigate("my-tasks")}
              className="text-xs text-orange-500 font-semibold hover:text-orange-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {myTasks.map(task => {
              const st = statusConfig[task.status as keyof typeof statusConfig];
              const Icon = st.icon;
              return (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                  <Icon size={16} className={task.status === "completed" ? "text-green-500" : task.status === "in-progress" ? "text-blue-500" : "text-yellow-500"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.date}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Profile Summary</h3>
            <button onClick={() => onNavigate("profile")}
              className="text-xs text-orange-500 font-semibold hover:text-orange-600 flex items-center gap-1">
              Edit <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={volunteer.avatar} size="md" />
            <div>
              <p className="font-bold text-gray-900">{volunteer.name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={11} className="text-orange-400" /> {volunteer.location}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {volunteer.skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Availability</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: "day", label: "Day Shift" },
                { key: "night", label: "Night Shift" },
                { key: "weekdays", label: "Weekdays" },
                { key: "weekends", label: "Weekends" },
              ].map(({ key, label }) => (
                <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  ${volunteer.availability[key as keyof typeof volunteer.availability]
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${volunteer.availability[key as keyof typeof volunteer.availability] ? "bg-green-500" : "bg-gray-300"}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="mt-4 w-full py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function AvailableTasksPage() {
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const filtered = availableTasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchUrgency = urgencyFilter === "all" || t.urgency === urgencyFilter;
    return matchSearch && matchUrgency;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />
          <input type="text" placeholder="Search tasks..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50/30 text-sm placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "high", "medium", "low"] as const).map(f => (
            <button key={f} onClick={() => setUrgencyFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all
                ${urgencyFilter === f ? "text-white shadow-sm" : "bg-orange-50 text-gray-600 border border-orange-100 hover:border-orange-300"}`}
              style={urgencyFilter === f ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}>
              {f === "all" ? "All" : `${f} priority`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(task => <TaskCard key={task.id} task={task} onAccept={() => {}} />)}
        {filtered.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl p-14 text-center shadow-sm border border-orange-50">
            <ClipboardList size={40} className="text-orange-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MyTasksPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const filtered = filter === "all" ? myTasks : myTasks.filter(t => t.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "in-progress", "completed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all
              ${filter === f ? "text-white shadow-sm" : "bg-white text-gray-600 border border-orange-100 hover:border-orange-300"}`}
            style={filter === f ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}>
            {f.replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(task => {
          const st = statusConfig[task.status as keyof typeof statusConfig];
          const Icon = st.icon;
          const CategoryIcon = categoryIcons[task.category] || ClipboardList;
          return (
            <div key={task.id} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <CategoryIcon size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{task.title}</h3>
                    <span className="text-xs text-gray-400">{task.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
                    <Icon size={12} /> {st.label}
                  </span>
                  <div className="flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-xl px-2.5 py-1">
                    <Zap size={12} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-700">{task.points} pts</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-orange-400" />{task.location}</span>
                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-orange-400" />{task.date}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} className="text-orange-400" />{task.time}</span>
              </div>

              {task.status !== "completed" && (
                <div className="flex gap-2">
                  <button className="px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
                    {task.status === "in-progress" ? "Mark as Completed" : "Start Task"}
                  </button>
                  <button className="px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-bold hover:bg-orange-50 transition-colors">
                    Update Status
                  </button>
                </div>
              )}
              {task.status === "completed" && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <CheckCircle2 size={16} /> Task completed — points awarded!
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-orange-50">
            <ClipboardList size={40} className="text-orange-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tasks in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreboardPage() {
  const top10MinPoints = leaderboard[leaderboard.length - 1]?.points ?? 0;
  const pointsToTop10 = Math.max(0, top10MinPoints - volunteer.points + 1);
  const progressPct = Math.min(100, Math.round((volunteer.points / leaderboard[0].points) * 100));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map(entry => (
          <div key={entry.rank} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">
              {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
            </div>
            <div className="flex justify-center mb-3"><Avatar initials={entry.avatar} size="lg" /></div>
            <p className="font-bold text-gray-900">{entry.name}</p>
            <p className="text-xs text-gray-400 mb-3">{entry.city}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badgeConfig[entry.badge]}`}>{entry.badge}</span>
            <p className="text-2xl font-bold text-orange-600 mt-3">{entry.points.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{entry.tasks} tasks</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-700">Your progress toward #1</p>
          <span className="text-xs text-orange-500 font-semibold">{progressPct}%</span>
        </div>
        <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #FF7A00, #FFB347)" }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          You are <span className="font-bold text-orange-600">{(leaderboard[0].points - volunteer.points).toLocaleString()} points</span> away from #1 · <span className="font-bold text-orange-600">{pointsToTop10} pts</span> to improve rank
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <div className="px-5 py-4 border-b border-orange-50 flex items-center gap-2">
          <Trophy size={18} className="text-orange-500" />
          <h3 className="font-bold text-gray-900">Volunteer Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-orange-50/60">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Volunteer</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">City</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Tasks</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {leaderboard.map(entry => (
                <tr key={entry.rank}
                  className={`transition-colors ${entry.isMe ? "bg-orange-50" : "hover:bg-gray-50/50"}`}>
                  <td className="px-5 py-4">
                    <span className={`font-bold text-sm ${entry.rank <= 3 ? "text-orange-500 text-lg" : "text-gray-500"}`}>
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={entry.avatar} size="xs" />
                      <div>
                        <p className={`text-sm font-semibold ${entry.isMe ? "text-orange-700" : "text-gray-800"}`}>
                          {entry.name}
                          {entry.isMe && <span className="ml-1.5 text-xs text-orange-400 font-normal">(You)</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell">{entry.city}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={13} className="text-orange-400" />
                      <span className="text-sm font-bold text-gray-800">{entry.points.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-medium hidden md:table-cell">{entry.tasks}</td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeConfig[entry.badge]}`}>
                      {entry.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-50">
        <div className="h-24 relative" style={{ background: "linear-gradient(135deg, #FF7A00, #FFB347)" }}>
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%"><pattern id="p" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="white" /></pattern><rect width="100%" height="100%" fill="url(#p)" /></svg>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="ring-4 ring-white rounded-full">
              <Avatar initials={volunteer.avatar} size="xl" />
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900">{volunteer.name}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={13} className="text-orange-400" />{volunteer.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Tasks", value: volunteer.tasksCompleted, icon: CheckSquare },
              { label: "Points", value: volunteer.points, icon: Star },
              { label: "Rank", value: `#${volunteer.rank}`, icon: Trophy },
              { label: "Streak", value: `${volunteer.streak}d`, icon: Flame },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center bg-orange-50 rounded-xl p-3 border border-orange-100">
                <Icon size={16} className="text-orange-500 mx-auto mb-1" />
                <p className="font-bold text-gray-900 leading-tight">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[
              { label: "Email", value: volunteer.email },
              { label: "Phone", value: volunteer.phone },
              { label: "Occupation", value: "Social Worker" },
              { label: "Member Since", value: volunteer.joinedDate },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2.5 border-b border-orange-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Skills</p>
        <div className="flex flex-wrap gap-2">
          {volunteer.skills.map(s => (
            <span key={s} className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-sm font-medium border border-orange-100">{s}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Availability</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "day", label: "Day Shift" }, { key: "night", label: "Night Shift" },
            { key: "weekdays", label: "Weekdays" }, { key: "weekends", label: "Weekends" },
          ].map(({ key, label }) => {
            const active = volunteer.availability[key as keyof typeof volunteer.availability];
            return (
              <div key={key} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium
                ${active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                <div className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`} />
                {label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Badges & Achievements</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(b => (
            <div key={b.id} className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center border transition-all
              ${b.earned ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100 opacity-50"}`}>
              <span className="text-3xl">{b.icon}</span>
              <p className="text-xs font-bold text-gray-800">{b.label}</p>
              <p className="text-xs text-gray-500">{b.desc}</p>
              {!b.earned && <span className="text-xs text-gray-400 font-medium">Locked</span>}
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
        style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
        Edit Profile
      </button>
    </div>
  );
}

function SettingsPage() {
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false });
  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Notifications</p>
        <div className="space-y-4">
          {([["email", "Email Notifications", "Receive updates via email"], ["push", "Push Notifications", "Get app notifications"], ["sms", "SMS Alerts", "Receive SMS for urgent tasks"]] as const).map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                className={`w-11 h-6 rounded-full relative transition-colors ${notifs[key] ? "bg-orange-500" : "bg-gray-200"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifs[key] ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Account</p>
        <div className="space-y-2">
          {["Change Password", "Language & Region", "Privacy Settings", "Delete Account"].map(item => (
            <button key={item}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${item === "Delete Account" ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-orange-50"}`}>
              {item}
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">About</p>
        <div className="text-xs text-gray-400 space-y-1">
          <p>SAHARA – Smart Resource Allocation System</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

const pageTitle: Record<Page, string> = {
  dashboard: "Dashboard",
  "available-tasks": "Available Tasks",
  "my-tasks": "My Tasks",
  scoreboard: "Scoreboard",
  profile: "Profile",
  settings: "Settings",
};

const navItems: { id: Page; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "available-tasks", icon: ClipboardList, label: "Available Tasks" },
  { id: "my-tasks", icon: CheckSquare, label: "My Tasks" },
  { id: "scoreboard", icon: Trophy, label: "Scoreboard" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export default function VolunteerDashboard() {
  const [, navigate] = useLocation();
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-orange-50">
        <img src={saharaLogo} alt="Sahara" className="w-24 h-auto object-contain" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setActivePage(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activePage === id ? "text-white shadow-sm" : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"}`}
            style={activePage === id ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-5 border-t border-orange-50 pt-3">
        <button onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-orange-50/30">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-60 bg-white shadow-lg border-r border-orange-100 z-30 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-orange-100 px-5 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(v => !v)}
              className="lg:hidden p-2 rounded-xl hover:bg-orange-50 text-gray-600 transition-colors">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">{pageTitle[activePage]}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">SAHARA · Smart Resource Allocation System</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)}
                className="relative p-2.5 rounded-xl hover:bg-orange-50 text-gray-500 transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-orange-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-orange-50">
                    <p className="font-bold text-sm text-gray-800">Notifications</p>
                  </div>
                  {[
                    { icon: "🎯", msg: "New high-priority task available in your area", time: "2m ago" },
                    { icon: "⚡", msg: "You earned 60 pts for completing 'Community Clean-Up'", time: "1h ago" },
                    { icon: "🏆", msg: "You moved up to Rank #4 on the leaderboard!", time: "3h ago" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b border-orange-50 last:border-0">
                      <span className="text-xl">{n.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-700 font-medium leading-snug">{n.msg}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setActivePage("profile")}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors">
              <Avatar initials={volunteer.avatar} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-tight">{volunteer.name}</p>
                <p className="text-xs text-orange-500 font-medium">Volunteer</p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">
          {activePage === "dashboard" && <DashboardPage onNavigate={setActivePage} />}
          {activePage === "available-tasks" && <AvailableTasksPage />}
          {activePage === "my-tasks" && <MyTasksPage />}
          {activePage === "scoreboard" && <ScoreboardPage />}
          {activePage === "profile" && <ProfilePage />}
          {activePage === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
