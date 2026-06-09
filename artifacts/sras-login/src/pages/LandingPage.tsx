import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useLocation } from "wouter";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  type Variants,
  type Transition,
} from "framer-motion";
import {
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Heart,
  Globe2,
  Users,
  HandHeart,
  PenSquare,
  BarChart3,
  CheckCircle2,
  Mail,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
 * Easing & shared transitions
 * ────────────────────────────────────────────────────────── */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 22,
  mass: 0.9,
};

/* ──────────────────────────────────────────────────────────
 * Variants
 * ────────────────────────────────────────────────────────── */
const containerStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const containerStaggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};

const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const wordReveal: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: "0%",
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};

/* ──────────────────────────────────────────────────────────
 * Reusable: animated gradient text
 * ────────────────────────────────────────────────────────── */
function GradientText({
  children,
  className = "",
  from = "from-orange-500",
  via = "via-purple-500",
  to = "to-sky-500",
}: {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}) {
  return (
    <span
      className={`bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer ${className}`}
    >
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────
 * Animated headline with word-by-word stagger
 * ────────────────────────────────────────────────────────── */
function AnimatedHeadline({ words }: { words: { text: string; gradient?: boolean }[] }) {
  return (
    <motion.h1
      variants={containerStaggerFast}
      initial="hidden"
      animate="visible"
      className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.95]"
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-3 md:mr-4">
          <motion.span variants={wordReveal} className="inline-block">
            {w.gradient ? (
              <GradientText
                from="from-orange-500"
                via="via-pink-500"
                to="to-purple-600"
              >
                {w.text}
              </GradientText>
            ) : (
              <span className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {w.text}
              </span>
            )}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}

/* ──────────────────────────────────────────────────────────
 * Floating animated SVG blobs (morph + drift)
 * ────────────────────────────────────────────────────────── */
function MorphBlob({
  className = "",
  colors = ["#fb923c", "#a855f7", "#38bdf8"],
  duration = 18,
}: {
  className?: string;
  colors?: string[];
  duration?: number;
}) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      className={className}
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: duration * 2, repeat: Infinity, ease: "linear" }}
    >
      <defs>
        <linearGradient id={`blob-${colors.join("")}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {colors.map((c, i) => (
            <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <motion.path
        fill={`url(#blob-${colors.join("")})`}
        animate={{
          d: [
            "M320,180Q310,260,240,300Q170,340,110,290Q50,240,70,160Q90,80,170,60Q250,40,300,100Q350,160,320,180Z",
            "M330,200Q300,280,220,310Q140,340,90,280Q40,220,80,140Q120,60,200,70Q280,80,320,140Q360,200,330,200Z",
            "M310,170Q320,250,250,300Q180,350,110,300Q40,250,70,170Q100,90,180,70Q260,50,300,110Q340,170,310,170Z",
            "M320,180Q310,260,240,300Q170,340,110,290Q50,240,70,160Q90,80,170,60Q250,40,300,100Q350,160,320,180Z",
          ],
        }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

function FloatingBlobs() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-[32rem] h-[32rem] opacity-50"
      >
        <MorphBlob colors={["#fdba74", "#f472b6", "#a78bfa"]} duration={14} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] -right-32 w-[36rem] h-[36rem] opacity-50"
      >
        <MorphBlob colors={["#a78bfa", "#60a5fa", "#fdba74"]} duration={18} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] left-[25%] w-[28rem] h-[28rem] opacity-40"
      >
        <MorphBlob colors={["#fde68a", "#fb923c", "#f472b6"]} duration={16} />
      </motion.div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Animated mesh gradient background (slowly shifting)
 * ────────────────────────────────────────────────────────── */
function AnimatedMeshBg() {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 -z-20 opacity-70"
      style={{
        background:
          "radial-gradient(at 20% 20%, #fed7aa 0px, transparent 50%), radial-gradient(at 80% 0%, #ddd6fe 0px, transparent 50%), radial-gradient(at 0% 50%, #fbcfe8 0px, transparent 50%), radial-gradient(at 80% 50%, #bae6fd 0px, transparent 50%), radial-gradient(at 0% 100%, #fef3c7 0px, transparent 50%), radial-gradient(at 80% 100%, #e9d5ff 0px, transparent 50%)",
        backgroundSize: "200% 200%",
      }}
      animate={{
        backgroundPosition: [
          "0% 0%",
          "100% 50%",
          "50% 100%",
          "0% 50%",
          "0% 0%",
        ],
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ──────────────────────────────────────────────────────────
 * Scroll progress bar
 * ────────────────────────────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
    />
  );
}

/* ──────────────────────────────────────────────────────────
 * NavBar with active-section highlighting
 * ────────────────────────────────────────────────────────── */
function NavBar({ activeSection }: { activeSection: string }) {
  const [, navigate] = useLocation();
  const links = [
    { id: "features", label: "Features" },
    { id: "roles", label: "For everyone" },
    { id: "stories", label: "Stories" },
  ];
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="fixed top-0 left-0 right-0 z-50 px-6 pt-5"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between rounded-full bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 shadow-lg shadow-orange-500/5 px-5 py-3">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.04 }}
          transition={EASE_SPRING}
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
            S
          </div>
          <span className="font-semibold tracking-tight text-gray-900">
            Sahara
          </span>
        </motion.div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="relative px-4 py-2 rounded-full hover:text-gray-900 transition-colors"
            >
              {activeSection === l.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100"
                  transition={EASE_SPRING}
                />
              )}
              <span className="relative z-10">{l.label}</span>
            </a>
          ))}
        </div>
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 12px 30px rgba(168,85,247,0.35)",
          }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/")}
          className="rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 px-5 py-2 text-white text-sm font-medium shadow-md transition-shadow"
        >
          Sign in
        </motion.button>
      </div>
    </motion.nav>
  );
}

