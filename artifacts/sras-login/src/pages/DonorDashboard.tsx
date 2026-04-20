import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeDown, FadeUp, FadeIn, StaggerList, StaggerItem, HoverCard,
  MountFade, SlideInHeader, chartTooltipStyle, chartTooltipCursor
} from "../lib/AnimatedComponents";
import {
  LayoutDashboard, Heart, Gift, Building2, History, TrendingUp,
  ShieldCheck, Bell, Menu, X, LogOut, User, Pencil, Save,
  Bookmark, BookmarkCheck, Search, Filter, Eye, CheckCircle2,
  Clock, Star, MapPin, Plus, ChevronDown
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";

const ORANGE = "#FF7A00";
const ORANGE_LIGHT = "#FF9A40";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "overview" | "donate" | "ngos" | "history" | "impact" | "proofs" | "profile";
type DonationType = "money" | "resource";
type DonationStatus = "completed" | "pending";

interface DonorProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferences: string[];
}

interface Donation {
  id: number;
  ngo: string;
  type: DonationType;
  amount: string;
  date: string;
  status: DonationStatus;
  category: string;
}

interface Ngo {
  id: number;
  name: string;
  type: string;
  location: string;
  description: string;
  urgency: "high" | "medium" | "low";
  saved: boolean;
  raised: number;
  goal: number;
}

interface Proof {
  id: number;
  ngo: string;
  title: string;
  uploadedAt: string;
  status: "verified" | "pending";
  emoji: string;
  description: string;
}

