import { getOpenAIClient } from "./openai-client";
import { CV_EXTRACTION_PROMPT, CV_EXTRACTION_SYSTEM_PROMPT } from "./prompts";
import { CVExtractSchema } from "./schemas";
import type { CVExtract } from "@/lib/types/cv";

const EXTRACTION_MODEL = "gpt-4o-mini";

export async function extractCV(cvText: string): Promise<CVExtract> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: EXTRACTION_MODEL,
    messages: [
      { role: "system", content: CV_EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: `${CV_EXTRACTION_PROMPT}\n\nCV Text:\n${cvText}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to extract CV: No response from OpenAI");
  }

  const parsed = JSON.parse(content);

  const result = CVExtractSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`CV extraction validation failed: ${result.error.message}`);
  }

  return result.data;
}
