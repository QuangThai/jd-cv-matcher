import { getOpenAIClient } from "./openai-client";
import type { MatchReport } from "../types/match";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/** Build the system prompt from full analysis context */
export function buildChatSystemPrompt(report: MatchReport): string {
  const { jdSummary, candidateOverview, candidateAnalyses, candidateRanking, finalRecommendation } = report;

  const sections: string[] = [
    `You are Ask Atlas, an AI recruitment assistant embedded in the Atlas Match screening tool. Your role is to help recruiters understand analysis results by answering questions using ONLY the evidence provided below. Never invent or assume facts not present in the analysis data.`,

    `## Job Description`,
    `**Title:** ${jdSummary.jobTitle ?? "N/A"}`,
    `**Seniority:** ${jdSummary.seniorityLevel ?? "N/A"}`,
    `**Experience:** ${jdSummary.yearsOfExperience ?? "N/A"} years`,
    `**Required Skills:** ${jdSummary.requiredSkillCount}`,
    `**Preferred Skills:** ${jdSummary.preferredSkillCount}`,
    `**Summary:** ${jdSummary.summary}`,

    `## Candidates Overview`,
  ];

  for (const co of candidateOverview) {
    sections.push(`- **${co.candidateName ?? "Unknown"}**: Score ${co.matchScore}/100 — ${co.matchLevel} — ${co.recommendation}`);
  }

  sections.push(`\n## Detailed Candidate Analyses`);

  for (const ca of candidateAnalyses) {
    const name = ca.candidateName ?? "Unknown";
    sections.push(`\n### ${name} (ID: ${ca.candidateId})`);

    if (ca.matchedRequirements.length > 0) {
      sections.push(`**Matched Requirements:**`);
      for (const m of ca.matchedRequirements) {
        sections.push(`- [${m.priority}] ${m.requirement} — ${m.evidenceFromCV} (${m.explanation})`);
      }
    }

    if (ca.partiallyMatchedRequirements.length > 0) {
      sections.push(`**Partially Matched:**`);
      for (const p of ca.partiallyMatchedRequirements) {
        sections.push(`- [${p.priority}] ${p.requirement} — ${p.explanation}`);
      }
    }

    if (ca.missingRequirements.length > 0) {
      sections.push(`**Missing:**`);
      for (const m of ca.missingRequirements) {
        sections.push(`- [${m.priority}] ${m.requirement} — ${m.evidenceStatus}`);
      }
    }

    if (ca.weaknessesOrConcerns.length > 0) {
      sections.push(`**Concerns:**`);
      for (const w of ca.weaknessesOrConcerns) {
        sections.push(`- ${w}`);
      }
    }

    const sb = ca.scoreBreakdown;
    sections.push(
      `**Score Breakdown:** Skills=${sb.requiredSkills}, Experience=${sb.relevantExperience}, ` +
      `Tools=${sb.toolsAndPlatforms}, Seniority=${sb.seniorityAndYears}, ` +
      `Domain=${sb.domainKnowledge}, Education=${sb.educationAndCertifications}, ` +
      `Soft Skills=${sb.softSkillsAndLanguages}`
    );
    sections.push(`**Recruiter Summary:** ${ca.recruiterSummary}`);
  }

  sections.push(`\n## Ranking`);
  for (const r of candidateRanking) {
    sections.push(`**#${r.rank}** ${r.candidateName ?? "Unknown"} — Score ${r.matchScore}/100 — ${r.matchLevel} — ${r.recommendation}`);
    sections.push(`  Rationale: ${r.rationale}`);
  }

  sections.push(
    `\n## Final Recommendation`,
    `**Top Candidate:** ${finalRecommendation.topCandidateName ?? "N/A"} (Score: ${finalRecommendation.topCandidateScore}/100)`,
    `**Explanation:** ${finalRecommendation.explanation}`,
    `**Hiring Advice:** ${finalRecommendation.hiringAdvice}`
  );

  sections.push(
    `\n## Guidelines`,
    `1. Answer ONLY using the evidence provided in this context.`,
    `2. If the user asks something not covered by the data, say "I don't have that information in the analysis results."`,
    `3. Be concise but thorough. Use bullet points and tables when helpful.`,
    `4. When comparing candidates, cite specific scores and evidence.`,
    `5. Format responses in Markdown.`,
    `6. The user is a recruiter — use professional but accessible language.`,
  );

  return sections.join("\n");
}

/** Format messages for OpenAI chat completion */
export function buildChatMessages(
  systemPrompt: string,
  history: ChatMessage[],
  newMessage: string
): ChatMessage[] {
  return [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: newMessage },
  ];
}

/** Default suggested questions based on analysis context */
export function getSuggestedQuestions(report: MatchReport): string[] {
  const topCandidate = report.candidateRanking[0];
  const bottomCandidate = report.candidateRanking[report.candidateRanking.length - 1];
  const questions: string[] = [
    "Summarize the key findings",
    "What are the top strengths across all candidates?",
  ];

  if (topCandidate && bottomCandidate && topCandidate.candidateId !== bottomCandidate.candidateId) {
    questions.push(`Compare ${topCandidate.candidateName ?? "top"} and ${bottomCandidate.candidateName ?? "bottom"} candidates`);
  }

  for (const ca of report.candidateAnalyses) {
    if (ca.weaknessesOrConcerns.length > 0) {
      questions.push(`What are the main concerns about ${ca.candidateName ?? "candidate"}?`);
      break;
    }
  }

  questions.push("Which candidate has the best technical skills?");
  questions.push("Any red flags I should know about?");

  return questions.slice(0, 6);
}

/** Stream chat response from OpenAI */
export async function* streamChatResponse(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const openai = getOpenAIClient();

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages.map(({ role, content }) => ({ role, content })),
    stream: true,
    temperature: 0.3,
    max_tokens: 2048,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

/** Format SSE data string */
export function formatSSEData(data: string): string {
  return `data: ${JSON.stringify({ content: data })}\n\n`;
}

export function formatSSEEnd(): string {
  return `data: [DONE]\n\n`;
}

export function formatSSEError(error: string): string {
  return `data: ${JSON.stringify({ error })}\n\n`;
}
