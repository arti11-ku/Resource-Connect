import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { apiFetch, type BackendTask } from "../lib/api";
import { FadeDown, FadeUp, FadeIn, StaggerList, StaggerItem, HoverCard, MountFade, SlideInHeader, chartTooltipStyle, chartTooltipCursor } from "../lib/AnimatedComponents";
import { useLocation } from "wouter";
import {
  LayoutDashboard, CheckSquare, ClipboardList, Trophy, User, LogOut,
  Bell, MapPin, Clock, Star, ChevronRight, ChevronLeft, Menu, X,
  Flame, Calendar, Filter, Settings,
  Zap, AlertCircle, CheckCircle2, Circle, RefreshCw,
  Heart, Leaf, BookOpen, Stethoscope, Upload, Pencil, Save, Plus
} from "lucide-react";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";
import gallery1 from "@assets/WhatsApp_Image_2026-04-21_at_11.06.47_PM_1776793392967.jpeg";
import gallery2 from "@assets/WhatsApp_Image_2026-04-21_at_11.06.48_PM_1776793392968.jpeg";
import gallery3 from "@assets/WhatsApp_Image_2026-04-21_at_11.06.49_PM_1776793392969.jpeg";
import gallery4 from "@assets/WhatsApp_Image_2026-04-21_at_11.06.50_PM_1776793392969.jpeg";
import gallery5 from "@assets/WhatsApp_Image_2026-04-21_at_11.06.51_PM_1776793392969.jpeg";
import gallery6 from "@assets/WhatsApp_Image_2026-04-21_at_11.06.52_PM_1776793392970.jpeg";
import gallery7 from "@assets/WhatsApp_Image_2026-04-21_at_11.06.53_PM_1776793392970.jpeg";
import AIChatbot from "../components/AIChatbot";
import EmptyState from "../components/EmptyState";
import { recommendTasks, verifyProof, type AIPriority } from "../lib/ai";

const carouselImages = [
  { src: gallery1, alt: "Education for All — Sahara volunteers teaching children" },
  { src: gallery2, alt: "Food Distribution Drive" },
  { src: gallery3, alt: "Beach cleanup volunteers" },
  { src: gallery4, alt: "Tree Plantation Drive" },
  { src: gallery5, alt: "Donation drive volunteers" },
  { src: gallery6, alt: "Tree planting in progress" },
  { src: gallery7, alt: "NGO volunteer with community" },
];

function ImageMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let raf = 0;
    const update = () => {
      const rect = container.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const half = rect.width / 2;
      const items = track.querySelectorAll<HTMLElement>("[data-marquee-item]");
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        const itemCenter = r.left + r.width / 2;
        const t = Math.min(Math.abs(itemCenter - center) / half, 1);
        const scale = 1.12 - 0.27 * t;
        const opacity = 1 - 0.45 * t;
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
      });
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...carouselImages, ...carouselImages];
  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-orange-50 py-7"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
      <div
        ref={trackRef}
        className="flex w-max gap-5 animate-marquee-x px-4 items-center"
      >
        {items.map((img, i) => (
          <div
            key={i}
            data-marquee-item
            className="shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-orange-50 will-change-transform origin-center"
            style={{ transition: "opacity 0.3s ease" }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              draggable={false}
              className="h-40 w-64 sm:h-48 sm:w-80 object-cover block"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type Page = "dashboard" | "available-tasks" | "my-tasks" | "scoreboard" | "profile" | "settings";
type TaskStatus = "pending" | "in-progress" | "completed";

interface MyTaskItem {
  id: number | string;
  title: string;
  location: string;
  deadline: string;
  time: string;
  status: TaskStatus;
  category: string;
  points: number;
  proof?: string;
}

type AvailableTask = {
  id: number | string;
  title: string;
  location: string;
  deadline: string;
  time: string;
  skills: string[];
  urgency: "high" | "medium" | "low";
  category: string;
  points: number;
  slots: number;
  description: string;
};

function formatDateLabel(iso: string | null): string {
  if (!iso) return "TBD";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "TBD";
  }
}

function backendTaskToAvailable(t: BackendTask): AvailableTask {
  return {
    id: t.id,
    title: t.title,
    location: t.location || "",
    deadline: formatDateLabel(t.deadline),
    time: "",
    skills: t.required_skills || [],
    urgency: t.priority,
    category: "General",
    points: 50,
    slots: 1,
    description: t.description || "",
  };
}

function backendStatusToVolunteer(s: BackendTask["status"]): TaskStatus {
  if (s === "completed") return "completed";
  if (s === "in_progress") return "in-progress";
  return "pending";
}

function volunteerStatusToBackend(s: TaskStatus): BackendTask["status"] {
  if (s === "in-progress") return "in_progress";
  return s;
}

function backendTaskToMine(t: BackendTask): MyTaskItem {
  return {
    id: t.id,
    title: t.title,
    location: t.location || "",
    deadline: formatDateLabel(t.deadline),
    time: "",
    status: backendStatusToVolunteer(t.status),
    category: "General",
    points: 50,
  };
}

interface VolunteerProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  occupation: string;
  skills: string[];
  availability: { day: boolean; night: boolean; weekdays: boolean; weekends: boolean };
  joinedDate: string;
  streak: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  tasks: number;
  city: string;
  avatar: string;
  badge: string;
  isMe?: boolean;
}

const FALLBACK_PROFILE: VolunteerProfile = {
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
  phone: "+91 98765 43210",
  location: "Mumbai, Maharashtra",
  occupation: "Social Worker",
  skills: ["First Aid", "Teaching", "Counseling", "Driving"],
  availability: { day: true, night: false, weekdays: true, weekends: true },
  joinedDate: "January 2024",
  streak: 7,
};

function getInitialProfile(): VolunteerProfile {
  try {
    const saved = localStorage.getItem("sahara_user");
    if (saved) {
      const u = JSON.parse(saved);
      const hasData = u.name || u.email || u.city;
      if (hasData) {
        return {
          name: u.name || FALLBACK_PROFILE.name,
          email: u.email || FALLBACK_PROFILE.email,
          phone: u.phone || FALLBACK_PROFILE.phone,
          location: u.city && u.state
            ? `${u.city}, ${u.state}`
            : u.city || FALLBACK_PROFILE.location,
          occupation: u.occupation || FALLBACK_PROFILE.occupation,
          skills: u.skills?.length ? u.skills : FALLBACK_PROFILE.skills,
          availability: u.availability
            ? { day: u.availability.day, night: u.availability.night, weekdays: u.availability.weekdays, weekends: u.availability.weekends }
            : FALLBACK_PROFILE.availability,
          joinedDate: new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }),
          streak: 0,
        };
      }
    }
  } catch {}
  return FALLBACK_PROFILE;
}

