/**
 * AI Client — Unified interface for Groq and Google Gemini
 * 
 * Tries Groq first (faster, free tier), falls back to Google Gemini.
 * Both are configured via environment variables:
 * - GROQ_API_KEY → Groq Cloud
 * - GEMINI_API_KEY → Google Gemini
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

interface AIResponse {
  text: string;
  provider: "groq" | "gemini" | "none";
}

/**
 * Generate a completion using Groq (Llama) or Google Gemini
 */
export async function generateCompletion(
  prompt: string,
  systemPrompt?: string
): Promise<AIResponse> {
  // Try Groq first
  if (GROQ_API_KEY) {
    try {
      return await generateGroqCompletion(prompt, systemPrompt);
    } catch (error: unknown) {
      console.warn("Groq failed, falling back to Gemini:", error);
    }
  }

  // Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      return await generateGeminiCompletion(prompt, systemPrompt);
    } catch (error: unknown) {
      console.error("Gemini also failed:", error);
    }
  }

  return { text: "", provider: "none" };
}

async function generateGroqCompletion(
  prompt: string,
  systemPrompt?: string
): Promise<AIResponse> {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || "",
    provider: "groq",
  };
}

async function generateGeminiCompletion(
  prompt: string,
  systemPrompt?: string
): Promise<AIResponse> {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return { text, provider: "gemini" };
}

/**
 * Parse natural language into appointment fields
 */
export async function parseNaturalLanguageAppointment(text: string): Promise<{
  title: string;
  start: string;
  end: string;
  location?: string;
  notes?: string;
  suggestedCategory?: string;
  suggestedPatient?: string;
}> {
  const now = new Date().toISOString();
  const systemPrompt = `You are an appointment scheduling assistant. Parse the user's natural language input into structured appointment data. 

Current date/time: ${now}

Respond with ONLY valid JSON (no markdown, no code blocks), with these fields:
- title (string, required)
- start (ISO 8601 datetime string, required)
- end (ISO 8601 datetime string, required — default 1 hour after start if not specified)
- location (string, optional)
- notes (string, optional)
- suggestedCategory (string, optional — one of: "checkup", "consultation", "surgery", "follow-up", "emergency", "other")
- suggestedPatient (string, optional — patient name if mentioned)`;

  const result = await generateCompletion(text, systemPrompt);

  try {
    const parsed = JSON.parse(result.text.trim());
    return {
      title: parsed.title || text,
      start: parsed.start || new Date().toISOString(),
      end: parsed.end || new Date(Date.now() + 3600000).toISOString(),
      location: parsed.location,
      notes: parsed.notes,
      suggestedCategory: parsed.suggestedCategory,
      suggestedPatient: parsed.suggestedPatient,
    };
  } catch {
    // If AI fails to return valid JSON, return a basic appointment
    return {
      title: text,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
    };
  }
}

/**
 * Summarize appointment notes/activities
 */
export async function summarizeAppointmentNotes(notes: string, activities?: string[]): Promise<string> {
  const context = activities?.length
    ? `Notes:\n${notes}\n\nActivities:\n${activities.join("\n")}`
    : notes;

  const systemPrompt = "You are a medical appointment assistant. Summarize the following appointment notes concisely in 2-3 sentences. Focus on key findings, actions taken, and follow-up needed.";

  const result = await generateCompletion(context, systemPrompt);
  return result.text || "Unable to generate summary.";
}

/**
 * Suggest a category for an appointment based on its title and notes
 */
export async function suggestCategory(
  title: string,
  notes?: string,
  availableCategories?: string[]
): Promise<string> {
  const systemPrompt = `You are a medical appointment assistant. Given an appointment title and optional notes, suggest the most appropriate category. ${
    availableCategories?.length
      ? `Available categories: ${availableCategories.join(", ")}. Respond with ONLY the category name, nothing else.`
      : "Respond with a short category name (1-2 words), nothing else."
  }`;

  const prompt = `Title: ${title}${notes ? `\nNotes: ${notes}` : ""}`;
  const result = await generateCompletion(prompt, systemPrompt);
  return result.text.trim() || "Other";
}
