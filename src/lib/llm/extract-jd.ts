import { getOpenAIClient } from "./openai-client";
import { JD_EXTRACTION_PROMPT, JD_EXTRACTION_SYSTEM_PROMPT } from "./prompts";
import { JDExtractSchema } from "./schemas";
import type { JDExtract } from "@/lib/types/jd";

const EXTRACTION_MODEL = "gpt-4o-mini"; // Fast, low-cost for initial extraction

export async function extractJD(jdText: string): Promise<JDExtract> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: EXTRACTION_MODEL,
    messages: [
      { role: "system", content: JD_EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: `${JD_EXTRACTION_PROMPT}\n\nJob Description:\n${jdText}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to extract JD: No response from OpenAI");
  }

  const parsed = JSON.parse(content);

  // Validate with Zod
  const result = JDExtractSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`JD extraction validation failed: ${result.error.message}`);
  }

  return result.data;
}
