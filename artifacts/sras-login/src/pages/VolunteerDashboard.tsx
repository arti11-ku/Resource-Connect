import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard, CheckSquare, ClipboardList, Trophy, User, LogOut,
  Bell, MapPin, Clock, Star, ChevronRight, Menu, X,
  Flame, Target, Award, TrendingUp, Calendar, Filter
} from "lucide-react";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";

type Page = "dashboard" | "my-tasks" | "available-tasks" | "scoreboard" | "profile";

const volunteer = {
  name: "Priya Sharma",
  role: "Volunteer",
  location: "Mumbai, Maharashtra",
  avatar: "PS",
  email: "priya.sharma@example.com",
  phone: "+91 98765 43210",
  skills: ["First Aid", "Teaching", "Counseling"],
  points: 1240,
  rank: 4,
  tasksCompleted: 28,
  hoursVolunteered: 112,
  streak: 7,
  joinedDate: "January 2024",
};

const myTasks = [
  {
    id: 1,
    title: "Flood Relief Distribution",
    location: "Kurla, Mumbai",
    date: "Apr 22, 2026",
    time: "9:00 AM – 1:00 PM",
    status: "upcoming",
    category: "Disaster Relief",
    points: 80,
  },
  {
    id: 2,
    title: "Free Medical Camp",
    location: "Dharavi, Mumbai",
    date: "Apr 20, 2026",
    time: "10:00 AM – 4:00 PM",
    status: "in-progress",
    category: "Healthcare",
    points: 120,
  },
  {
    id: 3,
    title: "Mid-Day Meal Support",
    location: "Andheri, Mumbai",
    date: "Apr 18, 2026",
    time: "11:00 AM – 2:00 PM",
    status: "completed",
    category: "Food & Nutrition",
    points: 60,
  },
  {
    id: 4,
    title: "Literacy Drive – Weekend",
    location: "Bandra, Mumbai",
    date: "Apr 12, 2026",
    time: "9:00 AM – 12:00 PM",
    status: "completed",
    category: "Education",
    points: 90,
  },
];

const availableTasks = [
  {
    id: 5,
    title: "Blood Donation Camp",
    location: "Dadar, Mumbai",
    date: "Apr 25, 2026",
    time: "8:00 AM – 5:00 PM",
    category: "Healthcare",
    points: 100,
    slots: 3,
    urgent: true,
  },
  {
    id: 6,
    title: "Tree Plantation Drive",
    location: "Sanjay Gandhi Park, Mumbai",
    date: "Apr 27, 2026",
    time: "7:00 AM – 10:00 AM",
    category: "Environment",
    points: 70,
    slots: 10,
    urgent: false,
  },
  {
    id: 7,
    title: "Women's Skill Workshop",
    location: "Govandi, Mumbai",
    date: "Apr 28, 2026",
    time: "10:00 AM – 1:00 PM",
    category: "Education",
    points: 85,
    slots: 5,
    urgent: false,
  },
  {
    id: 8,
    title: "Elderly Care Visit",
    location: "Chembur, Mumbai",
    date: "Apr 30, 2026",
    time: "2:00 PM – 5:00 PM",
    category: "Healthcare",
    points: 75,
    slots: 2,
    urgent: true,
  },
];

const leaderboard = [
  { rank: 1, name: "Aarav Patel", points: 2180, tasks: 45, avatar: "AP", city: "Pune" },
  { rank: 2, name: "Sneha Reddy", points: 1890, tasks: 38, avatar: "SR", city: "Hyderabad" },
  { rank: 3, name: "Rohan Mehta", points: 1560, tasks: 32, avatar: "RM", city: "Bangalore" },
  { rank: 4, name: "Priya Sharma", points: 1240, tasks: 28, avatar: "PS", city: "Mumbai", isMe: true },
  { rank: 5, name: "Deepika Nair", points: 1100, tasks: 24, avatar: "DN", city: "Chennai" },
  { rank: 6, name: "Vikram Singh", points: 980, tasks: 21, avatar: "VS", city: "Delhi" },
  { rank: 7, name: "Anita Joshi", points: 850, tasks: 18, avatar: "AJ", city: "Jaipur" },
];

const categoryColors: Record<string, string> = {
  "Disaster Relief": "bg-red-100 text-red-700",
  "Healthcare": "bg-blue-100 text-blue-700",
  "Food & Nutrition": "bg-green-100 text-green-700",
  "Education": "bg-purple-100 text-purple-700",
  "Environment": "bg-emerald-100 text-emerald-700",
};

