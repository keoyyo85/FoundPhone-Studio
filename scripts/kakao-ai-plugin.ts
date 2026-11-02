import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

type ChatMessage = { role: "user" | "assistant"; content: string; name?: string };
const memoryFile = resolve(process.cwd(), ".local-data/kakao-memory.json");
const characters: Record<string, string> = {
  "윤아언니": "薛侖娥（윤아）。溫柔細膩、偶爾害羞，對智佑親近而有耐心，使用自然的韓文口語，可少量使用表情符號。",
  "해원언니": "海嫄。可靠、爽朗、有領導感，會關心成員，也會適度開玩笑。",
  "릴리언니": "Lily。開朗、幽默、反應快，語氣自然親切。",
  "솔언니": "Bae。活潑、愛鬧，擅長用玩笑緩和氣氛。",
  "규진": "Kyujin。精力充沛、直率、可愛，說話有年輕人的節奏。",
  "언니": "智佑的姐姐。熟悉智佑，關心她的生活，語氣親密。",
  "엄마": "智佑的媽媽。溫暖、關懷、務實，會提醒她照顧自己。",
  "매니저님": "經紀人。專業、簡潔，主要談行程、工作安排和注意事項。",
};
async function readMemory(): Promise<Record<string, ChatMessage[]>> {
  try { return JSON.parse(await readFile(memoryFile, "utf8")); }
  catch { return {}; }
}
async function writeMemory(value: Record<string, ChatMessage[]>) {
  await mkdir(resolve(process.cwd(), ".local-data"), { recursive: true });
  await writeFile(memoryFile, JSON.stringify(value, null, 2), "utf8");
}
export function kakaoAiPlugin(): Plugin {
  return {
    name: "foundphone-kakao-ai",
    configureServer(server) {
      server.middlewares.use("/api/kakao-chat", async (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        if (req.method !== "POST") { res.statusCode = 405; res.end(JSON.stringify({ error: "Method not allowed" })); return; }
        const key = process.env.OPENAI_API_KEY;
        if (!key) { res.statusCode = 503; res.end(JSON.stringify({ error: "尚未設定 OPENAI_API_KEY。請在 Codespaces 的 Terminal 設定環境變數後重新啟動預覽。" })); return; }
        try {
          let raw = "";
          for await (const chunk of req) { raw += chunk; if (raw.length > 30000) throw new Error("訊息太長"); }
          const body = JSON.parse(raw) as { storyId?: string; thread?: string; owner?: string; participants?: string[]; text?: string };
          const storyId = String(body.storyId || "jiwoo-yuna").slice(0, 80);
          const thread = String(body.thread || "").slice(0, 120);
          const text = String(body.text || "").trim().slice(0, 2000);
          const participants = Array.isArray(body.participants) ? body.participants.slice(0, 12).map(x => String(x).slice(0, 60)) : [thread];
          if (!thread || !text) { res.statusCode = 400; res.end(JSON.stringify({ error: "聊天室和訊息不可為空" })); return; }
          const store = await readMemory();
          const id = storyId + "::" + thread;
          const history = store[id] || [];
          const isGroup = participants.length > 1 || /단톡|團體|成員|NMIXX/i.test(thread);
          const persona = participants.map(name => characters[name] ? name + "：" + characters[name] : name + "：依照聊天室既有角色設定自然回應").join("\n");
          const system = "你是互動手機故事中的虛構角色扮演引擎。這是虛構 AU，不代表真實人物的真實關係或言行。玩家角色是金智佑（지우）。請用繁體中文或自然韓文回覆，依照玩家訊息語言和角色習慣切換。保持角色一致、避免出戲，不要聲稱自己是真實人物。\n聊天室：" + thread + "\n角色設定：\n" + persona + (isGroup ? "\n這是群聊。請輸出 JSON：{\"messages\":[{\"speaker\":\"參與者名稱\",\"text\":\"訊息\"}]}。產生 1 至 3 條自然接話，角色名稱必須取自參與者。" : "\n這是私聊。只輸出角色會傳給智佑的一段訊息，不要加角色名。");
          const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
            body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", input: [{ role: "system", content: system }, ...history.slice(-24).map(m => ({ role: m.role, content: m.content })), { role: "user", content: text }], max_output_tokens: 500 })
          });
          const result = await response.json() as any;
          if (!response.ok) throw new Error(result?.error?.message || "OpenAI API 請求失敗");
          const answer = (result.output || []).flatMap((item: any) => item.content || []).filter((item: any) => item.type === "output_text").map((item: any) => item.text).join("\n").trim();
          if (!answer) throw new Error("AI 沒有回傳訊息");
          const replies: { speaker: string; text: string }[] = isGroup
            ? (() => { try { const parsed = JSON.parse(answer); return (parsed.messages || []).slice(0, 3).map((m: any) => ({ speaker: participants.includes(m.speaker) ? m.speaker : participants[0], text: String(m.text || "").slice(0, 1000) })).filter((m: any) => m.text); } catch { return [{ speaker: participants[0], text: answer.slice(0, 1000) }]; } })()
            : [{ speaker: thread, text: answer.slice(0, 1000) }];
          store[id] = [...history, { role: "user", content: text }, { role: "assistant", content: replies.map(x => x.speaker + "：" + x.text).join("\n") }].slice(-60);
          await writeMemory(store);
          res.end(JSON.stringify({ replies }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "聊天服務發生錯誤" }));
        }
      });
    }
  };
}
