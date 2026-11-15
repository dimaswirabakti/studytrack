import { GoogleGenAI } from "@google/genai";
import { env } from "../config.js";
import {
  buildPlanPrompt,
  parsePlan,
  studyPlanJsonSchema,
  SYSTEM_INSTRUCTION,
} from "./study-plan.js";
import type { PlanInput, StudyPlan } from "./study-plan.js";

export interface PlanGenerator {
  model: string;
  generate: (input: PlanInput) => Promise<StudyPlan>;
}

// batas waktu panggilan model supaya request tidak menggantung terlalu lama
const REQUEST_TIMEOUT_MS = 20_000;

function createGeminiPlanGenerator(apiKey: string, model: string): PlanGenerator {
  // structured output dengan json schema didokumentasikan pada endpoint v1beta
  const client = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  return {
    model,
    generate: async (input) => {
      const response = await client.models.generateContent({
        model,
        contents: buildPlanPrompt(input),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseJsonSchema: studyPlanJsonSchema,
          temperature: 0.4,
          httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        },
      });
      return parsePlan(response.text);
    },
  };
}

// bernilai null jika api key tidak diatur sehingga fitur ai otomatis nonaktif
export const planGenerator: PlanGenerator | null = env.GEMINI_API_KEY
  ? createGeminiPlanGenerator(env.GEMINI_API_KEY, env.GEMINI_MODEL)
  : null;
