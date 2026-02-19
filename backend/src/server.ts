import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import OpenAI from "openai";
import { Server } from "socket.io";
import { ACTION_PROMPTS } from "./prompts.js";
import { AiAction, CursorPosition, RoomState, UserPresence } from "./types.js";

const PORT = Number(process.env.BACKEND_PORT || 4000);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, methods: ["GET", "POST"] }
});

const rooms = new Map<string, RoomState>();

function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: "// Welcome to CodeRoom AI\nfunction hello(name) {\n  return `Hello, ${name}!`;\n}\n",
      language: "javascript",
      users: new Map<string, UserPresence>()
    });
  }

  return rooms.get(roomId)!;
}

function emitRoomState(roomId: string): void {
  const room = getOrCreateRoom(roomId);
  io.to(roomId).emit("room:state", {
    code: room.code,
    language: room.language,
    users: Array.from(room.users.values())
  });
}

io.on("connection", (socket) => {
  socket.on("room:join", ({ roomId, nickname }: { roomId: string; nickname: string }) => {
    const room = getOrCreateRoom(roomId);
    socket.join(roomId);

    room.users.set(socket.id, {
      socketId: socket.id,
      nickname
    });

    socket.data.roomId = roomId;
    emitRoomState(roomId);
  });

  socket.on(
    "code:update",
    ({ roomId, code, language }: { roomId: string; code: string; language: "javascript" | "typescript" }) => {
      const room = getOrCreateRoom(roomId);
      room.code = code;
      room.language = language;
      socket.to(roomId).emit("code:updated", { code, language });
    }
  );

  socket.on("cursor:update", ({ roomId, cursor }: { roomId: string; cursor: CursorPosition }) => {
    const room = getOrCreateRoom(roomId);
    const user = room.users.get(socket.id);
    if (!user) return;

    user.cursor = cursor;
    socket.to(roomId).emit("cursor:updated", { socketId: socket.id, cursor });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId as string | undefined;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.users.delete(socket.id);

    if (room.users.size === 0) {
      rooms.delete(roomId);
      return;
    }

    emitRoomState(roomId);
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/ai", async (req, res) => {
  try {
    const { action, selectedCode, comparisonCode } = req.body as {
      action: AiAction;
      selectedCode: string;
      comparisonCode?: string;
    };

    if (!action || !selectedCode) {
      return res.status(400).json({ error: "action and selectedCode are required." });
    }

    const systemPrompt = ACTION_PROMPTS[action];
    if (!systemPrompt) {
      return res.status(400).json({ error: "Unsupported AI action." });
    }

    const userPrompt =
      action === "compare" || action === "summarize-diff"
        ? `Snippet A:\n${selectedCode}\n\nSnippet B:\n${comparisonCode || ""}`
        : selectedCode;

    const completion = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    return res.json({ result: completion.output_text || "No response generated." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI request failed." });
  }
});

httpServer.listen(PORT, () => {
  console.log(`CodeRoom AI backend running on http://localhost:${PORT}`);
});
