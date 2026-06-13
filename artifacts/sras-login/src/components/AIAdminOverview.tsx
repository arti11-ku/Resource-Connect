import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { geminiAdminOverview, type GeminiAdminOverview } from "../lib/geminiApi";

const ORANGE = "#FF7A00";
const ORANGE_LIGHT = "#FF9A40";

interface Props {
  resources: { name: string; quantity: number; status: string }[];
  volunteers: { name: string; assignedTask?: string; skills: string[] }[];
  tasks: { title: string; status: string; priority: string }[];
}

export default function AIAdminOverview({ resources, volunteers, tasks }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<GeminiAdminOverview | null>(null);

  const mockAllocations = tasks.slice(0, 4).map((t, i) => ({
    id: String(i + 1),
    report_type: t.title,
    priority: t.priority,
    status: t.status,
    volunteer_count: 1,
    resource_count: 2,
  }));

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await geminiAdminOverview({
        allocations: mockAllocations,
        resources,
        volunteers,
        tasks,
      });
      setOverview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }

  const statItems = overview ? [
    { label: "Total Allocations", value: overview.total_allocations, color: "bg-orange-500" },
    { label: "Resources Allocated", value: overview.resources_allocated, color: "bg-blue-500" },
    { label: "Volunteers Assigned", value: overview.volunteers_assigned, color: "bg-green-500" },
    { label: "Pending Requests", value: overview.pending_requests, color: "bg-yellow-500" },
    { label: "Critical Reports", value: overview.critical_reports, color: "bg-red-500" },
    { label: "Efficiency Score", value: `${overview.efficiency_score}%`, color: "bg-purple-500" },
  ] : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-orange-200 overflow-hidden">
      <button
        onClick={() => { setOpen(v => !v); if (!open && !overview && !loading) load(); }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-orange-50/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <Sparkles size={16} />
          </span>
          <div className="text-left">
            <p className="font-bold text-gray-800 text-sm">AI Allocation Overview</p>
            <p className="text-[11px] text-gray-500">Gemini-powered platform monitoring & recommendations</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wide">GEMINI</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <div className="h-px bg-orange-100" />

              {loading && (
                <div className="flex items-center justify-center py-8 gap-3 text-orange-500">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm font-semibold">Gemini is analyzing platform data…</span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {overview && !loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {statItems.map(s => (
                      <div key={s.label} className="rounded-xl p-3 border border-orange-50 bg-orange-50/40">
                        <p className="text-xl font-black text-gray-900">{s.value}</p>
                        <p className="text-[11px] font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {overview.summary && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-[11px] font-semibold text-gray-600">{overview.summary}</p>
                    </div>
                  )}

                  {overview.alerts.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">⚠️ Alerts</p>
                      <div className="space-y-1.5">
                        {overview.alerts.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
                            <AlertCircle size={12} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {overview.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">✅ Recommendations</p>
                      <div className="space-y-1.5">
                        {overview.recommendations.map((r, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-green-50 border border-green-100">
                            <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-green-700">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={load}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-orange-300 text-orange-600 text-xs font-bold hover:bg-orange-50"
                    >
                      <RefreshCw size={13} /> Re-run Analysis
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200"
                    >
                      <CheckCircle2 size={13} /> Approve All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100"
                    >
                      <XCircle size={13} /> Reject All
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
