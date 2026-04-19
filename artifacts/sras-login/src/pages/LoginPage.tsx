import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ChevronDown, Users, Heart, Handshake, Shield } from "lucide-react";

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

function IllustrationPanel() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden h-full min-h-screen"
      style={{
        background: "linear-gradient(145deg, #FFF5E8 0%, #FFE4C4 40%, #FFD4A0 70%, #FFBF7A 100%)"
      }}
    >
      <div className="absolute inset-0 chakra-pattern" />

      <div className="absolute top-6 right-6 animate-spin-slow">
        <AshokaChakra size={90} opacity={0.10} />
      </div>
      <div className="absolute bottom-12 left-8">
        <AshokaChakra size={64} opacity={0.08} />
      </div>
      <div className="absolute top-1/3 left-4">
        <AshokaChakra size={48} opacity={0.06} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-10 max-w-md text-center">
        <div className="mb-10 animate-float">
          <CommunityIllustration />
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold text-orange-600 tracking-widest uppercase">Smart Resource Allocation</span>
            <div className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <h1 className="text-3xl font-bold leading-tight text-orange-900 mb-3">
            Connecting People.
            <br />
            <span className="text-orange-500">Delivering Impact.</span>
          </h1>
          <p className="text-orange-800/70 text-sm leading-relaxed font-light">
            A unified platform empowering NGOs, volunteers, and donors to allocate resources where they matter most — together.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          {[
            { icon: Users, label: "50K+ Volunteers", color: "bg-orange-100 text-orange-700" },
            { icon: Heart, label: "1200+ NGOs", color: "bg-amber-100 text-amber-700" },
            { icon: Handshake, label: "5M+ Helped", color: "bg-yellow-100 text-yellow-700" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl ${color} text-xs font-medium shadow-sm`}>
              <Icon size={16} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
    </div>
  );
}

function CommunityIllustration() {
  return (
    <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-72 h-auto drop-shadow-lg">
      <ellipse cx="160" cy="240" rx="130" ry="14" fill="#FF7A00" fillOpacity="0.08" />

      <rect x="60" y="90" width="200" height="130" rx="12" fill="#FFF8F0" stroke="#FFD4A0" strokeWidth="1.5" />
      <rect x="60" y="90" width="200" height="28" rx="12" fill="#FF7A00" fillOpacity="0.12" />
      <rect x="60" y="106" width="200" height="12" fill="#FF7A00" fillOpacity="0.12" />

      <circle cx="108" cy="150" r="26" fill="#FF7A00" fillOpacity="0.12" />
      <circle cx="108" cy="140" r="11" fill="#FF7A00" fillOpacity="0.4" />
      <rect x="90" y="152" width="36" height="22" rx="10" fill="#FF7A00" fillOpacity="0.3" />

      <circle cx="160" cy="150" r="26" fill="#FFB347" fillOpacity="0.12" />
      <circle cx="160" cy="140" r="11" fill="#FFB347" fillOpacity="0.4" />
      <rect x="142" y="152" width="36" height="22" rx="10" fill="#FFB347" fillOpacity="0.3" />

      <circle cx="212" cy="150" r="26" fill="#FF8C42" fillOpacity="0.12" />
      <circle cx="212" cy="140" r="11" fill="#FF8C42" fillOpacity="0.4" />
      <rect x="194" y="152" width="36" height="22" rx="10" fill="#FF8C42" fillOpacity="0.3" />

      <line x1="130" y1="154" x2="142" y2="154" stroke="#FF7A00" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      <line x1="178" y1="154" x2="190" y2="154" stroke="#FF7A00" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />

      <rect x="90" y="196" width="140" height="16" rx="8" fill="#FFD4A0" />
      <rect x="90" y="196" width="95" height="16" rx="8" fill="#FF7A00" fillOpacity="0.5" />

      <path d="M160 50 L172 26 L148 26 Z" fill="#FF7A00" fillOpacity="0.6" />
      <circle cx="160" cy="50" r="5" fill="#FF7A00" />

      <circle cx="60" cy="70" r="8" fill="#FFD4A0" />
      <circle cx="260" cy="80" r="6" fill="#FFB347" fillOpacity="0.6" />
      <circle cx="40" cy="130" r="5" fill="#FF7A00" fillOpacity="0.2" />
      <circle cx="280" cy="150" r="7" fill="#FF8C42" fillOpacity="0.2" />

      <path d="M52 115 Q56 108 62 112" stroke="#FF7A00" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M266 100 Q270 93 276 97" stroke="#FFB347" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

function LoginCard() {
  const [form, setForm] = useState<FormState>({ email: "", password: "", role: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const selectedRole = roles.find(r => r.value === form.role);

  return (
    <div className="flex flex-col justify-center px-8 py-10 sm:px-12 max-w-md w-full mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-bold text-orange-900 text-sm tracking-wide">SRAS</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back 👋</h2>
        <p className="text-gray-500 text-sm font-light">Login to continue to your dashboard</p>
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
              className={`input-focus-orange w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-gray-800 placeholder-gray-400 transition-all duration-200 outline-none
                ${errors.email ? "border-red-400 bg-red-50/50" : "border-orange-200 hover:border-orange-300"}`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 ml-0.5">{errors.email}</p>
          )}
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
              className={`input-focus-orange w-full pl-10 pr-11 py-3 rounded-xl border bg-white text-sm text-gray-800 placeholder-gray-400 transition-all duration-200 outline-none
                ${errors.password ? "border-red-400 bg-red-50/50" : "border-orange-200 hover:border-orange-300"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500 ml-0.5">{errors.password}</p>
          )}
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-0.5">
            Select Your Role
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleOpen(v => !v)}
              className={`input-focus-orange w-full flex items-center justify-between pl-4 pr-3.5 py-3 rounded-xl border bg-white text-sm transition-all duration-200 outline-none
                ${errors.role ? "border-red-400 bg-red-50/50" : "border-orange-200 hover:border-orange-300"}
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
              <ChevronDown
                size={16}
                className={`text-orange-400 transition-transform duration-200 ${roleOpen ? "rotate-180" : ""}`}
              />
            </button>

            {roleOpen && (
              <div className="absolute z-20 w-full mt-1.5 bg-white border border-orange-100 rounded-xl shadow-lg overflow-hidden">
                {roles.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => {
                      setForm(f => ({ ...f, role: role.value }));
                      setRoleOpen(false);
                      if (errors.role) setErrors(er => ({ ...er, role: undefined }));
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-orange-50
                      ${form.role === role.value ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-700"}`}
                  >
                    <span className="text-base">{role.icon}</span>
                    <span>{role.label}</span>
                    {form.role === role.value && (
                      <span className="ml-auto text-orange-500 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.role && (
            <p className="mt-1.5 text-xs text-red-500 ml-0.5">{errors.role}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-2"
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
        </button>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-orange-100" />
          <span className="text-xs text-gray-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-orange-100" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-orange-100 rounded-xl bg-white hover:bg-orange-50 hover:border-orange-200 transition-all text-sm text-gray-700 font-medium shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-orange-100 rounded-xl bg-white hover:bg-orange-50 hover:border-orange-200 transition-all text-sm text-gray-700 font-medium shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button type="button" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
          Sign Up
        </button>
      </p>

      <p className="mt-4 text-center text-xs text-gray-400 leading-relaxed">
        By continuing, you agree to SRAS{" "}
        <button type="button" className="text-orange-400 hover:text-orange-500 transition-colors">Terms of Service</button>
        {" "}and{" "}
        <button type="button" className="text-orange-400 hover:text-orange-500 transition-colors">Privacy Policy</button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block w-[52%] relative">
        <IllustrationPanel />
      </div>

      <div className="flex-1 flex flex-col lg:block">
        <div className="lg:hidden flex flex-col items-center pt-10 pb-6 px-6"
          style={{ background: "linear-gradient(160deg, #FFF5E8 0%, #FFE4C4 100%)" }}>
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}>
              <Shield size={28} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <AshokaChakra size={28} opacity={0.25} />
            </div>
          </div>
          <h2 className="text-lg font-bold text-orange-900 text-center">Smart Resource Allocation System</h2>
          <p className="text-orange-600/80 text-sm mt-1 font-light text-center">Connecting People. Delivering Impact.</p>
        </div>

        <div className="flex-1 flex items-center justify-center bg-white lg:bg-gradient-to-br lg:from-orange-50/30 lg:to-white">
          <div className="w-full max-w-md px-2">
            <LoginCard />
          </div>
        </div>
      </div>
    </div>
  );
}
