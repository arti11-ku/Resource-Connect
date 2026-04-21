import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ChevronDown } from "lucide-react";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";
import authBgImage from "@assets/file_00000000a8e071faa50dcec2b5e4fd8d_1776788580031.png";
import { Marquee, PulseRing } from "../lib/AnimatedComponents";
import SocialAuthButtons from "../components/SocialAuthButtons";
import TermsModal from "../components/TermsModal";
import type { Role as AuthRole } from "../lib/socialAuth";

type Role = "reporter" | "ngo" | "admin" | "volunteer" | "donor";

interface FormState {
  email: string;
  password: string;
  role: Role | "";
}

interface FormErrors {
  email?: string;
  password?: string;
  role?: string;
}

const roles: { value: Role; label: string; icon: string }[] = [
  { value: "reporter", label: "Reporter", icon: "📝" },
  { value: "ngo", label: "NGO", icon: "🏛️" },
  { value: "admin", label: "Admin", icon: "🛡️" },
  { value: "volunteer", label: "Volunteer", icon: "🤝" },
  { value: "donor", label: "Donor", icon: "💛" },
];

const PARTNER_LOGOS = [
  { emoji: "🏥", name: "HealthFirst NGO" },
  { emoji: "📚", name: "Vidya Shakti" },
  { emoji: "🌱", name: "GreenLeaf Trust" },
  { emoji: "🍱", name: "Asha Foundation" },
  { emoji: "💧", name: "Clean Water India" },
  { emoji: "🤝", name: "Sahara Alliance" },
  { emoji: "🏗️", name: "BuildHope India" },
  { emoji: "❤️", name: "CareFirst Trust" },
  { emoji: "🌟", name: "Bright Future NGO" },
  { emoji: "🌾", name: "AgroRelief Fund" },
];

const NAMES_TICKER = [
  "📝 Reporters",
  "🏛️ NGOs",
  "🤝 Volunteers",
  "💛 Donors",
  "🛡️ Admins",
  "🌍 Communities",
  "❤️ Changemakers",
  "🌟 Beneficiaries",
  "📊 Data Analysts",
  "🙌 Partners",
];

const STATS = [
  { value: "1,200+", label: "Volunteers" },
  { value: "340+", label: "NGOs" },
  { value: "₹4.2Cr", label: "Donations" },
  { value: "28", label: "Districts" },
  { value: "96K+", label: "Lives Impacted" },
];

