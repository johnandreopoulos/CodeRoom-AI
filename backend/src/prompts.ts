import { AiAction } from "./types.js";

export const ACTION_PROMPTS: Record<AiAction, string> = {
  explain:
    "You are a senior engineer explaining code to a teammate. Explain clearly what this does, identify issues, and suggest improvements.",
  refactor:
    "You are reviewing a pull request. Improve readability, performance, and best practices while keeping functionality identical. Return only the improved code.",
  "detect-bugs":
    "You are a strict code reviewer. Identify bugs, edge cases, performance issues, and suggest fixes.",
  "generate-tests":
    "Generate comprehensive Jest unit tests for this code. Cover edge cases.",
  compare:
    "Compare the following two implementations. Explain differences, pros/cons, and which is better.",
  "summarize-diff": "Summarize the key differences between these two versions of code."
};
