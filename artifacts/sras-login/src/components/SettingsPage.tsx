import { useEffect, useState } from "react";
import { ChevronRight, Moon, Sun, Bell, Globe, User as UserIcon, Save } from "lucide-react";
import { useTheme } from "../lib/theme";

const PROFILE_KEY = "sahara-settings-profile";
const NOTIF_KEY = "sahara-settings-notifs";
const LANG_KEY = "sahara-settings-language";

type ProfileForm = { name: string; email: string };
type Notifs = { email: boolean; push: boolean; sms: boolean };

function loadProfile(): ProfileForm {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: "", email: "" };
}
function loadNotifs(): Notifs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { email: true, push: true, sms: false };
}
function loadLang(): string {
  try {
    return localStorage.getItem(LANG_KEY) || "en";
  } catch {
    return "en";
  }
}

export default function SettingsPage({ role }: { role?: string } = {}) {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<ProfileForm>(loadProfile);
  const [notifs, setNotifs] = useState<Notifs>(loadNotifs);
  const [language, setLanguage] = useState<string>(loadLang);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs)); } catch {}
  }, [notifs]);

  useEffect(() => {
    try { localStorage.setItem(LANG_KEY, language); } catch {}
  }, [language]);

  function saveProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Profile */}
      <section className="setting-card rounded-2xl p-5 shadow-sm border border-orange-50">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon size={16} className="text-orange-500" />
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Profile{role ? ` · ${role}` : ""}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Full name</span>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Email</span>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={saveProfile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
          >
            <Save size={14} /> Save profile
          </button>
          {saved && <span className="text-xs font-semibold text-green-600">Saved</span>}
        </div>
      </section>

      {/* Appearance */}
      <section className="setting-card rounded-2xl p-5 shadow-sm border border-orange-50">
        <div className="flex items-center gap-2 mb-4">
          {theme === "dark" ? <Moon size={16} className="text-orange-500" /> : <Sun size={16} className="text-orange-500" />}
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Appearance</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Dark mode</p>
            <p className="text-xs text-gray-400">Switch between light and dark theme</p>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-full border border-gray-200 bg-gray-50">
            <button
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${theme === "light" ? "bg-white shadow text-orange-600" : "text-gray-500"}`}
            >
              <Sun size={12} /> Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${theme === "dark" ? "bg-gray-900 text-white shadow" : "text-gray-500"}`}
            >
              <Moon size={12} /> Dark
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="setting-card rounded-2xl p-5 shadow-sm border border-orange-50">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-orange-500" />
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Notifications</p>
        </div>
        <div className="space-y-4">
          {([
            ["email", "Email Notifications", "Receive updates via email"],
            ["push", "Push Notifications", "Get app notifications"],
            ["sms", "SMS Alerts", "Receive SMS for urgent tasks"],
          ] as const).map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                className={`w-11 h-6 rounded-full relative transition-colors ${notifs[key] ? "bg-orange-500" : "bg-gray-200"}`}
                aria-label={`Toggle ${label}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifs[key] ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="setting-card rounded-2xl p-5 shadow-sm border border-orange-50">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-orange-500" />
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Language</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Preferred language</p>
            <p className="text-xs text-gray-400">UI language for the dashboard (placeholder)</p>
          </div>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </section>

      {/* Account */}
      <section className="setting-card rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Account</p>
        <div className="space-y-2">
          {["Change Password", "Privacy Settings", "Delete Account"].map(item => (
            <button
              key={item}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${item === "Delete Account" ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-orange-50"}`}
            >
              {item}<ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="setting-card rounded-2xl p-5 shadow-sm border border-orange-50">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">About</p>
        <div className="text-xs text-gray-400 space-y-1">
          <p>SAHARA – Smart Resource Allocation System</p>
          <p>Version 1.0.0</p>
        </div>
      </section>
    </div>
  );
}
