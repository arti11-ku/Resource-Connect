import { motion } from "framer-motion";
import floatImg1 from "@assets/images_(5)_1776836265158.jpg";
import floatImg2 from "@assets/images_(4)_1776836265159.jpg";
import floatImg3 from "@assets/53bbbde9-f19f-4cbd-9f2b-f6e4f02f10ce_1776836265160.jpg";
import floatImg4 from "@assets/images_(3)_1776836265160.jpg";
import floatImg5 from "@assets/NGOsource-Content-2.0--23.11.20---Nigerian-NGOs_IS_1776836265161.jpg";
import floatImg6 from "@assets/images_(2)_1776836265161.jpg";
import floatImg7 from "@assets/Medical_Camp_1776836265162.jpeg";

const FLOATING_IMAGES = [floatImg1, floatImg2, floatImg3, floatImg4, floatImg5, floatImg6, floatImg7];

const POSITIONS = [
  { top: "4%", left: "3%", delay: 0, dx: 18, dy: -14 },
  { top: "10%", left: "28%", delay: 0.4, dx: -16, dy: 18 },
  { top: "6%", left: "55%", delay: 0.8, dx: 20, dy: 16 },
  { top: "12%", right: "5%", delay: 0.2, dx: -22, dy: 14 },
  { top: "26%", left: "12%", delay: 1.1, dx: 14, dy: 20 },
  { top: "30%", left: "42%", delay: 0.5, dx: -18, dy: -16 },
  { top: "24%", right: "18%", delay: 1.4, dx: 16, dy: 18 },
  { top: "44%", left: "4%", delay: 0.7, dx: 20, dy: -18 },
  { top: "48%", left: "32%", delay: 1.2, dx: -14, dy: 16 },
  { top: "46%", left: "62%", delay: 0.3, dx: 18, dy: 18 },
  { top: "50%", right: "4%", delay: 1.6, dx: -16, dy: -14 },
  { top: "64%", left: "18%", delay: 0.9, dx: 14, dy: 16 },
  { top: "68%", left: "48%", delay: 1.3, dx: -18, dy: 14 },
  { top: "66%", right: "10%", delay: 0.6, dx: 20, dy: -16 },
  { top: "84%", left: "6%", delay: 1.0, dx: 16, dy: -18 },
  { top: "86%", left: "36%", delay: 1.5, dx: -20, dy: 14 },
  { top: "82%", left: "66%", delay: 0.5, dx: 18, dy: 18 },
  { top: "88%", right: "6%", delay: 1.1, dx: -16, dy: -14 },
];

export default function FloatingBackground({ size = 70, opacity = 0.12 }: { size?: number; opacity?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {POSITIONS.map((p, i) => (
        <motion.img
          key={i}
          src={FLOATING_IMAGES[i % FLOATING_IMAGES.length]}
          alt=""
          style={{
            position: "absolute",
            top: p.top,
            left: (p as any).left,
            right: (p as any).right,
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            opacity,
            filter: "blur(0.5px)",
            boxShadow: "0 6px 18px rgba(255,122,0,0.12)",
          }}
          animate={{
            x: [0, p.dx, 0, -p.dx, 0],
            y: [0, p.dy, 0, -p.dy, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{ duration: 10 + (i % 6), repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}