interface Notification {
  id: number;
  icon: string;
  message: string;
  time: string;
  read: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDonorProfile(): DonorProfile {
  try {
    const saved = localStorage.getItem("sahara_user");
    if (saved) {
      const u = JSON.parse(saved);
      if (u.name) return {
        name: u.name,
        email: u.email || "donor@sahara.org",
        phone: u.phone || "+91 98765 00000",
        address: u.city && u.state ? `${u.city}, ${u.state}` : "Mumbai, Maharashtra",
        preferences: u.preferences || ["Food", "Education"],
      };
    }
  } catch {}
  return {
    name: "Vikram Joshi",
    email: "vikram.joshi@example.com",
    phone: "+91 98765 00000",
    address: "Pune, Maharashtra",
    preferences: ["Food", "Education", "Health"],
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
      {sub && <p className="text-xs font-medium mt-1" style={{ color: ORANGE }}>{sub}</p>}
    </motion.div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INIT_DONATIONS: Donation[] = [
  { id: 1, ngo: "Sahara NGO", type: "money", amount: "₹2,000", date: "Apr 20, 2026", status: "completed", category: "Health" },
  { id: 2, ngo: "Asha Foundation", type: "resource", amount: "50 kg Rice", date: "Apr 18, 2026", status: "completed", category: "Food" },
  { id: 3, ngo: "GreenLeaf Trust", type: "money", amount: "₹1,500", date: "Apr 15, 2026", status: "pending", category: "Environment" },
  { id: 4, ngo: "Vidya Shakti", type: "resource", amount: "20 Notebooks", date: "Apr 10, 2026", status: "completed", category: "Education" },
  { id: 5, ngo: "HealingHands", type: "money", amount: "₹5,000", date: "Mar 30, 2026", status: "completed", category: "Health" },
  { id: 6, ngo: "Asha Foundation", type: "resource", amount: "30 Blankets", date: "Mar 22, 2026", status: "completed", category: "Relief" },
];

const INIT_NGOS: Ngo[] = [
  { id: 1, name: "Sahara NGO", type: "Health", location: "Mumbai, MH", description: "Providing free medical camps and health screenings to underserved communities.", urgency: "high", saved: true, raised: 85000, goal: 100000 },
  { id: 2, name: "Asha Foundation", type: "Food", location: "Pune, MH", description: "Ensuring no family goes to bed hungry through daily meal programs.", urgency: "high", saved: false, raised: 42000, goal: 60000 },
  { id: 3, name: "Vidya Shakti", type: "Education", location: "Nagpur, MH", description: "Empowering underprivileged children through quality education and skill training.", urgency: "medium", saved: true, raised: 30000, goal: 50000 },
  { id: 4, name: "GreenLeaf Trust", type: "Environment", location: "Nashik, MH", description: "Driving tree plantation and clean-water initiatives across rural Maharashtra.", urgency: "low", saved: false, raised: 18000, goal: 40000 },
  { id: 5, name: "HealingHands", type: "Health", location: "Aurangabad, MH", description: "Mobile clinics bringing essential healthcare to remote villages.", urgency: "high", saved: false, raised: 67000, goal: 80000 },
  { id: 6, name: "RisingWomen", type: "Women Empowerment", location: "Kolhapur, MH", description: "Vocational training and entrepreneurship programs for rural women.", urgency: "medium", saved: false, raised: 22000, goal: 45000 },
];

const INIT_PROOFS: Proof[] = [
  { id: 1, ngo: "Sahara NGO", title: "Free Medical Camp — Apr 2026", uploadedAt: "Apr 22, 2026", status: "verified", emoji: "🏥", description: "200+ patients received free check-ups and medicines at Dharavi community center." },
  { id: 2, ngo: "Asha Foundation", title: "Meal Distribution — Week 16", uploadedAt: "Apr 19, 2026", status: "verified", emoji: "🍱", description: "450 families received nutritious meal packets across 3 locations in Pune." },
  { id: 3, ngo: "GreenLeaf Trust", title: "Tree Plantation Drive", uploadedAt: "Apr 21, 2026", status: "pending", emoji: "🌱", description: "Planted 300 saplings at Nashik riverside under the city-wide green initiative." },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, icon: "✅", message: "Your ₹2,000 donation to Sahara NGO was used for the medical camp", time: "10 mins ago", read: false },
  { id: 2, icon: "📸", message: "Asha Foundation uploaded proof of meal distribution", time: "2 hours ago", read: false },
  { id: 3, icon: "🔔", message: "GreenLeaf Trust updated status: Tree Plantation in progress", time: "Yesterday", read: false },
  { id: 4, icon: "💛", message: "Your donation helped 45 families this week!", time: "2 days ago", read: true },
  { id: 5, icon: "🏥", message: "HealingHands: Mobile clinic reached 3 new villages", time: "3 days ago", read: true },
];

const CHART_TREND = [
  { month: "Nov", amount: 1200 },
  { month: "Dec", amount: 2500 },
  { month: "Jan", amount: 800 },
  { month: "Feb", amount: 3200 },
  { month: "Mar", amount: 6500 },
  { month: "Apr", amount: 8500 },
];

const CHART_CATEGORY = [
  { name: "Health", value: 40, color: "#ef4444" },
  { name: "Food", value: 25, color: "#22c55e" },
  { name: "Education", value: 20, color: "#3b82f6" },
  { name: "Relief", value: 10, color: ORANGE },
  { name: "Environment", value: 5, color: "#10b981" },
];

const URGENCY_CONFIG: Record<Ngo["urgency"], { label: string; color: string; bg: string }> = {
  high: { label: "High Urgency", color: "text-red-600", bg: "bg-red-100" },
  medium: { label: "Medium", color: "text-orange-600", bg: "bg-orange-100" },
  low: { label: "Low", color: "text-green-600", bg: "bg-green-100" },
};

const STATUS_CONFIG: Record<DonationStatus, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "text-green-600", bg: "bg-green-100" },
  pending: { label: "Pending", color: "text-orange-600", bg: "bg-orange-100" },
};

const ALL_PREFERENCES = ["Food", "Education", "Health", "Environment", "Women Empowerment", "Disaster Relief"];

