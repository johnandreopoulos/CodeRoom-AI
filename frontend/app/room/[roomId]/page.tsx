"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiPanel } from "@/components/AiPanel";
import { socket } from "@/lib/socket";

type Cursor = { socketId: string; cursor: { lineNumber: number; column: number } };
type User = { socketId: string; nickname: string; cursor?: { lineNumber: number; column: number } };

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();
  const roomId = params.roomId;
  const nickname = searchParams.get("nickname") || "Anonymous Dev";

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<"javascript" | "typescript">("javascript");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCode, setSelectedCode] = useState("");
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.emit("room:join", { roomId, nickname });

    socket.on("room:state", (state) => {
      setCode(state.code);
      setLanguage(state.language);
      setUsers(state.users);
    });

    socket.on("code:updated", ({ code: nextCode, language: nextLanguage }) => {
      setCode(nextCode);
      setLanguage(nextLanguage);
    });

    socket.on("cursor:updated", ({ socketId, cursor }: Cursor) => {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.socketId === socketId) return { ...u, cursor };
          return u;
        })
      );
    });

    return () => {
      socket.off("room:state");
      socket.off("code:updated");
      socket.off("cursor:updated");
    };
  }, [nickname, roomId]);

  const onMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((event) => {
      socket.emit("cursor:update", { roomId, cursor: event.position });
    });

    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      if (!selection) return;

      const value = editor.getModel()?.getValueInRange(selection) || "";
      setSelectedCode(value);
    });
  };

  return (
    <main className="grid h-screen grid-cols-[1fr_360px]">
      <section className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-2">
          <div>
            <h1 className="font-semibold">Room: {roomId}</h1>
            <p className="text-xs text-slate-400">You are {nickname}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Language:</span>
            <select
              className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
              value={language}
              onChange={(e) => {
                const next = e.target.value as "javascript" | "typescript";
                setLanguage(next);
                socket.emit("code:update", { roomId, code, language: next });
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>
        </header>

        <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-900/60 px-4 py-2 text-xs">
          <span className="font-semibold">Live presence:</span>
          {users.map((user) => (
            <span key={user.socketId} className="rounded bg-slate-800 px-2 py-1">
              {user.nickname}
              {user.cursor ? ` @ ${user.cursor.lineNumber}:${user.cursor.column}` : ""}
            </span>
          ))}
        </div>

        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={language}
          theme="vs-dark"
          value={code}
          onMount={onMount}
          onChange={(value) => {
            const next = value || "";
            setCode(next);
            socket.emit("code:update", { roomId, code: next, language });
          }}
          options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
        />
      </section>

      <AiPanel selectedCode={selectedCode} />
    </main>
  );
}