const INITIAL_POINTS = 1240;
const INITIAL_TASKS_COMPLETED = 28;

const INITIAL_AVAILABLE_TASKS: AvailableTask[] = [
  { id: 1, title: "Flood Relief Distribution", location: "Kurla, Mumbai", deadline: "Apr 22, 2026", time: "9:00 AM – 1:00 PM", skills: ["First Aid", "Driving"], urgency: "high", category: "Disaster Relief", points: 120, slots: 3, description: "Help distribute essential supplies to flood-affected families." },
  { id: 2, title: "Free Medical Camp", location: "Dharavi, Mumbai", deadline: "Apr 25, 2026", time: "10:00 AM – 4:00 PM", skills: ["First Aid", "Counseling"], urgency: "high", category: "Healthcare", points: 150, slots: 2, description: "Assist doctors and nurses at a free health screening camp." },
  { id: 3, title: "Women's Skill Workshop", location: "Govandi, Mumbai", deadline: "Apr 28, 2026", time: "10:00 AM – 1:00 PM", skills: ["Teaching"], urgency: "medium", category: "Education", points: 85, slots: 5, description: "Conduct vocational skill sessions for underprivileged women." },
  { id: 4, title: "Tree Plantation Drive", location: "Sanjay Gandhi Park", deadline: "Apr 27, 2026", time: "7:00 AM – 10:00 AM", skills: [], urgency: "low", category: "Environment", points: 60, slots: 10, description: "Join us for a city-wide plantation initiative." },
  { id: 5, title: "Blood Donation Camp", location: "Dadar, Mumbai", deadline: "Apr 30, 2026", time: "8:00 AM – 5:00 PM", skills: ["First Aid"], urgency: "high", category: "Healthcare", points: 110, slots: 1, description: "Support blood donation drives across the city." },
  { id: 6, title: "Elderly Care Visit", location: "Chembur, Mumbai", deadline: "May 2, 2026", time: "2:00 PM – 5:00 PM", skills: ["Counseling"], urgency: "medium", category: "Healthcare", points: 75, slots: 4, description: "Spend time with elderly residents at a care home." },
];

const INITIAL_MY_TASKS: MyTaskItem[] = [
  { id: 10, title: "Mid-Day Meal Support", location: "Andheri, Mumbai", deadline: "Apr 20, 2026", time: "11:00 AM – 2:00 PM", status: "in-progress", category: "Food & Nutrition", points: 60 },
  { id: 11, title: "Literacy Drive – Weekend", location: "Bandra, Mumbai", deadline: "Apr 22, 2026", time: "9:00 AM – 12:00 PM", status: "pending", category: "Education", points: 90 },
  { id: 12, title: "Community Clean-Up", location: "Colaba, Mumbai", deadline: "Apr 15, 2026", time: "6:00 AM – 9:00 AM", status: "completed", category: "Environment", points: 50 },
  { id: 13, title: "Orphanage Visit & Workshop", location: "Chembur, Mumbai", deadline: "Apr 10, 2026", time: "10:00 AM – 1:00 PM", status: "completed", category: "Education", points: 100 },
];