function AshokaChakra({ size = 80, opacity = 0.12 }: { size?: number; opacity?: number }) {
  const r = size / 2;
  const spokes = 24;
  const spokeLines = Array.from({ length: spokes }, (_, i) => {
    const angle = (i * 360) / spokes;
    const rad = (angle * Math.PI) / 180;
    const x1 = r + (r * 0.22) * Math.cos(rad);
    const y1 = r + (r * 0.22) * Math.sin(rad);
    const x2 = r + (r * 0.82) * Math.cos(rad);
    const y2 = r + (r * 0.82) * Math.sin(rad);
    return { x1, y1, x2, y2 };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ opacity }}>
      <circle cx={r} cy={r} r={r * 0.88} stroke="#FF7A00" strokeWidth="1.5" fill="none" />
      <circle cx={r} cy={r} r={r * 0.20} stroke="#FF7A00" strokeWidth="1.5" fill="none" />
      {spokeLines.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#FF7A00" strokeWidth="1" />
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<FormState>({ email: "", password: "", role: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  // Terms & Conditions / Privacy Policy modal state.
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsTitle, setTermsTitle] = useState<"Terms & Conditions" | "Privacy Policy">("Terms & Conditions");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!form.role) {
      newErrors.role = "Please select your role";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const routeForRole = (role: Role): string => {
    switch (role) {
      case "reporter":
        return "/reporter-dashboard";
      case "volunteer":
        return "/dashboard";
      case "ngo":
        return "/ngo-dashboard";
      case "donor":
        return "/donor-dashboard";
      case "admin":
        return "/admin-dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Local-only auth: persist a lightweight user profile and route by role.
      const role = form.role as Role;
      const namePart = form.email.split("@")[0].replace(/[._-]+/g, " ");
      const displayName = namePart
        .split(" ")
        .filter(Boolean)
        .map(w => w[0].toUpperCase() + w.slice(1))
        .join(" ") || "User";

      const existing = (() => {
        try {
          const saved = localStorage.getItem("sahara_user");
          return saved ? JSON.parse(saved) : null;
        } catch { return null; }
      })();

      const user = {
        ...(existing && existing.email === form.email ? existing : {}),
        name: existing?.name || displayName,
        email: form.email,
        role,
      };
      localStorage.setItem("sahara_user", JSON.stringify(user));
      localStorage.setItem("token", `local-${Date.now()}`);

      window.location.href = routeForRole(role);
    } catch {
      setErrors({ password: "Could not sign in. Please try again." });
      setIsLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.value === form.role);

  const partnerItems = PARTNER_LOGOS.map(p => (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-orange-100 shadow-sm">
      <span className="text-base">{p.emoji}</span>
      <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">{p.name}</span>
    </div>
  ));

  const nameItems = NAMES_TICKER.map(name => (
    <span className="text-xs font-semibold text-orange-400/80 whitespace-nowrap px-3">{name}</span>
  ));

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #FFF8F2 0%, #FFF0E0 50%, #FFE8CC 100%)" }}
    >
      {/* Page background image (Login only) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${authBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} />
      <div className="absolute inset-0 chakra-pattern" />

      <motion.div
        className="absolute top-8 right-10 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
      >
        <AshokaChakra size={110} opacity={0.09} />
      </motion.div>
      <div className="absolute bottom-10 left-10 pointer-events-none">
        <AshokaChakra size={80} opacity={0.07} />
      </div>
      <div className="absolute top-1/2 left-6 -translate-y-1/2 pointer-events-none">
        <AshokaChakra size={52} opacity={0.05} />
      </div>
      <motion.div
        className="absolute bottom-24 right-16 pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, ease: "linear", repeat: Infinity }}
      >
        <AshokaChakra size={44} opacity={0.06} />
      </motion.div>

      {/* Floating stat badges */}
      <motion.div
        className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-none"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
            className="hidden lg:flex flex-col items-center px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-100 shadow-sm"
          >
            <span className="text-sm font-black" style={{ color: "#FF7A00" }}>{s.value}</span>
            <span className="text-[10px] text-gray-500 font-medium">{s.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Roles names ticker — above card */}
      <motion.div
        className="w-full max-w-lg mb-3 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <PulseRing color="#FF7A00" size={6} />
          <span className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Platform for</span>
        </div>
        <Marquee items={nameItems} speed={22} gap={4} fadeEdges />
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-visible">
          <div
            className="h-1.5 w-full rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, #FF7A00, #FFB347, #FF7A00)" }}
          />

          <div className="px-8 py-9">
            <div className="flex flex-col items-center mb-8">
              <motion.img
                src={saharaLogo}
                alt="Sahara"
                className="w-28 h-28 object-contain mb-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              <h2 className="text-2xl font-bold text-gray-900 text-center">Welcome 👋</h2>
              <p className="text-gray-500 text-sm font-light text-center mt-1">Login to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-0.5" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => {
                      setForm(f => ({ ...f, email: e.target.value }));
                      if (errors.email) setErrors(er => ({ ...er, email: undefined }));
                    }}
                    className={`input-focus-orange w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-gray-800 placeholder-gray-400 transition-all duration-300 outline-none
                      ${errors.email ? "border-red-400 bg-red-50/50" : "border-orange-200 hover:border-orange-400 hover:shadow-sm"}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1.5 text-xs text-red-500 ml-0.5">
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-0.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => {
                      setForm(f => ({ ...f, password: e.target.value }));
                      if (errors.password) setErrors(er => ({ ...er, password: undefined }));
                    }}
                    className={`input-focus-orange w-full pl-10 pr-11 py-3 rounded-xl border bg-white text-sm text-gray-800 placeholder-gray-400 transition-all duration-300 outline-none
                      ${errors.password ? "border-red-400 bg-red-50/50" : "border-orange-200 hover:border-orange-400 hover:shadow-sm"}`}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1.5 text-xs text-red-500 ml-0.5">
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="flex justify-end mt-1.5">
                  <motion.button
                    type="button"
                    whileHover={{ x: 2 }}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    Forgot Password?
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-0.5">
                  Select Your Role
                </label>
                <div className="relative">
                  <motion.button
                    type="button"
                    whileHover={{ borderColor: "#FF7A00" }}
                    onClick={() => setRoleOpen(v => !v)}
                    className={`input-focus-orange w-full flex items-center justify-between pl-4 pr-3.5 py-3 rounded-xl border bg-white text-sm transition-all duration-300 outline-none
                      ${errors.role ? "border-red-400 bg-red-50/50" : "border-orange-200 hover:border-orange-400 hover:shadow-sm"}
                      ${selectedRole ? "text-gray-800" : "text-gray-400"}`}
                  >
                    <span className="flex items-center gap-2">
                      {selectedRole ? (
                        <>
                          <span>{selectedRole.icon}</span>
                          <span className="font-medium">{selectedRole.label}</span>
                        </>
                      ) : (
                        "Choose your role..."
                      )}
                    </span>
                    <motion.span
                      animate={{ rotate: roleOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown size={16} className="text-orange-400" />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {roleOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -6, scaleY: 0.92 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ transformOrigin: "top" }}
                        className="absolute z-20 w-full mt-1.5 bg-white border border-orange-100 rounded-xl shadow-lg overflow-hidden"
                      >
                        {roles.map((role, i) => (
                          <motion.button
                            key={role.value}
                            type="button"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ backgroundColor: "#FFF7ED", x: 4 }}
                            onClick={() => {
                              setForm(f => ({ ...f, role: role.value }));
                              setRoleOpen(false);
                              if (errors.role) setErrors(er => ({ ...er, role: undefined }));
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors
                              ${form.role === role.value ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-700"}`}
                          >
                            <span className="text-base">{role.icon}</span>
                            <span>{role.label}</span>
                            {form.role === role.value && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto text-orange-500 text-xs"
                              >
                                ✓
                              </motion.span>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.role && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1.5 text-xs text-red-500 ml-0.5">
                      {errors.role}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, boxShadow: "0 8px 24px rgba(255,122,0,0.35)" } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
                transition={{ duration: 0.2 }}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm tracking-wide transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md mt-1"
                style={{
                  background: isLoading
                    ? "linear-gradient(135deg, #FF9A40, #FFB347)"
                    : "linear-gradient(135deg, #FF7A00, #FF9A40)"
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-orange-100" />
                <span className="text-xs text-gray-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-orange-100" />
              </div>

              <SocialAuthButtons
                getRole={() => form.role as AuthRole | ""}
                onMissingRole={() => setErrors(er => ({ ...er, role: "Please select your role first" }))}
              />
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <motion.button
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => navigate("/signup")}
                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
              >
                Sign Up
              </motion.button>
            </p>

            <p className="mt-3 text-center text-xs text-gray-400 leading-relaxed">
              By continuing, you agree to Sahara's{" "}
              <motion.button
                whileHover={{ color: "#FF7A00" }}
                type="button"
                onClick={() => { setTermsTitle("Terms & Conditions"); setTermsOpen(true); }}
                className="text-orange-400 hover:text-orange-500 transition-colors"
              >
                Terms of Service
              </motion.button>
              {" "}and{" "}
              <motion.button
                whileHover={{ color: "#FF7A00" }}
                type="button"
                onClick={() => { setTermsTitle("Privacy Policy"); setTermsOpen(true); }}
                className="text-orange-400 hover:text-orange-500 transition-colors"
              >
                Privacy Policy
              </motion.button>
              {termsAccepted && (
                <span className="block mt-1 text-green-600">✓ Terms accepted</span>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-orange-400/60 mt-5 font-light">
          Smart Resource Allocation System · Sahara
        </p>
      </motion.div>

      {/* Partners marquee — below card */}
      <motion.div
        className="relative z-10 w-full mt-5 pb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-2">
          Trusted by organisations across India
        </p>
        <Marquee items={partnerItems} speed={36} gap={12} fadeEdges />
      </motion.div>

      <TermsModal
        open={termsOpen}
        title={termsTitle}
        onClose={() => setTermsOpen(false)}
        onAccept={() => setTermsAccepted(true)}
      />
    </div>
  );
}
