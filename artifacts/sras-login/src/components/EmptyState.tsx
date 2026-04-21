import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "tasks" | "issues" | "messages" | "proofs" | "donations" | "recommend" | "generic" | "healthy";

interface EmptyStateProps {
  variant?: Variant;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

function Illustration({ variant }: { variant: Variant }) {
  const common = { width: 140, height: 110, viewBox: "0 0 200 160", fill: "none" } as const;
  switch (variant) {
    case "tasks":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill="#FFE7D1" />
          <rect x="50" y="40" width="100" height="80" rx="10" fill="#FFFFFF" stroke="#FFD2A8" strokeWidth="2" />
          <rect x="62" y="58" width="50" height="6" rx="3" fill="#FFB066" />
          <rect x="62" y="74" width="76" height="4" rx="2" fill="#FFE0BD" />
          <rect x="62" y="86" width="60" height="4" rx="2" fill="#FFE0BD" />
          <rect x="62" y="100" width="40" height="4" rx="2" fill="#FFE0BD" />
          <circle cx="138" cy="58" r="9" fill="#86EFAC" />
          <path d="M134 58 l3 3 l6 -6" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "issues":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill="#FFE7D1" />
          <path d="M100 38 L162 130 H38 Z" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2" strokeLinejoin="round" />
          <rect x="96" y="68" width="8" height="32" rx="4" fill="#EA580C" />
          <circle cx="100" cy="114" r="5" fill="#EA580C" />
        </svg>
      );
    case "messages":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill="#FFE7D1" />
          <path d="M40 50 H140 a10 10 0 0 1 10 10 v40 a10 10 0 0 1 -10 10 H80 l-18 14 v-14 H40 a10 10 0 0 1 -10 -10 V60 a10 10 0 0 1 10 -10 z" fill="#FFFFFF" stroke="#FFB066" strokeWidth="2" />
          <circle cx="68" cy="80" r="3.5" fill="#FB923C" />
          <circle cx="90" cy="80" r="3.5" fill="#FB923C" />
          <circle cx="112" cy="80" r="3.5" fill="#FB923C" />
        </svg>
      );
    case "proofs":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill="#FFE7D1" />
          <rect x="56" y="40" width="88" height="76" rx="8" fill="#FFFFFF" stroke="#FFD2A8" strokeWidth="2" />
          <circle cx="80" cy="64" r="7" fill="#FCD34D" />
          <path d="M58 108 L86 84 L106 100 L128 78 L142 92 V114 H58 Z" fill="#FFE0BD" />
        </svg>
      );
    case "donations":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill="#FFE7D1" />
          <path d="M100 122 C100 122 50 96 50 70 a22 22 0 0 1 40 -12 a22 22 0 0 1 40 12 c0 26 -50 52 -50 52 z" fill="#FECACA" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "recommend":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill="#FFE7D1" />
          <path d="M100 36 l11 22 24 4 -17 17 4 24 -22 -11 -22 11 4 -24 -17 -17 24 -4 z" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "healthy":
      return (
        <svg {...common}>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill="#DCFCE7" />
          <circle cx="100" cy="76" r="38" fill="#BBF7D0" stroke="#22C55E" strokeWidth="2" />
          <path d="M82 78 l12 12 24 -26" stroke="#166534" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <ellipse cx="100" cy="140" rx="70" ry="6" fill="#FFE7D1" />
          <circle cx="100" cy="78" r="38" fill="#FFEDD5" stroke="#FFB066" strokeWidth="2" />
          <circle cx="88" cy="74" r="4" fill="#FB923C" />
          <circle cx="112" cy="74" r="4" fill="#FB923C" />
          <path d="M86 92 q14 10 28 0" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );
  }
}

export default function EmptyState({
  variant = "generic",
  title,
  description,
  action,
  className = "",
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-6 px-4" : "py-10 px-6"
      } ${className}`}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-3"
      >
        <Illustration variant={variant} />
      </motion.div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-gray-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
