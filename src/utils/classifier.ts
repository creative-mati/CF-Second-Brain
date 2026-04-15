/**
 * Auto-classify raw text into content types based on signal words.
 * Follows the classification signals from CLAUDE.md / capture-processing skill.
 */

export type Classification = "decision" | "task" | "meeting";

interface ClassificationResult {
  type: Classification;
  confidence: number;
}

const DECISION_SIGNALS = [
  /\b(decided|chose|went with|agreed on|the call is)\b/i,
  /\b(we're going with|settled on|picked|committed to)\b/i,
  /\b(after discussing.*we|the tradeoff is.*so we)\b/i,
  /\bover\b.*\b(because|since|due to)\b/i, // "X over Y because..."
];

const TASK_SIGNALS = [
  /\b(need to|should|todo|follow up|don't forget)\b/i,
  /\b(look into|investigate|we should probably|someone needs to)\b/i,
  /\b(waiting on|blocked by|once .+ happens)\b/i,
  /\b(tech debt|hack|temporary|revisit later)\b/i,
];

const MEETING_SIGNALS = [
  /\b(met with|standup|retro|sync|1:1|planning)\b/i,
  /\b(review meeting|kickoff|demo|post-mortem)\b/i,
  /\b(attendees|discussed|agenda)\b/i,
];

function scoreSignals(text: string, patterns: RegExp[]): number {
  let score = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) score++;
  }
  return score;
}

/**
 * Classify text into the most likely content type.
 * Returns the type with highest signal match count.
 * Falls back to "task" for ambiguous input (bias toward actionability).
 */
export function classify(text: string): ClassificationResult {
  const scores: [Classification, number][] = [
    ["decision", scoreSignals(text, DECISION_SIGNALS)],
    ["task", scoreSignals(text, TASK_SIGNALS)],
    ["meeting", scoreSignals(text, MEETING_SIGNALS)],
  ];

  scores.sort((a, b) => b[1] - a[1]);

  // If no clear signal, default to task (bias toward actionability)
  if (scores[0][1] === 0) {
    return { type: "task", confidence: 0 };
  }

  return { type: scores[0][0], confidence: scores[0][1] };
}

/**
 * Extract a title from raw text content.
 * Takes the first sentence or first N words, whichever is shorter.
 */
export function extractTitle(text: string, maxWords = 8): string {
  // Try first sentence
  const firstSentence = text.match(/^[^.!?\n]+/)?.[0]?.trim() ?? text.trim();

  const words = firstSentence.split(/\s+/);
  if (words.length <= maxWords) return firstSentence;

  return words.slice(0, maxWords).join(" ");
}