/* ──────────────────────────────────────────────────────────
 * 3D tilt card (mouse-tracked rotateX/rotateY)
 * ────────────────────────────────────────────────────────── */
function TiltCard({
  children,
  className = "",
  glowColor = "rgba(168, 85, 247, 0.35)",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 60%)`;

  function handleMove(e: ReactMouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    x.set(px - 0.5);
    y.set(py - 0.5);
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ y: -6 }}
      transition={EASE_SPRING}
      className={`relative ${className}`}
    >
      <motion.div
        aria-hidden
        style={{ background: glow }}
        className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Feature card
 * ────────────────────────────────────────────────────────── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  glow: string;
}

function FeatureCard({ icon, title, description, gradient, glow }: FeatureCardProps) {
  return (
    <motion.div variants={fadeUpSmall} className="[perspective:1200px]">
      <TiltCard glowColor={glow}>
        <div className="relative overflow-hidden rounded-3xl bg-white/80 p-8 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_70px_rgb(0,0,0,0.12)] transition-shadow duration-500 h-full">
          <motion.div
            className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5 text-white shadow-lg ${gradient}`}
            whileHover={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 0.6 }}
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Role card
 * ────────────────────────────────────────────────────────── */
interface RoleCardProps {
  icon: React.ReactNode;
  role: string;
  description: string;
  accent: string;
}