// ─── Overview Page ────────────────────────────────────────────────────────────
function OverviewPage({ donations, ngos, onNavigate }: {
  donations: Donation[]; ngos: Ngo[]; onNavigate: (p: Page) => void;
}) {
  const totalMoney = donations.filter(d => d.type === "money" && d.status === "completed")
    .reduce((s, d) => s + parseInt(d.amount.replace(/[^\d]/g, "")), 0);
  const ngosSupported = [...new Set(donations.map(d => d.ngo))].length;
  const savedNgos = ngos.filter(n => n.saved).length;

  return (
    <MountFade className="space-y-6">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Donor Dashboard</h2>
        <p className="text-sm text-gray-400">Your giving journey, impact, and supported NGOs at a glance.</p>
      </FadeIn>

      <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Heart, label: "Total Donated", value: `₹${totalMoney.toLocaleString("en-IN")}`, sub: "All time", color: "bg-red-500", page: "history" as Page },
          { icon: Building2, label: "NGOs Supported", value: ngosSupported, sub: "Unique organisations", color: "bg-purple-500", page: "ngos" as Page },
          { icon: Gift, label: "Donations Made", value: donations.length, sub: "Total transactions", color: "bg-orange-500", page: "history" as Page },
          { icon: Bookmark, label: "Saved NGOs", value: savedNgos, sub: "Bookmarked", color: "bg-blue-500", page: "ngos" as Page },
        ].map(({ icon, label, value, sub, color, page }) => (
          <StaggerItem key={label}>
            <StatCard icon={icon} label={label} value={value} sub={sub} color={color} onClick={() => onNavigate(page)} />
          </StaggerItem>
        ))}
      </StaggerList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeUp>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <h3 className="font-bold text-gray-800 mb-4">Donation Trends — Monthly</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CHART_TREND} barSize={18}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={chartTooltipCursor}
                  formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Donated"]} />
                <Bar dataKey="amount" fill={ORANGE} name="Amount" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </HoverCard>
        </FadeUp>

        <FadeDown delay={0.08}>
          <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
            <h3 className="font-bold text-gray-800 mb-3">Donation by Category</h3>
            <div className="flex items-center gap-6">
              <div style={{ transform: "perspective(320px) rotateX(28deg)", transformOrigin: "center bottom" }}>
                <PieChart width={160} height={130}>
                  <Pie data={CHART_CATEGORY} cx="50%" cy="55%" innerRadius={36} outerRadius={56} dataKey="value" paddingAngle={3}>
                    {CHART_CATEGORY.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle}
                    formatter={(value, name) => {
                      const total = CHART_CATEGORY.reduce((s, r) => s + r.value, 0);
                      return [`${value}% (${Math.round((Number(value) / total) * 100)}%)`, name];
                    }} />
                </PieChart>
              </div>
              <div className="space-y-2 flex-1">
                {CHART_CATEGORY.map(s => (
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
          </HoverCard>
        </FadeDown>
      </div>

      <FadeUp delay={0.1}>
        <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Recent Donations</h3>
          <div className="space-y-3">
            {donations.slice(0, 4).map(d => {
              const sc = STATUS_CONFIG[d.status];
              return (
                <motion.div key={d.id}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-orange-50/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: d.type === "money" ? "#fff7ed" : "#f0fdf4" }}>
                      {d.type === "money" ? "💰" : "📦"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{d.ngo}</p>
                      <p className="text-xs text-gray-400">{d.amount} · {d.date}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${sc.bg} ${sc.color}`}>{sc.label}</span>
                </motion.div>
              );
            })}
          </div>
        </HoverCard>
      </FadeUp>
    </MountFade>
  );
}

// ─── Donate Page ──────────────────────────────────────────────────────────────
function DonatePage({ donations, setDonations, ngos }: {
  donations: Donation[]; setDonations: React.Dispatch<React.SetStateAction<Donation[]>>; ngos: Ngo[];
}) {
  const [form, setForm] = useState({ type: "money" as DonationType, amount: "", ngo: "", category: "Health", resourceName: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!form.amount.trim()) return;
    const ngoName = form.ngo || ngos.sort((a, b) => (b.urgency === "high" ? 1 : 0) - (a.urgency === "high" ? 1 : 0))[0].name;
    const display = form.type === "money" ? `₹${form.amount}` : `${form.amount} ${form.resourceName || "items"}`;
    const newDonation: Donation = {
      id: Date.now(), ngo: ngoName, type: form.type, amount: display,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "pending", category: form.category,
    };
    setDonations(prev => [newDonation, ...prev]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
    setForm({ type: "money", amount: "", ngo: "", category: "Health", resourceName: "" });
  }

  return (
    <MountFade className="space-y-5 max-w-2xl">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Make a Donation</h2>
        <p className="text-sm text-gray-400">Donate money or resources to NGOs in need.</p>
      </FadeIn>

      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
            <CheckCircle2 size={20} className="text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-700">Donation submitted!</p>
              <p className="text-xs text-green-600">Your donation is being processed. Thank you for your generosity! 💛</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FadeUp>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-5">Donation Details</h3>

          <div className="flex gap-2 mb-5">
            {(["money", "resource"] as DonationType[]).map(t => (
              <motion.button key={t} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${form.type === t ? "text-white" : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-orange-300"}`}
                style={form.type === t ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
                {t === "money" ? <><span>💰</span> Money</> : <><span>📦</span> Resources</>}
              </motion.button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
                  {form.type === "money" ? "Amount (₹) *" : "Quantity *"}
                </label>
                <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder={form.type === "money" ? "e.g. 500" : "e.g. 20"}
                  type="number" min="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>

              {form.type === "resource" && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Resource Name *</label>
                  <input value={form.resourceName} onChange={e => setForm(f => ({ ...f, resourceName: e.target.value }))}
                    placeholder="e.g. kg Rice, Blankets..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {["Health", "Food", "Education", "Relief", "Environment", "Women Empowerment"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className={form.type === "resource" ? "" : "sm:col-span-1"}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Select NGO</label>
                <select value={form.ngo} onChange={e => setForm(f => ({ ...f, ngo: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  <option value="">⚡ Auto Assign (Most Urgent)</option>
                  {ngos.map(n => <option key={n.id} value={n.name}>{n.name} — {n.type}</option>)}
                </select>
              </div>
            </div>

            {!form.ngo && (
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-2">
                <span className="text-sm">⚡</span>
                <p className="text-xs text-orange-700">
                  <span className="font-bold">Auto Assign</span> will route your donation to the NGO with the highest urgency — currently <span className="font-bold">{ngos.filter(n => n.urgency === "high")[0]?.name}</span>.
                </p>
              </div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
              <Heart size={16} /> Donate Now
            </motion.button>
          </div>
        </div>
      </FadeUp>
    </MountFade>
  );
}

// ─── NGOs Page ────────────────────────────────────────────────────────────────
function NgosPage({ ngos, setNgos, onDonate }: {
  ngos: Ngo[]; setNgos: React.Dispatch<React.SetStateAction<Ngo[]>>; onDonate: () => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | Ngo["urgency"]>("all");

  const filtered = ngos.filter(n => {
    if (categoryFilter !== "all" && n.type !== categoryFilter) return false;
    if (urgencyFilter !== "all" && n.urgency !== urgencyFilter) return false;
    if (search && !n.name.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = ["all", ...Array.from(new Set(ngos.map(n => n.type)))];

  function toggleSave(id: number) {
    setNgos(prev => prev.map(n => n.id === id ? { ...n, saved: !n.saved } : n));
  }

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Explore NGOs</h2>
        <p className="text-sm text-gray-400">Discover and support NGOs working across India.</p>
      </FadeIn>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search NGOs..."
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white" />
        </div>
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value as typeof urgencyFilter)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-orange-400 text-gray-600">
          <option value="all">All Urgency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <motion.button key={c} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${categoryFilter === c ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
            style={categoryFilter === c ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
            {c === "all" ? "All Categories" : c}
          </motion.button>
        ))}
      </div>

      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(n => {
          const uc = URGENCY_CONFIG[n.urgency];
          const progress = Math.min((n.raised / n.goal) * 100, 100);
          return (
            <StaggerItem key={n.id}>
              <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800">{n.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${uc.bg} ${uc.color}`}>{uc.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{n.type}</span>
                      <MapPin size={10} /> {n.location}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{n.description}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    onClick={() => toggleSave(n.id)}
                    className={`p-2 rounded-xl transition-colors shrink-0 ${n.saved ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-gray-400 hover:bg-orange-50 hover:text-orange-400"}`}>
                    {n.saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </motion.button>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Raised: ₹{n.raised.toLocaleString("en-IN")}</span>
                    <span>Goal: ₹{n.goal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE_LIGHT})` }} />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={onDonate}
                  className="w-full py-2 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                  <Heart size={14} /> Donate Now
                </motion.button>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </MountFade>
  );
}

// ─── History Page ─────────────────────────────────────────────────────────────
function HistoryPage({ donations }: { donations: Donation[] }) {
  const [filter, setFilter] = useState<"all" | DonationType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DonationStatus>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  let filtered = donations.filter(d => {
    if (filter !== "all" && d.type !== filter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    return true;
  });
  if (sort === "oldest") filtered = [...filtered].reverse();

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Donation History</h2>
        <p className="text-sm text-gray-400">All your past and pending donations.</p>
      </FadeIn>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {(["all", "money", "resource"] as const).map(f => (
            <motion.button key={f} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filter === f ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}
              style={filter === f ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
              {f === "all" ? "All Types" : f === "money" ? "💰 Money" : "📦 Resources"}
            </motion.button>
          ))}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-orange-400 text-gray-600">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-orange-400 text-gray-600">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <StaggerList className="space-y-3">
        {filtered.map(d => {
          const sc = STATUS_CONFIG[d.status];
          return (
            <StaggerItem key={d.id}>
              <HoverCard className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: d.type === "money" ? "#fff7ed" : "#f0fdf4" }}>
                    {d.type === "money" ? "💰" : "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800 text-sm">{d.ngo}</p>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">{d.category}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{d.amount} · {d.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${sc.bg} ${sc.color}`}>{sc.label}</span>
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </MountFade>
  );
}

// ─── Impact Page ──────────────────────────────────────────────────────────────
function ImpactPage({ donations }: { donations: Donation[] }) {
  const impactStats = [
    { emoji: "👥", label: "People Benefited", value: "1,240+", sub: "Across all NGOs" },
    { emoji: "🏘️", label: "Areas Served", value: "18", sub: "Districts" },
    { emoji: "🍱", label: "Meals Provided", value: "4,500+", sub: "This month" },
    { emoji: "🏥", label: "Medical Camps", value: "12", sub: "Organized" },
  ];

  const impactStories = [
    { ngo: "Sahara NGO", title: "200 families received medical aid", desc: "Your donation funded free check-ups, medicines, and health screenings at the Dharavi medical camp.", emoji: "🏥", date: "Apr 22, 2026" },
    { ngo: "Asha Foundation", title: "450 meal packets distributed", desc: "Nutritious food reached 3 locations across Pune, ensuring no family went hungry for a week.", emoji: "🍱", date: "Apr 19, 2026" },
    { ngo: "Vidya Shakti", title: "30 children enrolled in literacy program", desc: "Stationery donations from donors like you gave underprivileged children access to education.", emoji: "📚", date: "Apr 12, 2026" },
  ];

  return (
    <MountFade className="space-y-6">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Your Impact</h2>
        <p className="text-sm text-gray-400">See the real difference your donations are making.</p>
      </FadeIn>

      <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {impactStats.map(s => (
          <StaggerItem key={s.label}>
            <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 text-center">
              <div className="text-3xl mb-2">{s.emoji}</div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs mt-1" style={{ color: ORANGE }}>{s.sub}</p>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerList>

      <FadeUp>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
          <h3 className="font-bold text-gray-800 mb-4">Donation Impact by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_CATEGORY} barSize={32} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={chartTooltipCursor} formatter={(v) => [`${v}%`, "Share"]} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {CHART_CATEGORY.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FadeUp>

      <div className="space-y-3">
        <FadeIn delay={0.05}><h3 className="font-bold text-gray-800">Impact Stories</h3></FadeIn>
        <StaggerList className="space-y-3">
          {impactStories.map((s, i) => (
            <StaggerItem key={i}>
              <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-50 border border-orange-100 shrink-0">{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800 text-sm">{s.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">By {s.ngo} · {s.date}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </MountFade>
  );
}

// ─── Proofs Page ──────────────────────────────────────────────────────────────
function ProofsPage({ proofs }: { proofs: Proof[] }) {
  const [preview, setPreview] = useState<Proof | null>(null);

  return (
    <MountFade className="space-y-5">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Proof & Transparency</h2>
        <p className="text-sm text-gray-400">See verified proof of how NGOs are using your donations.</p>
      </FadeIn>

      <StaggerList className="space-y-3">
        {proofs.map(p => (
          <StaggerItem key={p.id}>
            <HoverCard className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-orange-50 border border-orange-100 shrink-0">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.ngo} · {p.uploadedAt}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {p.status === "verified" ? "✅ Verified" : "⏳ Pending"}
                  </span>
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={() => setPreview(p)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <Eye size={11} /> View
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
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Proof Preview</h3>
                <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="w-full h-44 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center mb-4">
                <span className="text-6xl mb-2">{preview.emoji}</span>
                <p className="text-sm text-gray-600 font-semibold">{preview.title}</p>
              </div>
              <p className="text-xs text-gray-400 mb-2">{preview.ngo} · {preview.uploadedAt}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{preview.description}</p>
              <div className={`text-center py-2.5 rounded-xl text-sm font-bold ${preview.status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {preview.status === "verified" ? "✅ Verified by NGO" : "⏳ Verification Pending"}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MountFade>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage() {
  const [profile, setProfile] = useState<DonorProfile>(getDonorProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  function togglePref(pref: string) {
    setDraft(d => ({
      ...d,
      preferences: d.preferences.includes(pref)
        ? d.preferences.filter(p => p !== pref)
        : [...d.preferences, pref],
    }));
  }

  function handleSave() {
    setProfile(draft);
    try {
      const saved = localStorage.getItem("sahara_user");
      const u = saved ? JSON.parse(saved) : {};
      localStorage.setItem("sahara_user", JSON.stringify({ ...u, ...draft }));
    } catch {}
    setEditing(false);
  }

  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <MountFade className="space-y-5 max-w-2xl">
      <FadeIn>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Donor Profile</h2>
        <p className="text-sm text-gray-400">Manage your account and giving preferences.</p>
      </FadeIn>

      <FadeUp>
        <div className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden">
          <div className="h-14 relative" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute rounded-full border border-white"
                  style={{ width: 60 + i * 30, height: 60 + i * 30, right: -20, top: -20 }} />
              ))}
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-5">
              <div className="flex items-end gap-4">
                <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #FF5500)` }}>
                  {initials}
                </div>
                <div className="mb-1">
                  <p className="text-xl font-bold text-gray-900">{profile.name}</p>
                  <p className="text-sm font-semibold" style={{ color: ORANGE }}>Donor · SAHARA</p>
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
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "phone" },
                  { label: "Address", key: "address" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                    <input value={(draft as Record<string, string>)[key]}
                      onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Donation Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PREFERENCES.map(pref => (
                      <motion.button key={pref} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => togglePref(pref)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${draft.preferences.includes(pref) ? "text-white" : "bg-gray-100 text-gray-500 hover:bg-orange-50"}`}
                        style={draft.preferences.includes(pref) ? { background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` } : {}}>
                        {pref}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-2"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
                  <Save size={15} /> Save Changes
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Email", value: profile.email },
                    { label: "Phone", value: profile.phone },
                    { label: "Address", value: profile.address },
                  ].map(f => (
                    <div key={f.label} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-0.5">{f.label}</p>
                      <p className="text-sm text-gray-700 font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-2">Donation Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences.map(p => (
                      <span key={p} className="px-3 py-0.5 rounded-full text-xs font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>{p}</span>
                    ))}
                  </div>
                </div>
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
  { page: "donate", icon: Heart, label: "Donate" },
  { page: "ngos", icon: Building2, label: "NGOs" },
  { page: "history", icon: History, label: "Donation History" },
  { page: "impact", icon: TrendingUp, label: "Impact" },
  { page: "proofs", icon: ShieldCheck, label: "Proof & Transparency" },
  { page: "profile", icon: User, label: "Profile" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DonorDashboard() {
  const [activePage, setActivePage] = useState<Page>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [donations, setDonations] = useState<Donation[]>(INIT_DONATIONS);
  const [ngos, setNgos] = useState<Ngo[]>(INIT_NGOS);
  const [proofs] = useState<Proof[]>(INIT_PROOFS);

  const profile = getDonorProfile();
  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

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
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Donor Panel</p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ page, icon: Icon, label }) => (
          <motion.button key={page}
            onClick={() => { setActivePage(page); setSidebarOpen(false); }}
            whileHover={{ x: 2 }} transition={{ duration: 0.12 }}
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
                  <p className="text-[10px] font-semibold" style={{ color: ORANGE }}>Donor</p>
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
              {activePage === "overview" && <OverviewPage donations={donations} ngos={ngos} onNavigate={setActivePage} />}
              {activePage === "donate" && <DonatePage donations={donations} setDonations={setDonations} ngos={ngos} />}
              {activePage === "ngos" && <NgosPage ngos={ngos} setNgos={setNgos} onDonate={() => setActivePage("donate")} />}
              {activePage === "history" && <HistoryPage donations={donations} />}
              {activePage === "impact" && <ImpactPage donations={donations} />}
              {activePage === "proofs" && <ProofsPage proofs={proofs} />}
              {activePage === "profile" && <ProfilePage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {notifOpen && <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />}
    </div>
  );
}
