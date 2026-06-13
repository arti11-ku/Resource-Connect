import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { geminiRecommendTasks, type GeminiRecommendation } from "../lib/geminiApi";

const ORANGE = "#FF7A00";
const ORANGE_LIGHT = "#FF9A40";

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};

interface Task {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
  skills?: string[];
  location?: string;
  urgency?: string;
}

interface Props {
  volunteer: {
    name: string;
    skills: string[];
    location?: string;
    pastCategories?: string[];
  };
  tasks: Task[];
  onAccept?: (taskId: string | number) => void;
}

export default function AIVolunteerRecommendations({ volunteer, tasks, onAccept }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recs, setRecs] = useState<GeminiRecommendation[] | null>(null);
  const [accepted, setAccepted] = useState<Set<string | number>>(new Set());

  const taskMap = new Map(tasks.map(t => [String(t.id), t]));

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const results = await geminiRecommendTasks(volunteer, tasks);
      setRecs(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recommendation failed");
    } finally {
      setLoading(false);
    }
  }

  function handleAccept(taskId: string | number) {
    setAccepted(prev => new Set([...prev, taskId]));
    if (onAccept) onAccept(taskId);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-orange-200 overflow-hidden">
      <button
        onClick={() => { setOpen(v => !v); if (!open && !recs && !loading) load(); }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-orange-50/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <Sparkles size={16} />
          </span>
          <div className="text-left">
            <p className="font-bold text-gray-800 text-sm">AI Recommended Tasks</p>
            <p className="text-[11px] text-gray-500">Gemini matches tasks to your skills & location</p>
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

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                <span className="font-semibold text-gray-700">{volunteer.name}</span> ·
                Skills: <span className="font-semibold text-gray-700">{volunteer.skills.join(", ")}</span>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-6 gap-3 text-orange-500">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm font-semibold">Gemini is matching tasks for you…</span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {recs && !loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {recs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No matching tasks found right now.</p>
                  ) : (
                    recs.map((rec, i) => {
                      const task = taskMap.get(String(rec.task_id));
                      const isAccepted = accepted.has(rec.task_id);
                      const pc = PRIORITY_COLORS[rec.priority] ?? PRIORITY_COLORS["Medium"];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className={`p-4 rounded-xl border transition-all ${isAccepted ? "bg-green-50 border-green-200" : "bg-orange-50/40 border-orange-100 hover:border-orange-200"}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{task?.title ?? `Task #${rec.task_id}`}</p>
                              {task?.location && <p className="text-[11px] text-gray-400 mt-0.5">📍 {task.location}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">{rec.match_score}% match</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pc}`}>{rec.priority}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-orange-600 font-medium mb-3">💡 {rec.reason}</p>

                          {task?.skills && task.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {task.skills.map(s => (
                                <span key={s} className="px-2 py-0.5 rounded-full bg-white border border-orange-200 text-orange-700 text-[10px] font-medium">{s}</span>
                              ))}
                            </div>
                          )}

                          {isAccepted ? (
                            <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                              <CheckCircle2 size={13} /> Task Accepted
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                              onClick={() => handleAccept(rec.task_id)}
                              className="px-4 py-2 rounded-xl text-white text-xs font-bold"
                              style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}
                            >
                              Accept Task
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={load}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-orange-200 text-orange-600 text-xs font-semibold hover:bg-orange-50"
                  >
                    <RefreshCw size={13} /> Refresh Recommendations
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
