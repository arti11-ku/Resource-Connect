import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { getQuickReplies, type ChatContext } from "../lib/ai";
import { geminiChat, type GeminiMsg } from "../lib/chatApi";

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
  bullets?: string[];
}

interface Props {
  context: ChatContext;
}

// Floating Gemini-powered AI assistant. Anchored bottom-right, never touches
// surrounding layout. Falls back to a friendly message on network errors.
export default function AIChatbot({ context }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: `Hi${context.username ? " " + context.username : ""}! I'm SAHARA AI — powered by Gemini. Ask me anything about your dashboard or how to get things done.`,
      bullets: getQuickReplies(context.role),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }, [open, messages, sending]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = { id: Date.now(), from: "user", text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setSending(true);

    // Build chat history for the API (last 10 turns excluding the welcome bullets).
    const history: GeminiMsg[] = [...messages, userMsg]
      .filter(m => m.id !== 1) // skip the static welcome
      .slice(-10)
      .map(m => ({ role: m.from === "user" ? "user" : "model", text: m.text }));
    if (history.length === 0 || history[history.length - 1].role !== "user") {
      history.push({ role: "user", text });
    }

    try {
      const reply = await geminiChat({
        messages: history,
        role: context.role,
        username: context.username,
      });
      setMessages(m => [...m, {
        id: Date.now() + 1,
        from: "bot",
        text: reply || "I'm here — could you rephrase that?",
      }]);
    } catch (err) {
      setMessages(m => [...m, {
        id: Date.now() + 1,
        from: "bot",
        text: "I couldn't reach the AI service just now. Please try again in a moment.",
      }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08, rotate: open ? 0 : 6 }}
        whileTap={{ scale: 0.92 }}
        animate={{ boxShadow: open ? "0 8px 24px rgba(255,122,0,0.35)" : "0 6px 18px rgba(255,122,0,0.45)" }}
        aria-label="Open SAHARA AI chat"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full text-white flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "msg"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex"
          >
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-300 border-2 border-white flex items-center justify-center">
            <Sparkles size={9} className="text-orange-700" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-24 right-5 z-50 w-[22rem] max-w-[calc(100vw-2rem)] h-[30rem] rounded-2xl flex flex-col overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,154,64,0.25)",
              boxShadow: "0 20px 50px rgba(255,122,0,0.18), 0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="px-4 py-3 text-white flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">SAHARA AI Assistant</p>
                <p className="text-xs text-orange-50">Smart help for {context.role}s · Gemini</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-orange-50/30">
              {messages.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      m.from === "user"
                        ? "text-white rounded-br-md"
                        : "bg-white text-gray-700 border border-orange-100 rounded-bl-md"
                    }`}
                    style={
                      m.from === "user"
                        ? { background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }
                        : {}
                    }
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.bullets && m.bullets.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.bullets.map((b, i) => (
                          <button
                            key={i}
                            onClick={() => send(b)}
                            disabled={sending}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                              m.from === "user"
                                ? "bg-white/20 text-white hover:bg-white/30"
                                : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-orange-100 rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-orange-400"
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                send(input);
              }}
              className="px-3 py-3 border-t border-orange-100 bg-white/80 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={sending ? "SAHARA AI is thinking…" : "Ask anything…"}
                disabled={sending}
                className="flex-1 px-3 py-2 rounded-xl border border-orange-200 text-xs focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
              <motion.button
                type="submit"
                aria-label="Send"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
                disabled={!input.trim() || sending}
              >
                <Send size={14} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
