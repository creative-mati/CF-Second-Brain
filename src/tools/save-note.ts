import { classify, extractTitle } from "../utils/classifier.js";
import { saveDecision } from "./save-decision.js";
import { saveTask } from "./save-task.js";
import { saveMeeting } from "./save-meeting.js";

export interface SaveNoteParams {
  content: string;
}

export function saveNote(params: SaveNoteParams): string {
  const { content } = params;
  const classification = classify(content);
  const title = extractTitle(content);

  let result: string;

  switch (classification.type) {
    case "decision":
      result = saveDecision({
        title,
        content,
        domain: [],
        participants: [],
      });
      break;

    case "meeting":
      result = saveMeeting({
        title,
        content,
        attendees: [],
      });
      break;

    case "task":
    default:
      result = saveTask({
        title,
        content,
      });
      break;
  }

  // Parse and enrich response with classification info
  const parsed = JSON.parse(result);
  parsed.classified_as = classification.type;
  parsed.confidence = classification.confidence;
  parsed.message = `[Auto-classified as ${classification.type}] ${parsed.message}`;

  return JSON.stringify(parsed);
}
