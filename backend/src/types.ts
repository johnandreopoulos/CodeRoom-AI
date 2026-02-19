export type CursorPosition = {
  lineNumber: number;
  column: number;
};

export type UserPresence = {
  socketId: string;
  nickname: string;
  cursor?: CursorPosition;
};

export type RoomState = {
  code: string;
  language: "javascript" | "typescript";
  users: Map<string, UserPresence>;
};

export type AiAction =
  | "explain"
  | "refactor"
  | "detect-bugs"
  | "generate-tests"
  | "compare"
  | "summarize-diff";
