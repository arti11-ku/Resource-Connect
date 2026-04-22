import { useRef } from "react";
import { useLocation } from "wouter";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type Variants,
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

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function FloatingBlobs() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-5%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-sky-300/40 to-blue-400/30 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-purple-300/40 to-pink-300/30 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[30%] h-[24rem] w-[24rem] rounded-full bg-gradient-to-br from-indigo-300/30 to-cyan-300/30 blur-3xl"
      />
    </div>
  );
}

function NavBar() {
  const [, navigate] = useLocation();
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 pt-5"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between rounded-full bg-white/70 backdrop-blur-xl ring-1 ring-black/5 shadow-sm px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
            S
          </div>
          <span className="font-semibold tracking-tight text-gray-900">
            Sahara
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#roles" className="hover:text-gray-900 transition-colors">
            For everyone
          </a>
          <a href="#stories" className="hover:text-gray-900 transition-colors">
            Stories
          </a>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/")}
          className="rounded-full bg-gradient-to-r from-sky-500 to-purple-500 px-5 py-2 text-white text-sm font-medium shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow"
        >
          Sign in
        </motion.button>
      </div>
    </motion.nav>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUpSmall}
      whileHover={{ y: -10, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group relative overflow-hidden rounded-3xl bg-white/80 p-8 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_25px_70px_rgb(99,102,241,0.18)] transition-shadow duration-500"
    >
      <div
        className={`absolute -inset-1 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 ${gradient}`}
        aria-hidden
      />
      <div className="relative">
        <div
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5 text-white shadow-lg group-hover:scale-110 transition-transform duration-500 ${gradient}`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

interface RoleCardProps {
  icon: React.ReactNode;
  role: string;
  description: string;
  accent: string;
}

function RoleCard({ icon, role, description, accent }: RoleCardProps) {
  return (
    <motion.div
      variants={fadeUpSmall}
      whileHover={{ y: -8, scale: 1.02, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative rounded-3xl bg-white p-7 ring-1 ring-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.10)] transition-shadow duration-500"
    >
      <div className={`h-1.5 w-12 rounded-full mb-5 ${accent}`} />
      <div className="text-gray-700 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 inline-block">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-1.5">{role}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

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
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1.12, 1.05]);
  const smoothY = useSpring(y, { stiffness: 70, damping: 20 });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={stagger}
      className="py-24 md:py-32 px-6"
    >
      <div
        className={`mx-auto max-w-6xl grid md:grid-cols-2 gap-12 md:gap-20 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <motion.div variants={fadeUp}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {eyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.05]">
            {title}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-md">
            {body}
          </p>
          <ul className="space-y-3">
            {bullets.map((b) => (
              <motion.li
                key={b}
                variants={fadeUpSmall}
                className="flex items-start gap-3 text-gray-700"
              >
                <CheckCircle2 className="h-5 w-5 mt-0.5 text-sky-500 flex-shrink-0" />
                <span>{b}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          variants={fadeUp}
          style={{ y: smoothY }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-100 to-gray-200 shadow-[0_30px_80px_-20px_rgb(99,102,241,0.4)]">
            <motion.img
              src={imageUrl}
              alt=""
              style={{ scale }}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div
            className={`absolute -inset-6 -z-10 rounded-[3rem] blur-3xl opacity-60 ${gradient}`}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      variants={fadeUpSmall}
      whileHover={{ y: -4, scale: 1.04 }}
      className="rounded-2xl bg-white/80 backdrop-blur-md ring-1 ring-black/5 px-6 py-5 text-center shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-sky-600 to-purple-600 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs uppercase tracking-wider text-gray-500 mt-1 font-medium">
        {label}
      </div>
    </motion.div>
  );
}

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
    <motion.div
      variants={fadeUpSmall}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="rounded-3xl bg-white/80 backdrop-blur-md p-7 ring-1 ring-black/5 shadow-sm hover:shadow-[0_25px_60px_rgb(0,0,0,0.10)] transition-shadow duration-500"
    >
      <p className="text-gray-700 leading-relaxed mb-5 text-[15px]">
        "{quote}"
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
    </motion.div>
  );
}

function LandingFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-20"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100" />
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-purple-200/50 blur-3xl"
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
              S
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-900">
              Sahara
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed max-w-md">
            A platform for changemakers. Connecting reporters, NGOs,
            volunteers, and donors to deliver help where it matters most.
          </p>
          <div className="flex gap-3 mt-6">
            {[
              { Icon: Twitter, href: "#" },
              { Icon: Github, href: "#" },
              { Icon: Linkedin, href: "#" },
              { Icon: Mail, href: "#" },
            ].map(({ Icon, href }, i) => (
              <motion.a
                key={i}
                href={href}
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-xl bg-white ring-1 ring-black/5 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:shadow-md transition-shadow"
              >
                <Icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Product
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
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
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Company
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
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
        </div>
      </div>

      <div className="border-t border-white/60 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600 max-w-6xl mx-auto">
        <p>© {new Date().getFullYear()} Sahara. Crafted with care.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 text-pink-500 fill-pink-500" /> for humanity
        </p>
      </div>
    </motion.footer>
  );
}

export default function LandingPage() {
  const [, navigate] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const smoothHeroY = useSpring(heroY, { stiffness: 60, damping: 20 });
  const smoothBgY = useSpring(bgY, { stiffness: 50, damping: 20 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      <NavBar />

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20"
      >
        <motion.div style={{ y: smoothBgY }}>
          <FloatingBlobs />
        </motion.div>

        <motion.div
          style={{ y: smoothHeroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-4 py-2 ring-1 ring-black/5 mb-8 text-sm text-gray-700 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            A friendlier way to help
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
          >
            <span className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              Stories that
            </span>
            <br />
            <span className="bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              change the world.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Sahara brings together reporters, NGOs, volunteers, and donors —
            so help reaches the people who need it, faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 px-7 py-3.5 text-white font-medium shadow-lg shadow-purple-500/25 transition-shadow"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </motion.button>
            <motion.a
              href="#features"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center rounded-full bg-white/80 backdrop-blur px-7 py-3.5 text-gray-900 font-medium ring-1 ring-black/5 hover:bg-white hover:shadow-md transition-all"
            >
              Take a tour
            </motion.a>
          </motion.div>

          {/* Floating hero illustration */}
          <motion.div
            style={{ scale: heroScale }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-20 mx-auto max-w-3xl"
          >
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgb(168,85,247,0.4)] ring-1 ring-black/5"
            >
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-sky-500/10" />
            </motion.div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 top-12 hidden md:flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-3 ring-1 ring-black/5 shadow-lg"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500">Volunteers</div>
                <div className="text-sm font-semibold text-gray-900">1,200+</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 bottom-12 hidden md:flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-3 ring-1 ring-black/5 shadow-lg"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                <HandHeart className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500">Lives impacted</div>
                <div className="text-sm font-semibold text-gray-900">96K+</div>
              </div>
            </motion.div>

            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-sky-300/30 via-purple-300/30 to-pink-300/30 blur-3xl" />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
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
      <section id="features" className="py-24 md:py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Why Sahara
            </p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
              Built for people who care.
            </h2>
            <p className="text-lg text-gray-600 mt-5 max-w-2xl mx-auto">
              Tools that feel friendly, fast, and considered. No friction,
              just impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Fast by default"
              description="From report to relief in minutes. No paperwork mountains, no waiting."
              gradient="bg-gradient-to-br from-sky-400 to-blue-500"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Trusted & verified"
              description="Every NGO and volunteer is verified. Donations are transparent and traceable."
              gradient="bg-gradient-to-br from-purple-400 to-pink-500"
            />
            <FeatureCard
              icon={<Globe2 className="h-6 w-6" />}
              title="Connects everyone"
              description="One platform for reporters, NGOs, volunteers, donors, and admins to work as one."
              gradient="bg-gradient-to-br from-indigo-400 to-purple-500"
            />
          </div>
        </motion.div>
      </section>

      {/* ALTERNATING CONTENT SECTIONS */}
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
        gradient="bg-gradient-to-br from-sky-300/40 to-blue-400/40"
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
        gradient="bg-gradient-to-br from-purple-300/40 to-pink-300/40"
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
        gradient="bg-gradient-to-br from-pink-300/40 to-rose-300/40"
      />

      {/* ROLES / DASHBOARD CARDS */}
      <section id="roles" className="py-24 md:py-32 px-6 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-purple-50/50 to-transparent" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-4">
              For everyone
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
              accent="bg-gradient-to-r from-sky-400 to-blue-500"
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
              accent="bg-gradient-to-r from-emerald-400 to-teal-500"
            />
          </div>
        </motion.div>
      </section>

      {/* STORIES */}
      <section id="stories" className="py-24 md:py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Stories
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
              gradient="bg-gradient-to-br from-sky-500 to-blue-600"
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
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100" />
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-1/4 h-64 w-64 rounded-full bg-purple-300/40 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1]">
            <span className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Ready to make
            </span>
            <br />
            <span className="bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              a difference?
            </span>
          </h2>
          <p className="text-xl text-gray-700 mb-10">
            Join thousands of changemakers building something better, together.
          </p>
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.35)" }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 px-9 py-4 text-white font-medium shadow-lg shadow-purple-500/25 transition-shadow"
          >
            Get started for free <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