function RoleCard({ icon, role, description, accent }: RoleCardProps) {
  return (
    <motion.div variants={fadeUpSmall} className="[perspective:1000px]">
      <TiltCard glowColor="rgba(251, 146, 60, 0.3)">
        <div className="group relative rounded-3xl bg-white p-7 ring-1 ring-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.10)] transition-shadow duration-500 h-full">
          <div className={`h-1.5 w-12 rounded-full mb-5 ${accent}`} />
          <motion.div
            className="text-gray-700 mb-3 inline-block"
            whileHover={{ scale: 1.15, rotate: 6 }}
            transition={EASE_SPRING}
          >
            {icon}
          </motion.div>
          <h4 className="text-lg font-semibold text-gray-900 mb-1.5">{role}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Alternating content section (parallax + scroll-linked zoom)
 * ────────────────────────────────────────────────────────── */
interface SectionProps {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  imageUrl: string;
  reverse?: boolean;
  gradient: string;
}

function ContentSection({
  eyebrow,
  title,
  body,
  bullets,
  imageUrl,
  reverse = false,
  gradient,
}: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1.15, 1.05]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);
  const smoothY = useSpring(y, { stiffness: 70, damping: 20 });
  const smoothRotate = useSpring(rotate, { stiffness: 70, damping: 20 });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerStagger}
      className="py-24 md:py-32 px-6"
    >
      <div
        className={`mx-auto max-w-6xl grid md:grid-cols-2 gap-12 md:gap-20 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <motion.div variants={fadeUp}>
          <motion.p
            variants={fadeUpSmall}
            className="text-sm font-semibold uppercase tracking-[0.2em] mb-4"
          >
            <GradientText from="from-orange-500" via="via-pink-500" to="to-purple-600">
              {eyebrow}
            </GradientText>
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.05]"
          >
            {title}
          </motion.h2>
          <motion.p
            variants={fadeUpSmall}
            className="text-lg text-gray-600 leading-relaxed mb-6 max-w-md"
          >
            {body}
          </motion.p>
          <motion.ul variants={containerStaggerFast} className="space-y-3">
            {bullets.map((b) => (
              <motion.li
                key={b}
                variants={fadeUpSmall}
                className="flex items-start gap-3 text-gray-700"
              >
                <CheckCircle2 className="h-5 w-5 mt-0.5 text-orange-500 flex-shrink-0" />
                <span>{b}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
        <motion.div
          variants={scaleIn}
          style={{ y: smoothY, rotate: smoothRotate }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-100 to-gray-200 shadow-[0_30px_80px_-20px_rgb(168,85,247,0.4)] group">
            <motion.img
              src={imageUrl}
              alt=""
              style={{ scale }}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          </div>
          <div
            className={`absolute -inset-6 -z-10 rounded-[3rem] blur-3xl opacity-60 ${gradient}`}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ──────────────────────────────────────────────────────────
 * Stat card
 * ────────────────────────────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      variants={fadeUpSmall}
      whileHover={{ y: -6, scale: 1.04 }}
      transition={EASE_SPRING}
      className="rounded-2xl bg-white/80 backdrop-blur-md ring-1 ring-black/5 px-6 py-5 text-center shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-shadow"
    >
      <div className="text-3xl md:text-4xl font-bold">
        <GradientText from="from-orange-500" via="via-pink-500" to="to-purple-600">
          {value}
        </GradientText>
      </div>
      <div className="text-xs uppercase tracking-wider text-gray-500 mt-1 font-medium">
        {label}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Story card
 * ────────────────────────────────────────────────────────── */
function StoryCard({
  quote,
  name,
  role,
  gradient,
}: {
  quote: string;
  name: string;
  role: string;
  gradient: string;
}) {
  return (
    <motion.div variants={fadeUpSmall} className="[perspective:1000px]">
      <TiltCard glowColor="rgba(251, 146, 60, 0.25)">
        <div className="rounded-3xl bg-white/80 backdrop-blur-md p-7 ring-1 ring-black/5 shadow-sm hover:shadow-[0_25px_60px_rgb(0,0,0,0.10)] transition-shadow duration-500 h-full">
          <div className="text-4xl text-orange-300 font-serif leading-none mb-2">
            "
          </div>
          <p className="text-gray-700 leading-relaxed mb-5 text-[15px]">
            {quote}
          </p>
          <div className="flex items-center gap-3">
            <div
              className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-semibold ${gradient}`}
            >
              {name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{name}</div>
              <div className="text-xs text-gray-500">{role}</div>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Footer
 * ────────────────────────────────────────────────────────── */
function LandingFooter() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerStagger}
      className="relative mt-20 overflow-hidden"
    >
      <AnimatedMeshBg />
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 left-1/3 w-72 h-72 opacity-50"
      >
        <MorphBlob colors={["#fb923c", "#f472b6", "#a78bfa"]} duration={20} />
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-4 gap-10">
        <motion.div variants={fadeUp} className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
              S
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-900">
              Sahara
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed max-w-md">
            A platform for changemakers. Connecting reporters, NGOs,
            volunteers, and donors to deliver help where it matters most.
          </p>
          <motion.div variants={containerStaggerFast} className="flex gap-3 mt-6">
            {[
              { Icon: Twitter, href: "#" },
              { Icon: Github, href: "#" },
              { Icon: Linkedin, href: "#" },
              { Icon: Mail, href: "#" },
            ].map(({ Icon, href }, i) => (
              <motion.a
                key={i}
                href={href}
                variants={fadeUpSmall}
                whileHover={{ y: -4, scale: 1.12, rotate: -6 }}
                whileTap={{ scale: 0.95 }}
                transition={EASE_SPRING}
                className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur ring-1 ring-black/5 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:shadow-lg transition-shadow"
              >
                <Icon className="h-4 w-4" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Product
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <a href="#features" className="hover:text-purple-600 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#roles" className="hover:text-purple-600 transition-colors">
                For everyone
              </a>
            </li>
            <li>
              <a href="#stories" className="hover:text-purple-600 transition-colors">
                Stories
              </a>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Company
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <a href="#" className="hover:text-purple-600 transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-purple-600 transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-purple-600 transition-colors">
                Privacy
              </a>
            </li>
          </ul>
        </motion.div>
      </div>

      <div className="relative border-t border-white/40 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-700 max-w-6xl mx-auto">
        <p>© {new Date().getFullYear()} Sahara. Crafted with care.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 text-pink-500 fill-pink-500" /> for humanity
        </p>
      </div>
    </motion.footer>
  );
}

/* ──────────────────────────────────────────────────────────
 * Main page
 * ────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

  // Hero scroll-linked transforms
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 250]);
  const heroOpacity = useTransform(heroProgress, [0, 0.85], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.18]);
  const bgY = useTransform(heroProgress, [0, 1], [0, 150]);
  const smoothHeroY = useSpring(heroY, { stiffness: 60, damping: 20 });
  const smoothBgY = useSpring(bgY, { stiffness: 50, damping: 20 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-purple-50 text-gray-900 overflow-hidden relative">
      <AnimatedMeshBg />
      <ScrollProgress />
      <NavBar activeSection={activeSection} />

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20"
      >
        <motion.div style={{ y: smoothBgY }} className="absolute inset-0">
          <FloatingBlobs />
        </motion.div>

        <motion.div
          style={{ y: smoothHeroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-4 py-2 ring-1 ring-black/5 mb-8 text-sm text-gray-700 shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4 text-orange-500" />
            </motion.div>
            A friendlier way to help
          </motion.div>

          <AnimatedHeadline
            words={[
              { text: "Stories" },
              { text: "that" },
              { text: "change" },
              { text: "the" },
              { text: "world.", gradient: true },
            ]}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE_OUT }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mt-8 mb-10 leading-relaxed"
          >
            Sahara brings together reporters, NGOs, volunteers, and donors —
            so help reaches the people who need it, faster.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerStaggerFast}
            transition={{ delayChildren: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              variants={fadeUpSmall}
              onClick={() => navigate("/")}
              whileHover={{
                scale: 1.06,
                boxShadow: "0 25px 50px rgba(251, 146, 60, 0.45)",
              }}
              whileTap={{ scale: 0.96 }}
              transition={EASE_SPRING}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-[length:200%_auto] animate-shimmer px-7 py-3.5 text-white font-medium shadow-lg shadow-orange-500/30"
            >
              Get started{" "}
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </motion.button>
            <motion.a
              variants={fadeUpSmall}
              href="#features"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={EASE_SPRING}
              className="inline-flex items-center rounded-full bg-white/80 backdrop-blur px-7 py-3.5 text-gray-900 font-medium ring-1 ring-black/5 hover:bg-white hover:shadow-lg transition-all"
            >
              Take a tour
            </motion.a>
          </motion.div>

          {/* Hero illustration */}
          <motion.div
            style={{ scale: heroScale }}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: EASE_OUT }}
            className="relative mt-20 mx-auto max-w-3xl [perspective:1500px]"
          >
            <motion.div
              animate={{ y: [0, -16, 0], rotateX: [0, 1.5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-[0_50px_120px_-20px_rgb(168,85,247,0.5)] ring-1 ring-black/5"
            >
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/15 via-transparent to-purple-500/15" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 top-12 hidden md:flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-3 ring-1 ring-black/5 shadow-xl"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500">Volunteers</div>
                <div className="text-sm font-semibold text-gray-900">1,200+</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0], rotate: [2, -2, 2] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -right-6 bottom-12 hidden md:flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-3 ring-1 ring-black/5 shadow-xl"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-400 to-sky-500 flex items-center justify-center text-white">
                <HandHeart className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500">Lives impacted</div>
                <div className="text-sm font-semibold text-gray-900">96K+</div>
              </div>
            </motion.div>

            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-orange-300/30 via-purple-300/30 to-pink-300/30 blur-3xl" />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerStagger}
        className="px-6 py-12"
      >
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="1,200+" label="Volunteers" />
          <StatCard value="340+" label="NGOs" />
          <StatCard value="₹4.2Cr" label="Donations" />
          <StatCard value="96K+" label="Lives impacted" />
        </div>
      </motion.section>

      {/* FEATURES */}
      <motion.section
        id="features"
        onViewportEnter={() => setActiveSection("features")}
        viewport={{ amount: 0.3 }}
        className="py-24 md:py-32 px-6"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerStagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              <GradientText
                from="from-orange-500"
                via="via-pink-500"
                to="to-purple-600"
              >
                Why Sahara
              </GradientText>
            </p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
              Built for people who care.
            </h2>
            <p className="text-lg text-gray-600 mt-5 max-w-2xl mx-auto">
              Tools that feel friendly, fast, and considered. No friction, just
              impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Fast by default"
              description="From report to relief in minutes. No paperwork mountains, no waiting."
              gradient="bg-gradient-to-br from-orange-400 to-pink-500"
              glow="rgba(251, 146, 60, 0.4)"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Trusted & verified"
              description="Every NGO and volunteer is verified. Donations are transparent and traceable."
              gradient="bg-gradient-to-br from-purple-400 to-pink-500"
              glow="rgba(168, 85, 247, 0.4)"
            />
            <FeatureCard
              icon={<Globe2 className="h-6 w-6" />}
              title="Connects everyone"
              description="One platform for reporters, NGOs, volunteers, donors, and admins to work as one."
              gradient="bg-gradient-to-br from-sky-400 to-purple-500"
              glow="rgba(56, 189, 248, 0.4)"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* ALTERNATING CONTENT */}
      <ContentSection
        eyebrow="For NGOs"
        title="Less admin, more impact."
        body="Manage cases, coordinate volunteers, and track donations from one calm dashboard. Built for the work, not the paperwork."
        bullets={[
          "Real-time case tracking",
          "Volunteer scheduling & messaging",
          "Donation transparency reports",
        ]}
        imageUrl="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
        gradient="bg-gradient-to-br from-orange-300/40 to-pink-400/40"
      />

      <ContentSection
        eyebrow="For volunteers"
        title="Help where it matters."
        body="Discover opportunities near you, log your hours, and see the impact you're making. Volunteering, made delightful."
        bullets={[
          "Smart, location-aware matching",
          "One-tap check-in & hours log",
          "Personalized impact stories",
        ]}
        imageUrl="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80"
        gradient="bg-gradient-to-br from-purple-300/40 to-sky-300/40"
        reverse
      />

      <ContentSection
        eyebrow="For donors"
        title="See your kindness in motion."
        body="Watch your contribution travel from your wallet to the people it reaches. Beautiful, transparent, and real."
        bullets={[
          "Live progress on every donation",
          "Stories from the families you help",
          "Tax-friendly receipts, automatically",
        ]}
        imageUrl="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1200&q=80"
        gradient="bg-gradient-to-br from-pink-300/40 to-orange-300/40"
      />

      {/* ROLES */}
      <motion.section
        id="roles"
        onViewportEnter={() => setActiveSection("roles")}
        viewport={{ amount: 0.3 }}
        className="py-24 md:py-32 px-6 relative"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-purple-50/60 to-transparent" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerStagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              <GradientText
                from="from-orange-500"
                via="via-pink-500"
                to="to-purple-600"
              >
                For everyone
              </GradientText>
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              A space for every role.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <RoleCard
              icon={<PenSquare className="h-7 w-7" />}
              role="Reporter"
              description="Log incidents from the field with photos, location, and notes."
              accent="bg-gradient-to-r from-orange-400 to-pink-500"
            />
            <RoleCard
              icon={<Globe2 className="h-7 w-7" />}
              role="NGO"
              description="Coordinate response, verify needs, and dispatch help."
              accent="bg-gradient-to-r from-purple-400 to-violet-500"
            />
            <RoleCard
              icon={<Users className="h-7 w-7" />}
              role="Volunteer"
              description="Find nearby missions and contribute your time and skills."
              accent="bg-gradient-to-r from-pink-400 to-rose-500"
            />
            <RoleCard
              icon={<HandHeart className="h-7 w-7" />}
              role="Donor"
              description="Give with confidence and follow your impact in real time."
              accent="bg-gradient-to-r from-amber-400 to-orange-500"
            />
            <RoleCard
              icon={<BarChart3 className="h-7 w-7" />}
              role="Admin"
              description="Oversee operations with insights, audits, and verifications."
              accent="bg-gradient-to-r from-sky-400 to-purple-500"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* STORIES */}
      <motion.section
        id="stories"
        onViewportEnter={() => setActiveSection("stories")}
        viewport={{ amount: 0.3 }}
        className="py-24 md:py-32 px-6"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerStagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              <GradientText
                from="from-orange-500"
                via="via-pink-500"
                to="to-purple-600"
              >
                Stories
              </GradientText>
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Voices from the field.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <StoryCard
              quote="Sahara made it possible to coordinate flood relief in 4 districts within 48 hours. We've never moved this fast."
              name="Priya Menon"
              role="HealthFirst NGO"
              gradient="bg-gradient-to-br from-orange-500 to-pink-600"
            />
            <StoryCard
              quote="As a volunteer, finding a meaningful way to help nearby used to take days. Now it takes one tap."
              name="Arjun Rao"
              role="Volunteer"
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <StoryCard
              quote="I get to see exactly where my donations go. That kind of transparency keeps me giving every month."
              name="Neha Kapoor"
              role="Donor"
              gradient="bg-gradient-to-br from-amber-500 to-rose-500"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <AnimatedMeshBg />
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-1/4 w-64 h-64 opacity-50"
          >
            <MorphBlob colors={["#fb923c", "#a855f7", "#38bdf8"]} duration={14} />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-1/4 w-72 h-72 opacity-50"
          >
            <MorphBlob colors={["#a855f7", "#38bdf8", "#fb923c"]} duration={16} />
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerStagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1]"
          >
            <span className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Ready to make
            </span>
            <br />
            <GradientText
              from="from-orange-500"
              via="via-pink-500"
              to="to-purple-600"
            >
              a difference?
            </GradientText>
          </motion.h2>
          <motion.p variants={fadeUpSmall} className="text-xl text-gray-700 mb-10">
            Join thousands of changemakers building something better, together.
          </motion.p>
          <motion.button
            variants={scaleIn}
            onClick={() => navigate("/")}
            whileHover={{
              scale: 1.06,
              boxShadow: "0 25px 50px rgba(251,146,60,0.45)",
            }}
            whileTap={{ scale: 0.96 }}
            transition={EASE_SPRING}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-[length:200%_auto] animate-shimmer px-9 py-4 text-white font-medium shadow-lg shadow-orange-500/30"
          >
            Get started for free <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