const statusConfig = {
  upcoming: { label: "Upcoming", cls: "bg-orange-100 text-orange-700" },
  "in-progress": { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
};

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-orange-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar initials={volunteer.avatar} size="xl" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900">{volunteer.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Volunteer</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
            <MapPin size={14} className="text-orange-400" />
            {volunteer.location}
          </div>
          <div className="flex flex-wrap gap-2">
            {volunteer.skills.map(s => (
              <span key={s} className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 bg-orange-50 rounded-2xl px-6 py-4 border border-orange-100">
          <Flame size={20} className="text-orange-500" />
          <span className="text-2xl font-bold text-orange-600">{volunteer.streak}</span>
          <span className="text-xs text-gray-500 font-medium">Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Tasks Completed" value={volunteer.tasksCompleted} sub="+3 this month" color="bg-orange-100 text-orange-600" />
        <StatCard icon={Clock} label="Hours Volunteered" value={volunteer.hoursVolunteered} sub="Lifetime total" color="bg-blue-100 text-blue-600" />
        <StatCard icon={Star} label="Total Points" value={volunteer.points.toLocaleString()} sub="Rank #4 overall" color="bg-yellow-100 text-yellow-600" />
        <StatCard icon={Trophy} label="Your Rank" value={`#${volunteer.rank}`} sub="Top 5% volunteer" color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">My Active Tasks</h3>
            <button className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {myTasks.filter(t => t.status !== "completed").map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <MapPin size={11} className="text-orange-400 shrink-0" />
                    <span className="truncate">{task.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <Calendar size={11} className="text-orange-400 shrink-0" />
                    {task.date}
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig[task.status].cls}`}>
                  {statusConfig[task.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Top Volunteers</h3>
            <button className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors flex items-center gap-1">
              Full board <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2.5">
            {leaderboard.slice(0, 5).map(entry => (
              <div key={entry.rank}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${entry.isMe ? "bg-orange-50 border border-orange-200" : "hover:bg-gray-50"}`}>
                <span className={`w-6 text-center text-sm font-bold ${entry.rank <= 3 ? "text-orange-500" : "text-gray-400"}`}>
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                </span>
                <Avatar initials={entry.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.isMe ? "text-orange-700" : "text-gray-800"}`}>
                    {entry.name} {entry.isMe && <span className="text-xs font-normal">(You)</span>}
                  </p>
                  <p className="text-xs text-gray-400">{entry.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MyTasksPage() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "in-progress" | "completed">("all");
  const filtered = filter === "all" ? myTasks : myTasks.filter(t => t.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "upcoming", "in-progress", "completed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === f
              ? "text-white shadow-sm"
              : "bg-white text-gray-600 border border-orange-100 hover:border-orange-300"}`}
            style={filter === f ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}
          >
            {f.replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(task => (
          <div key={task.id} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{task.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[task.category] || "bg-gray-100 text-gray-700"}`}>
                    {task.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig[task.status].cls}`}>
                    {statusConfig[task.status].label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-xl px-3 py-1.5">
                <Star size={14} className="text-orange-500" />
                <span className="text-sm font-bold text-orange-700">{task.points} pts</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-orange-400" /> {task.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-orange-400" /> {task.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-orange-400" /> {task.time}
              </span>
            </div>

            {task.status !== "completed" && (
              <div className="mt-4 flex gap-2">
                <button
                  className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
                >
                  {task.status === "in-progress" ? "Mark Complete" : "View Details"}
                </button>
                <button className="px-4 py-2 rounded-xl border border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-orange-50">
            <ClipboardList size={40} className="text-orange-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tasks found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AvailableTasksPage() {
  const [search, setSearch] = useState("");
  const filtered = availableTasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Search tasks by title or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-orange-200 bg-white text-sm placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(task => (
          <div key={task.id} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {task.urgent && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">Urgent</span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[task.category] || "bg-gray-100 text-gray-700"}`}>
                    {task.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900">{task.title}</h3>
              </div>
              <div className="flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-xl px-2.5 py-1.5 shrink-0">
                <Star size={13} className="text-orange-500" />
                <span className="text-sm font-bold text-orange-700">{task.points}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-orange-400 shrink-0" /> {task.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-orange-400 shrink-0" /> {task.date}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-orange-400 shrink-0" /> {task.time}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">
                {task.slots} slot{task.slots !== 1 ? "s" : ""} left
              </span>
              <button
                className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
              >
                Join Task
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center shadow-sm border border-orange-50">
            <Target size={40} className="text-orange-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tasks found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreboardPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map(entry => (
          <div key={entry.rank} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-orange-50">
            <div className="text-3xl mb-2">
              {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
            </div>
            <Avatar initials={entry.avatar} size="lg" />
            <p className="font-bold text-gray-900 mt-3">{entry.name}</p>
            <p className="text-xs text-gray-500">{entry.city}</p>
            <p className="text-xl font-bold text-orange-600 mt-2">{entry.points.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{entry.tasks} tasks</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <div className="px-5 py-4 border-b border-orange-50">
          <h3 className="font-bold text-gray-900">All Volunteers</h3>
        </div>
        <div className="divide-y divide-orange-50">
          {leaderboard.map(entry => (
            <div key={entry.rank}
              className={`flex items-center gap-4 px-5 py-4 transition-colors ${entry.isMe ? "bg-orange-50" : "hover:bg-gray-50"}`}>
              <span className={`w-8 text-center font-bold text-sm ${entry.rank <= 3 ? "text-orange-500" : "text-gray-400"}`}>
                #{entry.rank}
              </span>
              <Avatar initials={entry.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${entry.isMe ? "text-orange-700" : "text-gray-800"}`}>
                  {entry.name} {entry.isMe && <span className="text-xs font-normal text-orange-400">(You)</span>}
                </p>
                <p className="text-xs text-gray-400">{entry.city}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                <CheckSquare size={14} className="text-orange-400" />
                {entry.tasks} tasks
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-xl px-3 py-1.5">
                <TrendingUp size={13} className="text-orange-500" />
                <span className="font-bold text-orange-700 text-sm">{entry.points.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50">
        <div className="flex items-center gap-5 mb-6">
          <Avatar initials={volunteer.avatar} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{volunteer.name}</h2>
            <p className="text-sm text-gray-500">{volunteer.email}</p>
            <p className="text-sm text-gray-500">{volunteer.phone}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {volunteer.joinedDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Tasks Done", value: volunteer.tasksCompleted, icon: CheckSquare },
            { label: "Hours", value: volunteer.hoursVolunteered, icon: Clock },
            { label: "Points", value: volunteer.points, icon: Star },
            { label: "Rank", value: `#${volunteer.rank}`, icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center bg-orange-50 rounded-xl p-3 border border-orange-100">
              <Icon size={18} className="text-orange-500 mx-auto mb-1" />
              <p className="font-bold text-gray-900 text-lg leading-tight">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">My Skills</p>
          <div className="flex flex-wrap gap-2">
            {volunteer.skills.map(s => (
              <span key={s} className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-sm font-medium border border-orange-100">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Badges Earned</p>
        <div className="flex flex-wrap gap-4">
          {[
            { icon: "🌟", label: "First Task", desc: "Completed your first task" },
            { icon: "🔥", label: "On Fire", desc: "7-day activity streak" },
            { icon: "💊", label: "Healer", desc: "5 healthcare tasks" },
            { icon: "📚", label: "Educator", desc: "3 education tasks" },
          ].map(badge => (
            <div key={badge.label} className="flex flex-col items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 text-center">
              <span className="text-3xl">{badge.icon}</span>
              <p className="text-sm font-bold text-gray-800">{badge.label}</p>
              <p className="text-xs text-gray-500">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Account Details</p>
        <div className="space-y-3">
          {[
            { label: "Full Name", value: volunteer.name },
            { label: "Email", value: volunteer.email },
            { label: "Phone", value: volunteer.phone },
            { label: "Location", value: volunteer.location },
            { label: "Availability", value: "Weekdays · Day Shift" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-orange-50 last:border-0">
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <span className="text-sm text-gray-800 font-semibold">{value}</span>
            </div>
          ))}
        </div>
        <button
          className="mt-5 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

const pageTitle: Record<Page, string> = {
  dashboard: "Dashboard",
  "my-tasks": "My Tasks",
  "available-tasks": "Available Tasks",
  scoreboard: "Scoreboard",
  profile: "Profile",
};

const navItems: { id: Page; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "my-tasks", icon: CheckSquare, label: "My Tasks" },
  { id: "available-tasks", icon: ClipboardList, label: "Available Tasks" },
  { id: "scoreboard", icon: Trophy, label: "Scoreboard" },
  { id: "profile", icon: User, label: "Profile" },
];

export default function VolunteerDashboard() {
  const [, navigate] = useLocation();
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-orange-50">
        <img src={saharaLogo} alt="Sahara" className="w-24 h-auto object-contain" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { setActivePage(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activePage === id
                ? "text-white shadow-sm"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"}`}
            style={activePage === id ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-5 border-t border-orange-50 pt-3">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-orange-50/40">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white shadow-lg border-r border-orange-100 z-30 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none`}
      >
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-orange-100 px-5 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="lg:hidden p-2 rounded-xl hover:bg-orange-50 text-gray-600 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="font-bold text-gray-900 text-base">{pageTitle[activePage]}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-orange-50 text-gray-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
            </button>
            <button
              onClick={() => setActivePage("profile")}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors"
            >
              <Avatar initials={volunteer.avatar} size="sm" />
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">{volunteer.name}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "my-tasks" && <MyTasksPage />}
          {activePage === "available-tasks" && <AvailableTasksPage />}
          {activePage === "scoreboard" && <ScoreboardPage />}
          {activePage === "profile" && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}