const BASE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Aarav Patel", points: 2180, tasks: 45, city: "Pune", avatar: "AP", badge: "Hero Contributor" },
  { rank: 2, name: "Sneha Reddy", points: 1890, tasks: 38, city: "Hyderabad", avatar: "SR", badge: "Hero Contributor" },
  { rank: 3, name: "Rohan Mehta", points: 1560, tasks: 32, city: "Bangalore", avatar: "RM", badge: "Active Volunteer" },
  { rank: 4, name: "Priya Sharma", points: INITIAL_POINTS, tasks: INITIAL_TASKS_COMPLETED, city: "Mumbai", avatar: "PS", badge: "Active Volunteer", isMe: true },
  { rank: 5, name: "Deepika Nair", points: 1100, tasks: 24, city: "Chennai", avatar: "DN", badge: "Active Volunteer" },
  { rank: 6, name: "Vikram Singh", points: 980, tasks: 21, city: "Delhi", avatar: "VS", badge: "Beginner" },
  { rank: 7, name: "Anita Joshi", points: 850, tasks: 18, city: "Jaipur", avatar: "AJ", badge: "Beginner" },
  { rank: 8, name: "Karan Bose", points: 720, tasks: 15, city: "Kolkata", avatar: "KB", badge: "Beginner" },
  { rank: 9, name: "Meera Pillai", points: 610, tasks: 13, city: "Kochi", avatar: "MP", badge: "Beginner" },
  { rank: 10, name: "Arjun Tiwari", points: 520, tasks: 11, city: "Lucknow", avatar: "AT", badge: "Beginner" },
];

