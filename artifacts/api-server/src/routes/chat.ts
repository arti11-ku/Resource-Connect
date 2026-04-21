import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are SAHARA AI, a friendly and concise assistant inside the SAHARA Smart Resource Allocation System — an NGO platform that connects volunteers, reporters, NGOs, donors, and admins to manage humanitarian tasks (disaster relief, healthcare, education, food distribution, etc.).

Your job is to help users with:
- How to report issues (Reporters use the "Issues" tab → "Flag Issue" → pick task, type, describe, optionally attach a file or pin a location on the map).
- How to use the dashboard for their role (Volunteer / Reporter / NGO / Donor / Admin).
- Suggesting concrete resource-allocation actions (e.g. reassign volunteers, escalate delays, prioritize medical/disaster tasks).
- Quick guidance on tasks, proofs, donations, and approvals.

Style rules:
- Keep replies short — 2-5 sentences or a tight bullet list.
- Be warm but professional. No emojis unless the user uses one first.
- If unsure, ask one clarifying question instead of guessing.
- Never invent user data, names, or numbers — speak about the system in general terms.`;

interface ChatMsg { role: "user" | "model"; text: string }

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY ?? "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL ?? "",
  },
});

router.post("/chat", async (req, res) => {
  try {
    if (!process.env.AI_INTEGRATIONS_GEMINI_BASE_URL) {
      res.status(500).json({ error: "Gemini integration not configured" });
      return;
    }

    const body = req.body as { messages?: ChatMsg[]; role?: string; username?: string };
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    if (messages.length === 0) {
      res.status(400).json({ error: "messages required" });
      return;
    }

    const contextLine = `Current user role: ${body.role ?? "unknown"}${body.username ? ` (name: ${body.username})` : ""}.`;

    const contents = messages.map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String(m.text ?? "") }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\n${contextLine}`,
        temperature: 0.6,
        maxOutputTokens: 8192,
      },
    });

    const text = (response.text ?? "").trim();
    res.json({ text: text || "I'm here, but I couldn't generate a response. Try rephrasing?" });
  } catch (err) {
    res.status(500).json({ error: "internal", detail: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
