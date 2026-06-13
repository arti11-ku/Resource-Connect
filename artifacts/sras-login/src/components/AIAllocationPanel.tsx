import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, CheckCircle2, Edit3, AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { geminiAllocate, type GeminiAllocation, type GeminiAllocateInput } from "../lib/geminiApi";

const ORANGE = "#FF7A00";
const ORANGE_LIGHT = "#FF9A40";

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Critical: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  High: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  Medium: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  Low: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
};

interface Report {
  type: string;
  affected_people: number;
  severity: string;
  location?: string;
}

interface Resource {
  name: string;
  quantity: number;
  unit?: string;
}

interface Volunteer {
  name: string;
  skills: string[];
  availability?: string;
  location?: string;
}

interface Props {
  defaultReport?: Partial<Report>;
  resources: Resource[];
  volunteers: Volunteer[];
  onApprove?: (allocation: GeminiAllocation) => void;
}

export default function AIAllocationPanel({ defaultReport, resources, volunteers, onApprove }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeminiAllocation | null>(null);
  const [approved, setApproved] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [report, setReport] = useState<Report>({
    type: defaultReport?.type ?? "Flood",
    affected_people: defaultReport?.affected_people ?? 250,
    severity: defaultReport?.severity ?? "High",
    location: defaultReport?.location ?? "Mumbai, Maharashtra",
  });

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setApproved(false);
    try {
      const input: GeminiAllocateInput = { report, resources, volunteers };
      const allocation = await geminiAllocate(input);
      setResult(allocation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI allocation failed");
    } finally {
      setLoading(false);
    }
  }

  function handleApprove() {
    if (result && onApprove) onApprove(result);
    setApproved(true);
  }

  const pc = result ? (PRIORITY_COLORS[result.priority] ?? PRIORITY_COLORS["Medium"]) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-orange-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-orange-50/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}>
            <Sparkles size={16} />
          </span>
          <div className="text-left">
            <p className="font-bold text-gray-800 text-sm">AI Allocation Assistant</p>
            <p className="text-[11px] text-gray-500">Gemini-powered resource & volunteer matching</p>
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

              <button
                onClick={() => setShowForm(v => !v)}
                className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1"
              >
                <Edit3 size={12} /> {showForm ? "Hide" : "Customize"} report details
              </button>

              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-2 gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100"
                  >
                    {[
                      { label: "Disaster Type", key: "type", placeholder: "Flood, Fire, Earthquake…" },
                      { label: "Location", key: "location", placeholder: "City, State" },
                      { label: "Severity", key: "severity", placeholder: "Low / Medium / High / Critical" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                        <input
                          value={(report as Record<string, string | number>)[key] as string}
                          onChange={e => setReport(r => ({ ...r, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none focus:border-orange-400 bg-white"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Affected People</label>
                      <input
                        type="number"
                        value={report.affected_people}
                        onChange={e => setReport(r => ({ ...r, affected_people: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none focus:border-orange-400 bg-white"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                <span className="font-semibold text-gray-700">{resources.length}</span> resources ·
                <span className="font-semibold text-gray-700">{volunteers.length}</span> volunteers available
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={generate}
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Generating AI Plan…</>
                ) : (
                  <><Sparkles size={16} /> Generate AI Allocation Plan</>
                )}
              </motion.button>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <AnimatePresence>
                {result && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${pc?.border} ${pc?.bg}`}>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wide ${pc?.text}`}>Priority: {result.priority}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{result.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${pc?.text}`}>{result.priority_score}</p>
                        <p className="text-[10px] text-gray-400">score /100</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Suggested Resources</p>
                      <div className="space-y-2">
                        {result.resources.map((r, i) => (
                          <div key={i} className="flex items-start justify-between gap-2 p-3 rounded-xl bg-orange-50 border border-orange-100">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800">{r.resource}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">💡 {r.reason}</p>
                            </div>
                            <span className="shrink-0 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">{r.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Suggested Volunteers</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.volunteers.map((v, i) => (
                          <div key={i} className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {v.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{v.name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{v.reason}</p>
                              <p className="text-[11px] font-bold text-blue-600 mt-0.5">{v.match_score}% match</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-[11px] font-semibold text-gray-600">{result.summary}</p>
                    </div>

                    <div className="flex gap-3 pt-1">
                      {!approved ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={handleApprove}
                            className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle2 size={15} /> Approve Allocation
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={generate}
                            className="flex-1 py-2.5 rounded-xl border border-orange-300 text-orange-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-50"
                          >
                            <Edit3 size={15} /> Modify / Re-run
                          </motion.button>
                        </>
                      ) : (
                        <div className="flex-1 py-2.5 rounded-xl bg-green-100 border border-green-300 text-green-700 font-bold text-sm flex items-center justify-center gap-2">
                          <CheckCircle2 size={15} /> Allocation Approved
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