const notifications = [
  { icon: "🎯", msg: "New high-priority task 'Blood Donation Camp' available near you.", date: "Apr 19, 2026", time: "10:32 AM" },
  { icon: "⚡", msg: "You earned 60 pts for completing 'Community Clean-Up'. Great job!", date: "Apr 18, 2026", time: "3:15 PM" },
  { icon: "🏆", msg: "You moved up to Rank #4 on the leaderboard. Keep going!", date: "Apr 17, 2026", time: "9:00 AM" },
  { icon: "📣", msg: "Reminder: 'Literacy Drive – Weekend' deadline is Apr 22, 2026.", date: "Apr 16, 2026", time: "8:00 AM" },
  { icon: "🌟", msg: "You earned the 'On Fire' badge for a 7-day activity streak!", date: "Apr 15, 2026", time: "6:45 PM" },
  { icon: "📋", msg: "'Mid-Day Meal Support' task has been assigned to you.", date: "Apr 14, 2026", time: "11:00 AM" },
  { icon: "🎉", msg: "SAHARA crossed 5,000 volunteer hours this month — you contributed!", date: "Apr 13, 2026", time: "5:00 PM" },
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
  const sizes = { xs: "w-7 h-7 text-xs", sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-16 h-16 text-xl", xl: "w-20 h-20 text-2xl" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, textColor }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string; textColor: string }) {
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

function TaskCard({ task, accepted, onAccept }: { task: AvailableTask; accepted: boolean; onAccept: (id: AvailableTask["id"]) => void }) {
  const urgency = urgencyConfig[task.urgency as keyof typeof urgencyConfig];
  const CategoryIcon = categoryIcons[task.category] || ClipboardList;
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all flex flex-col gap-3 ${accepted ? "border-orange-200 bg-orange-50/30" : "border-orange-50 hover:border-orange-100"}`}>
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
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={12} className="text-orange-400 shrink-0" />{task.location}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar size={12} className="text-orange-400 shrink-0" />Deadline: {task.deadline}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><Clock size={12} className="text-orange-400 shrink-0" />{task.time}</div>
      </div>
      {task.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium">{s}</span>)}
        </div>
      )}
      <div className="flex items-center justify-between pt-1 border-t border-orange-50">
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-xl px-3 py-1.5">
          <Zap size={13} className="text-orange-500" />
          <span className="text-sm font-bold text-orange-700">+{task.points} pts</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{task.slots} slot{task.slots !== 1 ? "s" : ""} left</span>
          {accepted ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-green-100 text-green-700 border border-green-200">
              <CheckCircle2 size={13} /> Accepted
            </span>
          ) : (
            <button onClick={() => onAccept(task.id)}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
              Accept Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ onNavigate, myTasksList, totalPoints, tasksCompleted, profile, availableTasks }: {
  onNavigate: (p: Page) => void;
  myTasksList: MyTaskItem[];
  totalPoints: number;
  tasksCompleted: number;
  profile: VolunteerProfile;
  availableTasks: AvailableTask[];
}) {
  const nextRank = 1360;
  const progressPct = Math.min(100, Math.round((totalPoints / nextRank) * 100));
  const activeTasks = myTasksList.filter(t => t.status !== "completed").length;

  return (
    <MountFade className="space-y-6">
      <FadeDown>
        <div className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FF7A00 0%, #FF9A40 60%, #FFB347 100%)" }}>
          <div className="absolute right-0 top-0 opacity-10">
            <svg width="180" height="120" viewBox="0 0 180 120">
              <circle cx="150" cy="20" r="60" fill="white" /><circle cx="30" cy="100" r="40" fill="white" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-orange-100 text-sm font-medium mb-1">Good morning,</p>
            <h2 className="text-2xl font-bold mb-1">{profile.name} 👋</h2>
            <p className="text-orange-100 text-sm">Ready to make an impact today?</p>
            {profile.streak > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <Flame size={16} className="text-yellow-300" />
                <span className="text-sm font-semibold text-yellow-200">{profile.streak}-day streak — keep it going!</span>
              </div>
            )}
          </div>
        </div>
      </FadeDown>

      <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <motion.button onClick={() => onNavigate("my-tasks")} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }} className="text-left w-full">
            <StatCard icon={CheckSquare} label="Tasks Completed" value={tasksCompleted} sub="+3 this month" color="bg-orange-100" textColor="text-orange-600" />
          </motion.button>
        </StaggerItem>
        <StaggerItem>
          <motion.button onClick={() => onNavigate("scoreboard")} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }} className="text-left w-full">
            <StatCard icon={Star} label="Points Earned" value={totalPoints.toLocaleString()} sub="Active Volunteer tier" color="bg-yellow-100" textColor="text-yellow-600" />
          </motion.button>
        </StaggerItem>
        <StaggerItem>
          <motion.button onClick={() => onNavigate("my-tasks")} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }} className="text-left w-full">
            <StatCard icon={ClipboardList} label="Active Tasks" value={activeTasks} sub="In progress now" color="bg-blue-100" textColor="text-blue-600" />
          </motion.button>
        </StaggerItem>
        <StaggerItem>
          <motion.button onClick={() => onNavigate("scoreboard")} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }} className="text-left w-full">
            <StatCard icon={Trophy} label="Leaderboard Rank" value="#4" sub="Top 5% volunteer" color="bg-purple-100" textColor="text-purple-600" />
          </motion.button>
        </StaggerItem>
      </StaggerList>

      <FadeUp delay={0.05}>
        <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-700">Progress to next rank</p>
            <span className="text-xs text-orange-500 font-semibold">{totalPoints} / {nextRank} pts</span>
          </div>
          <div className="h-2.5 bg-orange-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              style={{ background: "linear-gradient(90deg, #FF7A00, #FFB347)" }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            You are <span className="font-semibold text-orange-600">{Math.max(0, nextRank - totalPoints)} points</span> away from <span className="font-semibold">Top 3</span>
          </p>
        </HoverCard>
      </FadeUp>

      <FadeUp delay={0.08}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                <Zap size={14} className="text-orange-500" />
              </span>
              <h3 className="font-bold text-gray-900">Recommended Tasks for You</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 uppercase tracking-wide">AI</span>
            </div>
          </div>
          {(() => {
            const recs = recommendTasks(
              availableTasks.map(t => ({
                id: t.id, title: t.title, description: t.description,
                category: t.category, requiredSkills: t.skills, location: t.location,
              })),
              { skills: profile.skills, location: profile.location, pastCategories: ["Healthcare", "Environment"] },
              3
            );
            const map = new Map(availableTasks.map(t => [t.id, t]));
            const items = recs.map(r => ({ rec: r, task: map.get(r.taskId) })).filter(x => x.task);
            if (items.length === 0) {
              return (
                <EmptyState
                  variant="recommend"
                  compact
                  title="No recommendations right now"
                  description="Check back soon — we'll match you with tasks that fit your skills and area."
                />
              );
            }
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {items.map(({ rec, task }) => task && (
                  <div key={String(task.id)} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 hover:shadow-md transition-all flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-gray-900 leading-snug">{task.title}</p>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">{rec.score}% match</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{task.description}</p>
                    <p className="text-[11px] text-orange-600 font-medium">💡 {rec.reason}</p>
                    <div className="flex items-center justify-between pt-1 mt-auto">
                      <span className="text-xs text-gray-400">{task.location}</span>
                      <button
                        onClick={() => onNavigate("available-tasks")}
                        className="px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Available Tasks</h3>
            <motion.button onClick={() => onNavigate("available-tasks")}
              whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
              className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors flex items-center gap-1">
              View all <ChevronRight size={14} />
            </motion.button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {availableTasks.slice(0, 2).map(task => (
              <TaskCard key={task.id} task={task} accepted={false} onAccept={() => onNavigate("available-tasks")} />
            ))}
          </div>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeUp delay={0.12}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">My Tasks</h3>
              <motion.button onClick={() => onNavigate("my-tasks")}
                whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
                className="text-xs text-orange-500 font-semibold hover:text-orange-600 flex items-center gap-1">
                View all <ChevronRight size={14} />
              </motion.button>
            </div>
            <div className="space-y-3">
              {myTasksList.slice(0, 4).map(task => {
                const st = statusConfig[task.status];
                const Icon = st.icon;
                return (
                  <motion.div key={task.id}
                    whileHover={{ x: 3, backgroundColor: "rgba(255,122,0,0.04)" }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-transparent">
                    <Icon size={16} className={task.status === "completed" ? "text-green-500" : task.status === "in-progress" ? "text-blue-500" : "text-yellow-500"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400">Deadline: {task.deadline}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </HoverCard>
        </FadeUp>

        <FadeUp delay={0.16}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Profile Summary</h3>
              <motion.button onClick={() => onNavigate("profile")}
                whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
                className="text-xs text-orange-500 font-semibold hover:text-orange-600 flex items-center gap-1">
                Edit <ChevronRight size={14} />
              </motion.button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} size="md" />
              <div>
                <p className="font-bold text-gray-900">{profile.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} className="text-orange-400" /> {profile.location}
                </div>
              </div>
            </div>
            {profile.skills.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(s => (
                    <motion.span key={s}
                      whileHover={{ scale: 1.06 }} transition={{ duration: 0.15 }}
                      className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium cursor-default">{s}</motion.span>
                  ))}
                </div>
              </div>
            )}
            <motion.button onClick={() => onNavigate("profile")}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
              className="mt-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
              Edit Profile
            </motion.button>
          </HoverCard>
        </FadeUp>
      </div>

      <FadeUp delay={0.18}>
        <ImageMarquee />
      </FadeUp>
    </MountFade>
  );
}

function AvailableTasksPage({ tasks, acceptedIds, onAccept }: { tasks: AvailableTask[]; acceptedIds: Set<AvailableTask["id"]>; onAccept: (id: AvailableTask["id"]) => void }) {
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchUrgency = urgencyFilter === "all" || t.urgency === urgencyFilter;
    return matchSearch && matchUrgency;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50/30 text-sm placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "high", "medium", "low"] as const).map(f => (
            <button key={f} onClick={() => setUrgencyFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${urgencyFilter === f ? "text-white shadow-sm" : "bg-orange-50 text-gray-600 border border-orange-100 hover:border-orange-300"}`}
              style={urgencyFilter === f ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}>
              {f === "all" ? "All" : `${f} priority`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(task => <TaskCard key={task.id} task={task} accepted={acceptedIds.has(task.id)} onAccept={onAccept} />)}
        {filtered.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-orange-50">
            <EmptyState
              variant="tasks"
              title="No tasks found"
              description="Try clearing your filters or check back soon for new opportunities."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MyTasksPage({ myTasksList, onUpdateStatus, onUploadProof, onAddTask }: {
  myTasksList: MyTaskItem[];
  onUpdateStatus: (id: MyTaskItem["id"], status: TaskStatus) => void;
  onUploadProof: (id: MyTaskItem["id"], filename: string) => void;
  onAddTask?: (task: MyTaskItem) => void;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", category: "Healthcare", location: "", deadline: "", time: "", points: "50" });
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const filtered = filter === "all" ? myTasksList : myTasksList.filter(t => t.status === filter);

  function handleAddTask() {
    if (!addForm.title.trim()) return;
    const newTask: MyTaskItem = {
      id: Date.now(), title: addForm.title, category: addForm.category,
      location: addForm.location || "TBD",
      deadline: addForm.deadline || "TBD", time: addForm.time || "TBD",
      status: "pending", points: Number(addForm.points) || 50,
    };
    onAddTask?.(newTask);
    setAddForm({ title: "", category: "Healthcare", location: "", deadline: "", time: "", points: "50" });
    setShowAddForm(false);
  }

  function handleFileChange(taskId: MyTaskItem["id"], e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUploadProof(taskId, file.name);
  }

  return (
    <MountFade className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "in-progress", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? "text-white shadow-sm" : "bg-white text-gray-600 border border-orange-100 hover:border-orange-300"}`}
              style={filter === f ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}>
              {f.replace("-", " ")}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
          <Plus size={15} /> Add Task
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
          <h3 className="font-bold text-gray-800 mb-4">Add New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Title *</label>
              <input value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Task title..." className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
              <select value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 bg-white">
                {["Healthcare", "Education", "Disaster Relief", "Environment", "Food & Nutrition"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Location</label>
              <input value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Location..." className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Deadline</label>
              <input type="date" value={addForm.deadline} onChange={e => setAddForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Time</label>
              <input value={addForm.time} onChange={e => setAddForm(f => ({ ...f, time: e.target.value }))}
                placeholder="e.g. 9:00 AM – 1:00 PM" className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Points</label>
              <input type="number" value={addForm.points} onChange={e => setAddForm(f => ({ ...f, points: e.target.value }))}
                min="0" className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAddTask}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>Add Task</button>
            <button onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 rounded-xl border border-orange-200 text-sm text-gray-500 hover:bg-orange-50">Cancel</button>
          </div>
        </div>
      )}

      <StaggerList className="space-y-3">
        {filtered.map(task => {
          const st = statusConfig[task.status];
          const Icon = st.icon;
          const CategoryIcon = categoryIcons[task.category] || ClipboardList;
          return (
            <StaggerItem key={task.id}>
            <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
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
                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-orange-400" />Deadline: {task.deadline}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} className="text-orange-400" />{task.time}</span>
              </div>

              {task.status !== "completed" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {task.status === "pending" && (
                      <button onClick={() => onUpdateStatus(task.id, "in-progress")}
                        className="px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                        style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
                        Start Task
                      </button>
                    )}
                    {task.status === "in-progress" && (
                      <button onClick={() => onUpdateStatus(task.id, "completed")}
                        className="px-4 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                        style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                        Mark as Completed
                      </button>
                    )}
                    <button
                      onClick={() => fileRefs.current[task.id]?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-bold hover:bg-orange-50 transition-colors">
                      <Upload size={15} />
                      {task.proof ? "Replace Proof" : "Upload Proof"}
                    </button>
                    <input ref={el => { fileRefs.current[task.id] = el; }} type="file" accept="image/*,.pdf,.doc,.docx"
                      className="hidden" onChange={e => handleFileChange(task.id, e)} />
                  </div>
                  {task.proof && (() => {
                    const ai = verifyProof(task.proof);
                    const cls = ai.status === "verified"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : ai.status === "suspicious"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-yellow-50 border-yellow-200 text-yellow-700";
                    const label = ai.status === "verified" ? "Verified" : ai.status === "suspicious" ? "Needs Review" : "Pending AI Check";
                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200 w-fit">
                          <CheckCircle2 size={14} className="text-green-600" />
                          <span className="text-xs text-green-700 font-medium">{task.proof}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${cls}`}>
                          <Zap size={12} /> {label} · {ai.confidence}%
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {task.status === "completed" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                    <CheckCircle2 size={16} /> Task completed — <span className="text-orange-600">+{task.points} pts awarded!</span>
                  </div>
                  {task.proof && (() => {
                    const ai = verifyProof(task.proof);
                    const cls = ai.status === "verified"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : ai.status === "suspicious"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-yellow-50 border-yellow-200 text-yellow-700";
                    const label = ai.status === "verified" ? "Verified" : ai.status === "suspicious" ? "Needs Review" : "Pending AI Check";
                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200 w-fit">
                          <CheckCircle2 size={14} className="text-green-600" />
                          <span className="text-xs text-green-700 font-medium">Proof: {task.proof}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${cls}`}>
                          <Zap size={12} /> {label} · {ai.confidence}%
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </HoverCard>
            </StaggerItem>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-50">
            <EmptyState
              variant="tasks"
              title="No tasks in this category"
              description="Pick another tab or grab a new task from the available list."
            />
          </div>
        )}
      </StaggerList>
    </MountFade>
  );
}

function ScoreboardPage({ entries }: { entries: LeaderboardEntry[] }) {
  const me = entries.find(e => e.isMe);
  const top1 = entries[0];
  const progressPct = me && top1 ? Math.min(100, Math.round((me.points / top1.points) * 100)) : 0;
  const [heroIdx, setHeroIdx] = useState(0);
  const VISIBLE = 3;
  const total = entries.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx(i => (i + 1) % total);
    }, 2500);
    return () => clearInterval(timer);
  }, [total]);

  function getVisible() {
    const result = [];
    for (let i = 0; i < VISIBLE; i++) {
      result.push(entries[(heroIdx + i) % total]);
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Top Performers</h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {entries.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === heroIdx ? "bg-orange-500" : "bg-orange-200"}`} />
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setHeroIdx(i => (i - 1 + total) % total)} className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={() => setHeroIdx(i => (i + 1) % total)} className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {getVisible().map(entry => (
            <div key={`${entry.rank}-${heroIdx}`}
              className={`rounded-2xl p-5 text-center border transition-all ${entry.isMe ? "bg-orange-50 border-orange-200" : "bg-white border-orange-50"} shadow-sm`}
              style={{ animation: "fadeIn 0.4s ease" }}>
              <div className="text-3xl mb-2">{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.isMe ? "👤" : `#${entry.rank}`}</div>
              <div className="flex justify-center mb-2"><Avatar initials={entry.avatar} size="lg" /></div>
              <p className={`font-bold text-sm ${entry.isMe ? "text-orange-700" : "text-gray-900"}`}>{entry.name}{entry.isMe && " (You)"}</p>
              <p className="text-xs text-gray-400 mb-2">{entry.city}</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeConfig[entry.badge]}`}>{entry.badge}</span>
              <p className="text-xl font-bold text-orange-600 mt-2">{entry.points.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{entry.tasks} tasks</p>
            </div>
          ))}
        </div>
      </div>

      {me && top1 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-700">Your progress toward #1</p>
            <span className="text-xs text-orange-500 font-semibold">{progressPct}%</span>
          </div>
          <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #FF7A00, #FFB347)" }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            You are <span className="font-bold text-orange-600">{(top1.points - me.points).toLocaleString()} points</span> away from #1
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
        <div className="px-5 py-4 border-b border-orange-50 flex items-center gap-2">
          <Trophy size={18} className="text-orange-500" />
          <h3 className="font-bold text-gray-900">Volunteer Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-orange-50/60">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Volunteer</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">City</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {entries.map(entry => (
                <tr key={entry.rank} className={`transition-colors ${entry.isMe ? "bg-orange-50" : "hover:bg-gray-50/50"}`}>
                  <td className="px-5 py-4">
                    <span className={`font-bold text-sm ${entry.rank <= 3 ? "text-orange-500 text-lg" : "text-gray-500"}`}>
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={entry.avatar} size="xs" />
                      <p className={`text-sm font-semibold ${entry.isMe ? "text-orange-700" : "text-gray-800"}`}>
                        {entry.name}{entry.isMe && <span className="ml-1.5 text-xs text-orange-400 font-normal">(You)</span>}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{entry.city}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={13} className="text-orange-400" />
                      <span className="text-sm font-bold text-gray-800">{entry.points.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-medium">{entry.tasks}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeConfig[entry.badge]}`}>{entry.badge}</span>
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

function ProfilePage({ profile, onSave }: { profile: VolunteerProfile; onSave: (p: VolunteerProfile) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<VolunteerProfile>(profile);
  const [skillInput, setSkillInput] = useState("");

  function handleSave() {
    onSave(draft);
    try {
      const saved = localStorage.getItem("sahara_user");
      const u = saved ? JSON.parse(saved) : {};
      const updated = {
        ...u,
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        city: draft.location,
        occupation: draft.occupation || draft.skills[0] || "",
      };
      localStorage.setItem("sahara_user", JSON.stringify(updated));
    } catch {}
    setEditing(false);
  }
  function handleCancel() {
    setDraft(profile);
    setEditing(false);
  }
  function addSkill() {
    const s = skillInput.trim();
    if (s && !draft.skills.includes(s)) {
      setDraft(d => ({ ...d, skills: [...d.skills, s] }));
    }
    setSkillInput("");
  }
  function removeSkill(s: string) {
    setDraft(d => ({ ...d, skills: d.skills.filter(x => x !== s) }));
  }
  function toggleAvail(key: keyof typeof draft.availability) {
    setDraft(d => ({ ...d, availability: { ...d.availability, [key]: !d.availability[key] } }));
  }

  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-50">
        <div className="h-1.5" style={{ background: "linear-gradient(135deg, #FF7A00, #FFB347)" }} />
        <div className="px-6 pt-5 pb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <Avatar initials={initials} size="xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={13} className="text-orange-400" />{profile.location}</p>
              </div>
            </div>
            <button onClick={() => editing ? handleCancel() : setEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${editing ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "text-white hover:opacity-90"}`}
              style={!editing ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}>
              <Pencil size={14} /> {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-5">
            {[{ label: "Tasks", value: INITIAL_TASKS_COMPLETED, icon: CheckSquare }, { label: "Points", value: INITIAL_POINTS, icon: Star }, { label: "Rank", value: "#4", icon: Trophy }, { label: "Streak", value: `${profile.streak}d`, icon: Flame }]
              .map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <Icon size={16} className="text-orange-500 mx-auto mb-1" />
                  <p className="font-bold text-gray-900 leading-tight">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
          </div>

          <div className="space-y-3">
            {editing ? (
              <>
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "phone" },
                  { label: "Location", key: "location" },
                  { label: "Occupation", key: "occupation" },
                ].map(({ label, key }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">{label}</label>
                    <input
                      value={(draft as Record<string, unknown>)[key] as string}
                      onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: "Email", value: profile.email },
                  { label: "Phone", value: profile.phone },
                  { label: "Occupation", value: profile.occupation },
                  { label: "Member Since", value: profile.joinedDate },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5 border-b border-orange-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Skills</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {(editing ? draft : profile).skills.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-sm font-medium border border-orange-100">
              {s}
              {editing && <button onClick={() => removeSkill(s)} className="text-orange-400 hover:text-red-500 transition-colors"><X size={12} /></button>}
            </span>
          ))}
        </div>
        {editing && (
          <div className="flex gap-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSkill()}
              placeholder="Add skill..." className="flex-1 px-3 py-2 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
            <button onClick={addSkill} className="px-4 py-2 rounded-xl text-white text-sm font-bold hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>Add</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Availability</p>
        <div className="grid grid-cols-2 gap-2">
          {([["day", "Day Shift"], ["night", "Night Shift"], ["weekdays", "Weekdays"], ["weekends", "Weekends"]] as const).map(([key, label]) => {
            const active = (editing ? draft : profile).availability[key];
            return (
              <button key={key} onClick={() => editing && toggleAvail(key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-100 text-gray-400"} ${editing ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}>
                <div className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Badges & Achievements</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(b => (
            <div key={b.id} className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center border transition-all ${b.earned ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100 opacity-50"}`}>
              <span className="text-3xl">{b.icon}</span>
              <p className="text-xs font-bold text-gray-800">{b.label}</p>
              <p className="text-xs text-gray-500">{b.desc}</p>
              {!b.earned && <span className="text-xs text-gray-400 font-medium">Locked</span>}
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <button onClick={handleSave}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
          <Save size={16} /> Save Changes
        </button>
      )}
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
              <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${item === "Delete Account" ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-orange-50"}`}>
              {item}<ChevronRight size={16} className="text-gray-400" />
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
  dashboard: "Dashboard", "available-tasks": "Available Tasks",
  "my-tasks": "My Tasks", scoreboard: "Scoreboard", profile: "Profile", settings: "Settings",
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
  const [notifIdx, setNotifIdx] = useState(0);

  const [acceptedIds, setAcceptedIds] = useState<Set<MyTaskItem["id"]>>(new Set());
  const [myTasksList, setMyTasksList] = useState<MyTaskItem[]>(INITIAL_MY_TASKS);
  const [availableTasks, setAvailableTasks] = useState<AvailableTask[]>(INITIAL_AVAILABLE_TASKS);
  const [totalPoints, setTotalPoints] = useState(INITIAL_POINTS);
  const [tasksCompleted, setTasksCompleted] = useState(INITIAL_TASKS_COMPLETED);
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>(getInitialProfile);

  const refreshAvailable = useCallback(async () => {
    try {
      const data = await apiFetch<BackendTask[]>("/tasks/available");
      setAvailableTasks(data.map(backendTaskToAvailable));
    } catch {}
  }, []);

  const refreshMine = useCallback(async () => {
    try {
      const data = await apiFetch<BackendTask[]>("/tasks/mine");
      const mapped = data.map(backendTaskToMine);
      setMyTasksList(mapped);
      setAcceptedIds(new Set(mapped.map(t => t.id)));
    } catch {}
  }, []);

  useEffect(() => {
    refreshAvailable();
    refreshMine();
  }, [refreshAvailable, refreshMine]);

  const scoreboardEntries: LeaderboardEntry[] = BASE_LEADERBOARD.map(e => {
    if (e.isMe) {
      const city = volunteerProfile.location.split(",")[0]?.trim() || e.city;
      const initials = volunteerProfile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      return { ...e, name: volunteerProfile.name, city, avatar: initials, points: totalPoints, tasks: tasksCompleted };
    }
    return e;
  }).sort((a, b) => b.points - a.points)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  function handleAddMyTask(task: MyTaskItem) {
    setMyTasksList(prev => [task, ...prev]);
  }

  async function handleAcceptTask(id: AvailableTask["id"]) {
    if (acceptedIds.has(id)) return;
    const task = availableTasks.find(t => t.id === id);
    setAcceptedIds(prev => new Set(prev).add(id));
    if (task) {
      setMyTasksList(prev => [...prev, {
        id: task.id, title: task.title, location: task.location,
        deadline: task.deadline, time: task.time, status: "pending",
        category: task.category, points: task.points,
      }]);
    }
    try {
      await apiFetch(`/tasks/accept/${id}`, { method: "POST" });
      await Promise.all([refreshAvailable(), refreshMine()]);
    } catch {
      // revert optimistic add on failure
      setAcceptedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setMyTasksList(prev => prev.filter(t => t.id !== id));
    }
  }

  async function handleUpdateStatus(id: MyTaskItem["id"], status: TaskStatus) {
    const prevTask = myTasksList.find(t => t.id === id);
    setMyTasksList(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    if (status === "completed" && prevTask && prevTask.status !== "completed") {
      setTotalPoints(p => p + prevTask.points);
      setTasksCompleted(c => c + 1);
    }
    try {
      await apiFetch(`/tasks/status/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: volunteerStatusToBackend(status) }),
      });
      await refreshMine();
    } catch {
      if (prevTask) {
        setMyTasksList(prev => prev.map(t => t.id === id ? prevTask : t));
      }
    }
  }

  function handleUploadProof(id: MyTaskItem["id"], filename: string) {
    setMyTasksList(prev => prev.map(t => t.id === id ? { ...t, proof: filename } : t));
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-orange-50">
        <img src={saharaLogo} alt="Sahara" className="w-24 h-auto object-contain" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setActivePage(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activePage === id ? "text-white shadow-sm" : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"}`}
            style={activePage === id ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" } : {}}>
            <Icon size={18} />{label}
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
    <div className="h-screen overflow-hidden flex bg-orange-50/30">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-60 bg-white shadow-lg border-r border-orange-100 z-30 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-orange-100 px-5 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(v => !v)} className="lg:hidden p-2 rounded-xl hover:bg-orange-50 text-gray-600 transition-colors">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="font-bold text-gray-900 text-base leading-tight">{pageTitle[activePage]}</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)}
                className="relative p-2.5 rounded-xl hover:bg-orange-50 text-gray-500 transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-orange-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-orange-50 flex items-center justify-between">
                    <p className="font-bold text-sm text-gray-800">Notifications</p>
                    <span className="text-xs text-gray-400">{notifIdx + 1} / {notifications.length}</span>
                  </div>
                  <div className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{notifications[notifIdx].icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 font-medium leading-snug">{notifications[notifIdx].msg}</p>
                        <p className="text-xs text-orange-500 font-semibold mt-1">{notifications[notifIdx].date}</p>
                        <p className="text-xs text-gray-400">{notifications[notifIdx].time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 pb-4 gap-2">
                    <button onClick={() => setNotifIdx(i => Math.max(0, i - 1))}
                      disabled={notifIdx === 0}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-200 text-orange-600 text-xs font-bold disabled:opacity-40 hover:bg-orange-50 transition-colors">
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <div className="flex gap-1">
                      {notifications.map((_, i) => (
                        <button key={i} onClick={() => setNotifIdx(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${i === notifIdx ? "bg-orange-500" : "bg-orange-200"}`} />
                      ))}
                    </div>
                    <button onClick={() => setNotifIdx(i => Math.min(notifications.length - 1, i + 1))}
                      disabled={notifIdx === notifications.length - 1}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-200 text-orange-600 text-xs font-bold disabled:opacity-40 hover:bg-orange-50 transition-colors">
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setActivePage("profile")}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors">
              <Avatar initials={volunteerProfile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-tight">{volunteerProfile.name}</p>
                <p className="text-xs text-orange-500 font-medium">Volunteer</p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">
          {activePage === "dashboard" && <DashboardPage onNavigate={setActivePage} myTasksList={myTasksList} totalPoints={totalPoints} tasksCompleted={tasksCompleted} profile={volunteerProfile} availableTasks={availableTasks} />}
          {activePage === "available-tasks" && <AvailableTasksPage tasks={availableTasks} acceptedIds={acceptedIds} onAccept={handleAcceptTask} />}
          {activePage === "my-tasks" && <MyTasksPage myTasksList={myTasksList} onUpdateStatus={handleUpdateStatus} onUploadProof={handleUploadProof} onAddTask={handleAddMyTask} />}
          {activePage === "scoreboard" && <ScoreboardPage entries={scoreboardEntries} />}
          {activePage === "profile" && <ProfilePage profile={volunteerProfile} onSave={setVolunteerProfile} />}
          {activePage === "settings" && <SettingsPage />}
        </main>
      </div>

      <AIChatbot
        context={{
          role: "volunteer",
          username: volunteerProfile.name.split(" ")[0],
          myTasks: myTasksList.map(t => ({
            id: t.id, title: t.title, status: t.status,
            priority: (t as { priority?: AIPriority }).priority, deadline: t.deadline,
          })),
          availableTasks: availableTasks.map(t => ({
            id: t.id, title: t.title, priority: t.urgency as AIPriority, deadline: t.deadline,
          })),
        }}
      />
    </div>
  );
}
