import { NextRequest, NextResponse } from "next/server";
import type { Question } from "@/lib/types";

// ============================================================
// Trivia Knights — Gemini Question Generator
// ------------------------------------------------------------
// Per Google's own 404 error message, new free-tier users
// should use `gemini-3.5-flash-lite` (or the fallback chain
// below). All the 2.5/2.0 models have been retired for new
// accounts. We use a 4-step fallback chain so the game
// keeps working even if one model is rate-limited.
//
// The prompt is deliberately concise + uses a one-line JSON
// shape in the instructions (instead of responseSchema) so
// the model doesn't waste tokens on schema overhead and
// never truncates mid-answer.
// ============================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const MODELS = [
  "gemini-3.5-flash-lite", // primary — Google's recommended new free-tier model
  "gemini-3.1-flash-lite", // secondary — cheaper alt
  "gemini-3.8-flash",      // tertiary — slightly higher quality
  "gemini-2.5-flash",      // last-resort legacy (works for some users)
];

function buildPrompt(category: string, difficulty: number): string {
  const tier =
    difficulty <= 2
      ? "easy / beginner"
      : difficulty <= 4
      ? "intermediate"
      : difficulty <= 7
      ? "advanced"
      : "expert / doctoral";

  return `Trivia RPG. Category: ${category}. Difficulty: ${difficulty}/10 (${tier}).
Return ONE valid JSON object and NOTHING else (no prose, no markdown, no code fences).

Required JSON shape:
{"q":"<question <=22 words>","c":["<choice1>","<choice2>","<choice3>","<choice4>"],"a":<0-3>,"e":"<one-sentence explanation>","t":"<short topic tag>"}

Rules: exactly 4 choices, only ONE correct, factually accurate, no current events, no adult content, the correct answer must be plausibly confused with the others.`;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message: string; code?: number; status?: string };
}

// Map our short prompt keys back to the question shape the frontend expects.
function normalize(parsed: any) {
  return {
    question: typeof parsed.q === "string" ? parsed.q : parsed.question,
    choices: Array.isArray(parsed.c) ? parsed.c : parsed.choices,
    answerIndex: typeof parsed.a === "number" ? parsed.a : parsed.answerIndex,
    explanation: typeof parsed.e === "string" ? parsed.e : parsed.explanation ?? "",
    topic: typeof parsed.t === "string" ? parsed.t : parsed.topic ?? "",
  };
}

function safeParseQuestion(
  text: string
): Pick<Question, "question" | "choices" | "answerIndex" | "explanation" | "topic"> | null {
  // Strip code fences if present.
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  // First try: direct JSON.parse
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Second try: extract the first {...} block in case of prose wrapping
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      parsed = JSON.parse(m[0]);
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== "object") return null;

  // Accept BOTH the long-form keys (q/c/a/e/t) AND the original (question/choices/answerIndex/explanation/topic)
  const n = normalize(parsed);

  if (
    typeof n.question !== "string" ||
    n.question.trim() === "" ||
    !Array.isArray(n.choices) ||
    n.choices.length !== 4 ||
    !n.choices.every((c: any) => typeof c === "string" && c.trim() !== "") ||
    typeof n.answerIndex !== "number"
  ) {
    return null;
  }

  const answerIndex = Math.max(0, Math.min(3, Math.floor(n.answerIndex)));

  return {
    question: n.question,
    choices: n.choices,
    answerIndex,
    explanation: n.explanation ?? "",
    topic: n.topic ?? "",
  };
}

async function callModel(
  apiKey: string,
  prompt: string,
  model: string
): Promise<{ ok: true; text: string; model: string } | { ok: false; status: number; body: string; model: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          // Generous token budget — with the short key names above
          // a full question fits in ~150 tokens, leaving plenty of
          // headroom to avoid truncation.
          maxOutputTokens: 1024,
          // Force JSON output. No responseSchema — that adds
          // overhead and the model sometimes truncates.
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    return { ok: false, status: 502, body: `network: ${(err as Error).message}`, model };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, status: res.status, body: body.slice(0, 600), model };
  }

  const data = (await res.json()) as GeminiResponse;
  if (data.error) {
    return { ok: false, status: 400, body: JSON.stringify(data.error), model };
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const reason = data.candidates?.[0]?.finishReason ?? "unknown";
    return { ok: false, status: 502, body: `empty response (finishReason=${reason})`, model };
  }
  return { ok: true, text, model };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured on the server. Add it to .env.local (dev) or the Vercel project environment variables (prod).",
      },
      { status: 500 }
    );
  }

  let body: { category?: string; difficulty?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const category = (body.category || "").toString().trim();
  const difficulty = Number.isFinite(body.difficulty)
    ? Math.max(1, Math.min(10, Number(body.difficulty)))
    : 1;

  if (!category) {
    return NextResponse.json(
      { error: "Missing required field: category" },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(category, difficulty);

  // Try each model in order.
  const attempts: Array<{ model: string; status: number; body: string }> = [];
  for (const model of MODELS) {
    const result = await callModel(apiKey, prompt, model);
    if (result.ok) {
      const parsed = safeParseQuestion(result.text);
      if (parsed) {
        const damage = 10 + difficulty * 4;
        return NextResponse.json(
          {
            question: parsed.question,
            choices: parsed.choices,
            answerIndex: parsed.answerIndex,
            explanation: parsed.explanation ?? "",
            topic: parsed.topic || category,
            category,
            difficulty,
            damage,
            model: result.model,
          },
          {
            status: 200,
            headers: { "Cache-Control": "no-store, must-revalidate" },
          }
        );
      }
      attempts.push({ model, status: 200, body: "malformed JSON: " + result.text.slice(0, 200) });
      console.warn(`[${model}] returned non-conforming JSON:`, result.text.slice(0, 200));
      continue;
    }
    attempts.push({ model, status: result.status, body: result.body });
    console.warn(`[${model}] HTTP ${result.status}: ${result.body.slice(0, 200)}`);
  }

  return NextResponse.json(
    {
      error:
        "All Gemini models failed. The most common cause is an invalid, expired, or out-of-tier API key. Create a fresh key at https://aistudio.google.com/app/apikey and ensure the Generative Language API is enabled for your project.",
      attempts,
    },
    { status: 502 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Method not allowed. Use POST with JSON body { category, difficulty }.",
    },
    { status: 405, headers: { Allow: "POST" } }
  );
}

