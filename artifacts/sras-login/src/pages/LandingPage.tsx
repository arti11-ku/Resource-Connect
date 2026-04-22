import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type Variants,
} from "framer-motion";
import { Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-3xl bg-white/80 p-8 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-shadow duration-500"
    >
      <div
        className={`absolute -inset-1 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 ${gradient}`}
        aria-hidden
      />
      <div className="relative">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-black/5 mb-5 text-gray-700 group-hover:scale-110 transition-transform duration-500">
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

interface SectionProps {
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  reverse?: boolean;
}

function ContentSection({
  eyebrow,
  title,
  body,
  imageUrl,
  reverse = false,
}: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1.12, 1.05]);
  const smoothY = useSpring(y, { stiffness: 80, damping: 20 });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={stagger}
      className="py-24 md:py-32"
    >
      <div
        className={`mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <motion.div variants={fadeUp}>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 mb-4">
            {eyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-6 leading-[1.05]">
            {title}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-md">
            {body}
          </p>
        </motion.div>
        <motion.div
          variants={fadeUp}
          style={{ y: smoothY }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-100 to-gray-200 shadow-[0_30px_80px_-20px_rgb(0,0,0,0.25)]">
            <motion.img
              src={imageUrl}
              alt=""
              style={{ scale }}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-200/40 via-purple-200/30 to-pink-200/40 blur-3xl" />
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const smoothHeroY = useSpring(heroY, { stiffness: 60, damping: 20 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white text-gray-900 overflow-hidden">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute top-1/2 right-1/3 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
        </div>

        <motion.div
          style={{ y: smoothHeroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-4 py-2 ring-1 ring-black/5 mb-8 text-sm text-gray-600"
          >
            <Sparkles className="h-4 w-4" />
            Designed with intention
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95] mb-6 bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent"
          >
            Crafted to move.
            <br />
            Built to last.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A new standard for digital experiences. Every detail considered,
            every motion refined.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-center justify-center gap-4"
          >
            <motion.a
              href="#features"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-white font-medium shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 transition-shadow duration-300"
            >
              Explore <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              href="#features"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center rounded-full bg-white/80 backdrop-blur px-7 py-3.5 text-gray-900 font-medium ring-1 ring-black/5 hover:bg-white transition-colors"
            >
              Learn more
            </motion.a>
          </motion.div>

          <motion.div
            style={{ scale: heroScale }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mt-20 mx-auto max-w-3xl"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgb(0,0,0,0.3)] ring-1 ring-black/5"
            >
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"
                alt=""
                className="h-full w-full object-cover"
              />
            </motion.div>
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-300/30 via-purple-300/30 to-pink-300/30 blur-3xl" />
          </motion.div>
        </motion.div>
      </section>

      <section id="features" className="py-24 md:py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 mb-4">
              Features
            </p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Everything you need.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Lightning fast"
              description="Optimized from the ground up. Interactions feel instant, transitions feel inevitable."
              gradient="bg-gradient-to-br from-blue-300/50 to-cyan-300/50"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Privacy first"
              description="Your data stays yours. End-to-end protection by default, not as an afterthought."
              gradient="bg-gradient-to-br from-purple-300/50 to-pink-300/50"
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Beautifully simple"
              description="Considered details. Quiet confidence. The kind of design that gets out of your way."
              gradient="bg-gradient-to-br from-amber-300/50 to-rose-300/50"
            />
          </div>
        </motion.div>
      </section>

      <ContentSection
        eyebrow="Performance"
        title="Smooth where it counts."
        body="Every frame, every gesture, every transition tuned to feel natural. Built on a foundation that never gets in your way."
        imageUrl="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80"
      />

      <ContentSection
        eyebrow="Design"
        title="Less, but better."
        body="A quieter palette. Generous space. Typography that breathes. Nothing demands your attention until it should."
        imageUrl="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"
        reverse
      />

      <ContentSection
        eyebrow="Craft"
        title="Made with care."
        body="The smallest details receive the most attention. Because the difference between good and great lives in the corners."
        imageUrl="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80"
      />

      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Ready when you are.
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Step into a more thoughtful way to build.
          </p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-white font-medium shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 transition-shadow duration-300"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}
