// Provider order: Gemini first, OpenAI second, local keyword matching last.
// API keys remain on the backend and are never sent to the React client.
const { assess: keywordAssess } = require("../utils/skillMatcher");

function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

const assessmentSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "integer" },
    atsScore: { type: "integer" },
    matchedSkills: { type: "array", items: { type: "string" } },
    missingSkills: { type: "array", items: { type: "string" } },
    resumeSkills: { type: "array", items: { type: "string" } },
    requiredSkills: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    careerRoles: { type: "array", items: { type: "string" } },
    interviewQuestions: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
  },
  required: [
    "score",
    "atsScore",
    "matchedSkills",
    "missingSkills",
    "resumeSkills",
    "requiredSkills",
    "suggestions",
    "strengths",
    "weaknesses",
    "recommendations",
    "careerRoles",
    "interviewQuestions",
    "summary",
  ],
};

function buildPrompt(resumeText, jobDescription) {
  return `
You are a careful, evidence-based career assessment assistant. Compare the resume with the
job description. Use only evidence in the supplied text. Do not invent qualifications,
employment, degrees, achievements, or skills. Do not make hiring decisions or predict hiring.

Return one JSON object matching the requested schema.
- score: integer 0-100, estimated job-skill alignment, NOT hiring probability.
- atsScore: integer 0-100, heuristic estimate from extracted text only. You cannot reliably
  assess visual layout from plain extracted text; mention this limitation in suggestions.
- matchedSkills must be supported by resume evidence and relevant to the job.
- missingSkills means requirements not clearly evidenced, not proof the candidate lacks them.
- Suggestions must be practical and truthful. Never tell candidates to claim skills they do not have.
- careerRoles: up to 5 related role titles.
- interviewQuestions: up to 5 role-relevant questions.
- Keep feedback concise and specific.

RESUME TEXT:
${String(resumeText || "").slice(0, 18000)}

JOB DESCRIPTION:
${String(jobDescription || "").slice(0, 12000)}
`;
}

async function callGemini(resumeText, jobDescription) {
  if (!process.env.GEMINI_API_KEY) throw new Error("Gemini is not configured.");

  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const interaction = await ai.interactions.create({
    model,
    input: buildPrompt(resumeText, jobDescription),
    store: false,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: {
        type: "object",
        properties: assessmentSchema.properties,
        required: assessmentSchema.required,
      },
    },
  });

  if (!interaction?.output_text)
    throw new Error("Gemini returned an empty response.");
  return JSON.parse(interaction.output_text);
}

async function callOpenAI(resumeText, jobDescription) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI is not configured.");

  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
    maxRetries: 1,
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
    instructions:
      "You are a careful, evidence-based career assessment assistant. Follow the assessment instructions exactly.",
    input: buildPrompt(resumeText, jobDescription),
    text: {
      format: {
        type: "json_schema",
        name: "career_assessment",
        strict: true,
        schema: assessmentSchema,
      },
    },
    store: false,
  });

  if (!response.output_text)
    throw new Error("OpenAI returned an empty response.");
  return JSON.parse(response.output_text);
}

function normalizeResult(result, resumeText, jobDescription, provider) {
  const baseline = keywordAssess(resumeText, jobDescription);
  const matchedSkills = cleanStringArray(result.matchedSkills);
  const missingSkills = cleanStringArray(result.missingSkills);
  const resumeSkills = cleanStringArray(result.resumeSkills);
  const requiredSkills = cleanStringArray(result.requiredSkills);
  const suggestions = cleanStringArray(result.suggestions);

  return {
    score: clampScore(result.score),
    atsScore: clampScore(result.atsScore),
    matchedSkills: matchedSkills.length
      ? matchedSkills
      : baseline.matchedSkills,
    missingSkills: missingSkills.length
      ? missingSkills
      : baseline.missingSkills,
    resumeSkills: resumeSkills.length ? resumeSkills : baseline.resumeSkills,
    requiredSkills: requiredSkills.length
      ? requiredSkills
      : baseline.requiredSkills,
    suggestions: suggestions.length ? suggestions : baseline.suggestions,
    strengths: cleanStringArray(result.strengths),
    weaknesses: cleanStringArray(result.weaknesses),
    recommendations: cleanStringArray(result.recommendations),
    careerRoles: cleanStringArray(result.careerRoles),
    interviewQuestions: cleanStringArray(result.interviewQuestions),
    summary:
      typeof result.summary === "string" && result.summary.trim()
        ? result.summary.trim()
        : baseline.summary,
    aiProvider: provider,
  };
}

function buildKeywordFallback(resumeText, jobDescription) {
  const baseline = keywordAssess(resumeText, jobDescription);
  return {
    ...baseline,
    atsScore: 0,
    strengths: [],
    weaknesses: [],
    recommendations: [
      "AI providers are temporarily unavailable. This result uses keyword matching only.",
    ],
    careerRoles: [],
    interviewQuestions: [],
    summary:
      "Gemini and OpenAI were unavailable. This assessment uses keyword-based matching.",
    aiProvider: "keyword_fallback",
  };
}

async function analyzeResume(resumeText, jobDescription) {
  const failures = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await callGemini(resumeText, jobDescription);
      console.log("Assessment provider: Gemini");
      return normalizeResult(result, resumeText, jobDescription, "gemini");
    } catch (error) {
      failures.push(`Gemini: ${error.message}`);
      console.error("GEMINI ERROR:", error.message);
      console.warn("Trying OpenAI...");
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await callOpenAI(resumeText, jobDescription);
      console.log("Assessment provider: OpenAI");
      return normalizeResult(result, resumeText, jobDescription, "openai");
    } catch (error) {
      failures.push(`OpenAI: ${error.message}`);
      console.error("OPENAI ERROR:", error.message);
      console.warn("Using keyword fallback...");
    }
  }

  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    console.warn("No AI provider keys configured; using keyword fallback.");
  } else if (failures.length) {
    console.warn(`AI provider errors: ${failures.join(" | ")}`);
  }

  return buildKeywordFallback(resumeText, jobDescription);
}

module.exports = analyzeResume;
