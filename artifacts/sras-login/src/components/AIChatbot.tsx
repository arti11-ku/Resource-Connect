import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { chatbotReply, getQuickReplies, type ChatContext, type ChatReply } from "../lib/ai";

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
  bullets?: string[];
}

interface Props {
  context: ChatContext;
}

// Floating, rule-based AI assistant. Anchored bottom-right, never touches
// surrounding layout.
export default function AIChatbot({ context }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: `Hi${context.username ? " " + context.username : ""}! I'm SAHARA AI — here to help with tasks and quick answers.`,
      bullets: getQuickReplies(context.role),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages]);

  function send(raw: string) {
    const text = raw.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now(), from: "user", text };
    const reply: ChatReply = chatbotReply(text, context);
    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      from: "bot",
      text: reply.text,
      bullets: reply.bullets,
    };
    setMessages(m => [...m, userMsg, botMsg]);
    setInput("");
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Open SAHARA AI chat"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-300 border-2 border-white flex items-center justify-center">
            <Sparkles size={9} className="text-orange-700" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-5 z-50 w-[22rem] max-w-[calc(100vw-2rem)] h-[28rem] bg-white rounded-2xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden"
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
                <p className="text-xs text-orange-50">Smart help for {context.role}s</p>
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
                <div
                  key={m.id}
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
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
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
                </div>
              ))}
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                send(input);
              }}
              className="px-3 py-3 border-t border-orange-100 bg-white flex items-center gap-2"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 px-3 py-2 rounded-xl border border-orange-200 text-xs focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <button
                type="submit"
                aria-label="Send"
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #FF7A00, #FF9A40)" }}
                disabled={!input.trim()}
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
