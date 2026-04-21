import { useState } from "react";
import { useLocation } from "wouter";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Briefcase,
  ChevronDown, Calendar, Tag, X
} from "lucide-react";
import saharaLogo from "@assets/ChatGPT_Image_Apr_19,_2026,_08_38_53_PM_1776611355262.png";
import SocialAuthButtons from "../components/SocialAuthButtons";
import type { Role as AuthRole } from "../lib/socialAuth";

type Role = "reporter" | "ngo" | "admin" | "volunteer" | "donor";
type Gender = "male" | "female" | "other";
type Availability = { dayShift: boolean; nightShift: boolean; weekdays: boolean; weekends: boolean };

interface FormState {
  fullName: string;
  age: string;
  gender: Gender | "";
  state: string;
  city: string;
  occupation: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: Role | "";
  skills: string[];
  availability: Availability;
  preferredWorkType: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const roles = [
  { value: "reporter" as Role, label: "Reporter", icon: "📝" },
  { value: "ngo" as Role, label: "NGO", icon: "🏛️" },
  { value: "admin" as Role, label: "Admin", icon: "🛡️" },
  { value: "volunteer" as Role, label: "Volunteer", icon: "🤝" },
  { value: "donor" as Role, label: "Donor", icon: "💛" },
];

const genders = [
  { value: "male" as Gender, label: "Male" },
  { value: "female" as Gender, label: "Female" },
  { value: "other" as Gender, label: "Other" },
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];

const skillOptions = [
  "First Aid", "Teaching", "Driving", "Cooking", "Medical Care",
  "Counseling", "Carpentry", "Plumbing", "IT Support", "Translation",
  "Photography", "Event Management", "Fundraising", "Legal Aid",
];

function AshokaChakra({ size = 80, opacity = 0.12 }: { size?: number; opacity?: number }) {
  const r = size / 2;
  const spokes = 24;
  const spokeLines = Array.from({ length: spokes }, (_, i) => {
    const angle = (i * 360) / spokes;
    const rad = (angle * Math.PI) / 180;
    const x1 = r + r * 0.22 * Math.cos(rad);
    const y1 = r + r * 0.22 * Math.sin(rad);
    const x2 = r + r * 0.82 * Math.cos(rad);
    const y2 = r + r * 0.82 * Math.sin(rad);
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

function SelectField({
  label, value, onChange, options, placeholder, error, icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: string }[];
  placeholder: string;
  error?: string;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-0.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 z-10 pointer-events-none" />}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={`input-focus-orange w-full flex items-center justify-between ${Icon ? "pl-10" : "pl-4"} pr-3.5 py-3 rounded-xl border bg-white text-sm transition-all duration-200 outline-none
            ${error ? "border-red-400 bg-red-50/50" : "border-orange-200 hover:border-orange-300"}
            ${selected ? "text-gray-800" : "text-gray-400"}`}
        >
          <span className="flex items-center gap-2">
            {selected ? (
              <>
                {selected.icon && <span>{selected.icon}</span>}
                <span className="font-medium">{selected.label}</span>
              </>
            ) : placeholder}
          </span>
          <ChevronDown size={16} className={`text-orange-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute z-30 w-full mt-1.5 bg-white border border-orange-100 rounded-xl shadow-lg overflow-auto max-h-48">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-orange-50
                  ${value === opt.value ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-700"}`}
              >
                {opt.icon && <span>{opt.icon}</span>}
                <span>{opt.label}</span>
                {value === opt.value && <span className="ml-auto text-orange-500 text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 ml-0.5">{error}</p>}
    </div>
  );
}

function InputField({
  label, id, type = "text", placeholder, value, onChange, error, icon: Icon, suffix, autoComplete,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ElementType;
  suffix?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-0.5" htmlFor={id}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          className={`input-focus-orange w-full ${Icon ? "pl-10" : "pl-4"} ${suffix ? "pr-11" : "pr-4"} py-3 rounded-xl border bg-white text-sm text-gray-800 placeholder-gray-400 transition-all duration-200 outline-none
            ${error ? "border-red-400 bg-red-50/50" : "border-orange-200 hover:border-orange-300"}`}
        />
        {suffix && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 ml-0.5">{error}</p>}
    </div>
  );
}

export default function SignupPage() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    fullName: "", age: "", gender: "", state: "", city: "",
    occupation: "", email: "", phone: "", password: "", confirmPassword: "",
    role: "",
    skills: [],
    availability: { dayShift: false, nightShift: false, weekdays: false, weekends: false },
    preferredWorkType: "",
  });

  const set = (field: keyof FormState, value: unknown) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      set("skills", [...form.skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    set("skills", form.skills.filter(s => s !== skill));
  };

  const toggleAvailability = (key: keyof Availability) => {
    set("availability", { ...form.availability, [key]: !form.availability[key] });
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.age) e.age = "Age is required";
    else if (Number(form.age) < 16 || Number(form.age) > 100) e.age = "Enter a valid age (16–100)";
    if (!form.gender) e.gender = "Please select gender";
    if (!form.state) e.state = "Please select your state";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!form.phone) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.role) e.role = "Please select your role";
    setErrors(e);
    return Object.keys(e).length === 0;
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
      // Local-only signup: persist profile and route by role.
      const role = form.role as Role;
      const user = {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        role,
        city: form.city,
        state: form.state,
        skills: form.skills,
      };
      localStorage.setItem("sahara_user", JSON.stringify(user));
      localStorage.setItem("token", `local-${Date.now()}`);
      window.location.href = routeForRole(role);
    } catch {
      setErrors({ email: "Could not sign up. Please try again." });
      setIsLoading(false);
    }
  };

  const isVolunteer = form.role === "volunteer";

  return (
    <div
      className="min-h-screen flex items-start justify-center relative overflow-hidden py-10 px-4"
      style={{ background: "linear-gradient(145deg, #FFF8F2 0%, #FFF0E0 50%, #FFE8CC 100%)" }}
    >
      <div className="absolute inset-0 chakra-pattern" />

      <div className="absolute top-8 right-10 animate-spin-slow pointer-events-none">
        <AshokaChakra size={110} opacity={0.09} />
      </div>
      <div className="absolute bottom-10 left-10 pointer-events-none">
        <AshokaChakra size={80} opacity={0.07} />
      </div>
      <div className="absolute top-1/3 left-6 pointer-events-none">
        <AshokaChakra size={52} opacity={0.05} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-visible">
          <div
            className="h-1.5 w-full rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, #FF7A00, #FFB347, #FF7A00)" }}
          />

          <div className="px-8 py-9">
            <div className="flex flex-col items-center mb-8">
              <img
                src={saharaLogo}
                alt="Sahara"
                className="w-28 h-28 object-contain mb-2"
              />
              <h2 className="text-2xl font-bold text-gray-900 text-center">Create Your Account</h2>
              <p className="text-gray-500 text-sm font-light text-center mt-1">Join the Smart Resource Allocation System</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5">
                <div className="pb-1">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Personal Details</p>
                  <div className="space-y-4">
                    <InputField
                      label="Full Name"
                      id="fullName"
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={v => set("fullName", v)}
                      error={errors.fullName}
                      icon={User}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Age"
                        id="age"
                        type="number"
                        placeholder="e.g. 25"
                        value={form.age}
                        onChange={v => set("age", v)}
                        error={errors.age}
                        icon={Calendar}
                      />
                      <SelectField
                        label="Gender"
                        value={form.gender}
                        onChange={v => set("gender", v)}
                        options={genders}
                        placeholder="Select gender"
                        error={errors.gender}
                      />
                    </div>

                    <SelectField
                      label="State"
                      value={form.state}
                      onChange={v => set("state", v)}
                      options={indianStates.map(s => ({ value: s, label: s }))}
                      placeholder="Select your state"
                      error={errors.state}
                      icon={MapPin}
                    />

                    <InputField
                      label="City"
                      id="city"
                      placeholder="Your city"
                      value={form.city}
                      onChange={v => set("city", v)}
                      error={errors.city}
                      icon={MapPin}
                    />

                    <InputField
                      label="Occupation"
                      id="occupation"
                      placeholder="e.g. Teacher, Engineer (optional)"
                      value={form.occupation}
                      onChange={v => set("occupation", v)}
                      error={errors.occupation}
                      icon={Briefcase}
                    />
                  </div>
                </div>

                <div className="h-px bg-orange-100" />

                <div className="pb-1">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Contact & Security</p>
                  <div className="space-y-4">
                    <InputField
                      label="Email Address"
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={v => set("email", v)}
                      error={errors.email}
                      icon={Mail}
                    />

                    <InputField
                      label="Phone Number"
                      id="phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={v => set("phone", v)}
                      error={errors.phone}
                      icon={Phone}
                    />

                    <InputField
                      label="Password"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={v => set("password", v)}
                      error={errors.password}
                      icon={Lock}
                      autoComplete="new-password"
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="text-gray-400 hover:text-orange-500 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />

                    <InputField
                      label="Confirm Password"
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={v => set("confirmPassword", v)}
                      error={errors.confirmPassword}
                      icon={Lock}
                      autoComplete="new-password"
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowConfirm(v => !v)}
                          className="text-gray-400 hover:text-orange-500 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                  </div>
                </div>

                <div className="h-px bg-orange-100" />

                <div className="pb-1">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Your Role</p>
                  <SelectField
                    label="Select Your Role"
                    value={form.role}
                    onChange={v => set("role", v)}
                    options={roles}
                    placeholder="Choose your role..."
                    error={errors.role}
                  />
                </div>

                {isVolunteer && (
                  <div
                    className="space-y-5 overflow-hidden"
                    style={{ animation: "fadeSlideIn 0.3s ease" }}
                  >
                    <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                    <div className="h-px bg-orange-100" />
                    <div>
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Volunteer Details</p>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 ml-0.5">
                            Skills
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {form.skills.map(skill => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="hover:text-orange-900 transition-colors ml-0.5"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />
                              <input
                                type="text"
                                placeholder="Type or select a skill..."
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }
                                }}
                                className="input-focus-orange w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 hover:border-orange-300 bg-white text-sm text-gray-800 placeholder-gray-400 transition-all duration-200 outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => addSkill(skillInput)}
                              className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                              style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {skillOptions.filter(s => !form.skills.includes(s)).map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => addSkill(s)}
                                className="px-2.5 py-1 rounded-full border border-orange-200 text-orange-600 text-xs hover:bg-orange-50 hover:border-orange-300 transition-colors"
                              >
                                + {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2.5 ml-0.5">
                            Availability
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(
                              [
                                { key: "dayShift", label: "Day Shift" },
                                { key: "nightShift", label: "Night Shift" },
                                { key: "weekdays", label: "Weekdays" },
                                { key: "weekends", label: "Weekends" },
                              ] as { key: keyof Availability; label: string }[]
                            ).map(({ key, label }) => (
                              <label
                                key={key}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all
                                  ${form.availability[key]
                                    ? "border-orange-400 bg-orange-50 text-orange-700"
                                    : "border-orange-100 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/50"}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={form.availability[key]}
                                  onChange={() => toggleAvailability(key)}
                                  className="w-4 h-4 accent-orange-500 rounded"
                                />
                                <span className="text-sm font-medium">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <InputField
                          label="Preferred Work Type (Optional)"
                          id="preferredWorkType"
                          placeholder="e.g. On-site, Remote, Hybrid"
                          value={form.preferredWorkType}
                          onChange={v => set("preferredWorkType", v)}
                          icon={Briefcase}
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                      Creating Account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-orange-100" />
                <span className="text-xs text-gray-400 font-medium">or sign up with</span>
                <div className="flex-1 h-px bg-orange-100" />
              </div>
              <SocialAuthButtons
                getRole={() => form.role as AuthRole | ""}
                onMissingRole={() => setErrors(er => ({ ...er, role: "Please select your role first" }))}
              />
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
              >
                Login
              </button>
            </p>

            <p className="mt-3 text-center text-xs text-gray-400 leading-relaxed">
              By signing up, you agree to Sahara's{" "}
              <button type="button" className="text-orange-400 hover:text-orange-500 transition-colors">Terms of Service</button>
              {" "}and{" "}
              <button type="button" className="text-orange-400 hover:text-orange-500 transition-colors">Privacy Policy</button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-orange-400/60 mt-5 font-light">
          Smart Resource Allocation System · Sahara
        </p>
      </div>
    </div>
  );
}
