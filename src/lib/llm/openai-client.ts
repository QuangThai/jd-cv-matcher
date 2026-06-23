import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. Please set it in your .env.local file."
      );
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

// Re-export for convenience
export { OpenAI };
