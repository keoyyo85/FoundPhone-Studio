import { z } from "zod";
export const uid = () => crypto.randomUUID();
export const itemSchema = z.object({
  id: z.string(),
  title: z.string().max(1000),
  body: z.string().max(200000),
  richText: z.string().max(400000).default(""),
  meta: z.record(z.string().max(60), z.string().max(2000)).default({}),
  time: z.string(),
  sender: z.string(),
  avatar: z.string().default(""),
  kind: z
    .enum([
      "text",
      "image",
      "audio",
      "video",
      "file",
      "transfer",
      "call",
      "order",
      "note",
      "post",
      "event",
    ])
    .default("text"),
  media: z.string().default(""),
  hidden: z.boolean().default(false),
  unlock: z.string().default(""),
  password: z.string().default(""),
  folder: z.string().default(""),
  favorite: z.boolean().default(false),
  outgoing: z.boolean().default(false),
  read: z.boolean().default(false),
  likes: z.number().default(0),
  comments: z.array(z.string()).default([]),
});
export type Item = z.infer<typeof itemSchema>;
export const conditionSchema = z.object({
  key: z.string(),
  op: z.enum(["eq", "neq", "gt", "lt", "includes"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
export type Condition = z.infer<typeof conditionSchema>;
export const actionSchema = z.object({
  type: z.enum([
    "date",
    "variable",
    "unlock",
    "hide",
    "notification",
    "message",
    "time",
    "ending",
    "choice",
    "clue",
    "call",
  ]),
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
export type Action = z.infer<typeof actionSchema>;
export const nodeSchema = z.object({
  delayMs: z.number().int().min(0).max(86400000).optional(),
  id: z.string(),
  label: z.string(),
  type: z.enum([
    "start",
    "event",
    "condition",
    "action",
    "choice",
    "delay",
    "ending",
    "comment",
  ]),
  event: z.string(),
  target: z.string(),
  conditions: z.array(conditionSchema),
  logic: z.enum(["and", "or", "not"]).default("and"),
  actions: z.array(actionSchema),
  next: z.array(z.string()),
  once: z.boolean(),
  x: z.number(),
  y: z.number(),
});
export type StoryNode = z.infer<typeof nodeSchema>;
export const workSchema = z.object({
  formatVersion: z.literal(1),
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  category: z.string(),
  cover: z.string(),
  updatedAt: z.number(),
  phone: z.object({
    owner: z.string(),
    kakaoName: z.string().optional(),
    wechatName: z.string().optional(),
    socialName: z.string().optional(),
    ownerAvatar: z.string().optional(),
    wechatAvatar: z.string().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    passcode: z.string().max(12),
    wallpaper: z.string(),
    theme: z.enum(["light", "dark"]),
    time: z.string(),
    battery: z.number().min(0).max(100),
    network: z.string(),
    notifications: z.boolean(),
  }),
  apps: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        installed: z.boolean().default(true),
        visible: z.boolean(),
        dock: z.boolean(),
        folder: z.string(),
        icon: z.string(),
      }),
    )
    .max(100),
  data: z.record(z.string(), z.array(itemSchema).max(20000)),
  nodes: z.array(nodeSchema).max(2000),
  variables: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]),
  ),
  mode: z.enum(["explore", "story", "mixed"]),
});
export type Work = z.infer<typeof workSchema>;
export type UiValue = string | number | boolean | string[];
export type Runtime = {
  date?: string;
  elapsedMs?: number;
  clockRemainderMs?: number;
  scheduled?: { nodeId: string; due: number }[];
  incomingCall?: {
    caller: string;
    target: string;
    status: "ringing" | "answered";
  } | null;
  ui?: Record<string, Record<string, UiValue>>;
  workId: string;
  revision: number;
  variables: Record<string, string | number | boolean>;
  visited: string[];
  read: string[];
  clues: string[];
  unlocked: string[];
  hidden: string[];
  completed: string[];
  notifications: string[];
  endings: string[];
  choices: { label: string; target: string }[];
  messages: Record<string, Item[]>;
  time: string;
  trace: string[];
};
export function initialRuntime(w: Work): Runtime {
  return {
    date: w.phone.date,
    elapsedMs: 0,
    clockRemainderMs: 0,
    scheduled: [],
    incomingCall: null,
    ui: {},
    workId: w.id,
    revision: w.updatedAt,
    variables: { ...w.variables },
    visited: [],
    read: [],
    clues: [],
    unlocked: [],
    hidden: [],
    completed: [],
    notifications: [],
    endings: [],
    choices: [],
    messages: {},
    time: w.phone.time,
    trace: [],
  };
}
export function makeItem(partial: Partial<Item> = {}): Item {
  return itemSchema.parse({
    id: uid(),
    title: "新内容",
    body: "在这里写下故事…",
    time: "2026-09-01 08:30",
    sender: "小林",
    ...partial,
  });
}
export function validateWork(input: unknown): Work {
  return workSchema.parse(input);
}
export function safeMedia(value: string) {
  const embedded =
    /^data:(image\/(png|jpeg|webp|gif)|audio\/(mpeg|mp3|wav|ogg|webm|mp4)|video\/(mp4|webm));base64,[a-zA-Z0-9+/=\s]+$/.test(
      value,
    );
  const curatedPhoto =
    /^https:\/\/(?:pbs\.twimg\.com\/media\/[A-Za-z0-9_-]+(?:\.(?:jpg|png))?(?:\?[^#]*)?|image\.static\.bstage\.in\/[^\s]+|cdn\.livedoor\.jp\/kstyle\/[^\s]+|www\.esquirekorea\.co\.kr\/resources\/online\/online_image\/[^\s]+|cdn\.kpopping\.com\/kpics\/[^\s]+|assets\.pikiran-rakyat\.com\/[^\s]+)$/.test(
      value,
    ) ||
    value === "https://pbs.twimg.com/profile_images/2005188075505549312/AHkTtSLG.jpg" ||
    value === "https://xkxqjlzvieat874751.gcdn.ntruss.com/1/2026/e992/1e9926d62de1deea6a13d404b6b49fc3e3c85c34abb59327a9b094a4eb2161382_o_st.webp";
  const officialProfile =
    /^https:\/\/0\.soompi\.io\/wp-content\/uploads\/2025\/10\/\d{8}\/[a-z0-9-]+\.jpeg(?:\?w=\d{2,4})?$/.test(
      value,
    );
  return embedded || officialProfile || curatedPhoto ? value : "";
}
