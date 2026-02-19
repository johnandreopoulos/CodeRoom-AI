"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("demo-room");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const cleanName = nickname.trim() || "Anonymous Dev";
    router.push(`/room/${roomId}?nickname=${encodeURIComponent(cleanName)}`);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <h1 className="mb-2 text-4xl font-bold">CodeRoom AI</h1>
      <p className="mb-8 text-slate-300">Multiplayer code editor + built-in senior AI reviewer.</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Nickname</span>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ada"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Room URL Slug</span>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="frontend-refactor"
          />
        </label>

        <button className="rounded bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400" type="submit">
          Join Room
        </button>
      </form>
    </main>
  );
}
