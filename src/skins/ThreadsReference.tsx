import { useState } from "react";
import {
  Home,
  Send,
  Plus,
  Heart,
  User,
  Search,
  Menu,
  MoreHorizontal,
  ArrowLeft,
  Repeat2,
  Bookmark,
  SquarePen,
  SlidersHorizontal,
  BellOff,
  ChevronRight,
  X,
  Smile,
  Globe,
  Mic,
  Delete,
  ArrowUp,
  CornerDownLeft,
  Pin,
} from "lucide-react";
import type { SkinProps } from "../AppSkins";
import { Avatar, Media } from "./shared";
import { makeItem, type Item } from "../schema";
import { useSkinState } from "../skinState";
import "./threads-reference.css";
export function ThreadsReference(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "threads-tab", "首页"),
    [liked, setLiked] = useSkinState<string[]>(p, "threads-liked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "threads-saved", []),
    [posts, setPosts] = useSkinState<string[]>(p, "threads-posts", []),
    [replies, setReplies] = useSkinState<string[]>(p, "threads-replies", []);
  const [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("全部"),
    [side, setSide] = useState(false),
    [compose, setCompose] = useState(false),
    [keyboard, setKeyboard] = useState(false),
    [shift, setShift] = useState(false),
    [numbers, setNumbers] = useState(false),
    [options, setOptions] = useState(false),
    [selected, setSelected] = useState<Item | null>(null);
  const local = posts.map((body, n) =>
    makeItem({
      id: "local-thread-" + n,
      title: "本地串文",
      body,
      sender: p.owner || "机主",
      time: p.virtualTime || "09:41",
      meta: { local: "true" },
    }),
  );
  const feed = [
      ...local,
      ...p.items.filter((i) => i.folder !== "私信" && !i.meta.activityType),
    ],
    messages = p.items.filter((i) => i.folder === "私信"),
    activities = p.items.filter((i) => i.meta.activityType);
  const toggle = (id: string, items: string[], set: (v: string[]) => void) =>
    set(items.includes(id) ? items.filter((v) => v !== id) : [...items, id]);
  const open = (i: Item) => {
    if (i.password || p.creator) {
      p.onItem(i);
      return;
    }
    if (i.meta.local !== "true") p.onRead(i.id);
    setSelected(i);
  };
  const card = (i: Item) => (
    <article className="tr-post" key={i.id}>
      <button className="tr-avatar" onClick={() => setTab("个人主页")}>
        <Avatar name={i.sender} src={i.avatar} />
        <span>+</span>
      </button>
      <div className="tr-post-content">
        <div className="tr-byline">
          <b>{i.sender}</b>
          <span>{i.time.slice(-5)}</span>
          <button
            aria-label="帖子选项"
            onClick={() => {
              setSelected(i);
              setOptions(true);
            }}
          >
            <MoreHorizontal />
          </button>
        </div>
        <button className="tr-body" onClick={() => open(i)}>
          {i.body}
          {i.media && <Media item={i} />}
        </button>
        <div className="tr-actions">
          <button
            aria-label={"喜欢" + i.title}
            aria-pressed={liked.includes(i.id)}
            onClick={() => toggle(i.id, liked, setLiked)}
          >
            <Heart
              fill={liked.includes(i.id) ? "#ff3060" : "none"}
              color={liked.includes(i.id) ? "#ff3060" : "currentColor"}
            />
            {i.likes + (liked.includes(i.id) ? 1 : 0) || ""}
          </button>
          <button aria-label={"回复" + i.title} onClick={() => open(i)}>
            <MessageCircleIcon />
            {i.comments.length || ""}
          </button>
          <button
            aria-label={"转发" + i.title}
            onClick={() => toggle(i.id, saved, setSaved)}
          >
            <Repeat2 />
          </button>
          <button
            aria-label={"分享" + i.title}
            onClick={() => {
              setDraft(i.body);
              setCompose(true);
            }}
          >
            <Send />
          </button>
        </div>
      </div>
    </article>
  );
  return (
    <div className="threads-reference">
      <div className="tr-scroll">
        {selected ? (
          <>
            <header className="tr-head">
              <button
                aria-label="返回Threads列表"
                onClick={() => setSelected(null)}
              >
                <ArrowLeft />
              </button>
              <b>串文</b>
              <MoreHorizontal />
            </header>
            {card(selected)}
            <div className="tr-comments">
              {[
                ...selected.comments,
                ...replies
                  .filter((v) => v.startsWith(selected.id + "\t"))
                  .map((v) => v.split("\t").slice(1).join("\t")),
              ].map((c, n) => (
                <p key={n}>{c}</p>
              ))}
            </div>
            <form
              className="tr-reply"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, selected.id + "\t" + draft.trim()]);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="Threads回复"
                placeholder="回复串文"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button>发送</button>
            </form>
          </>
        ) : (
          <>
            <header
              className={
                "tr-head " + (tab === "首页" ? "tr-home-head" : "tr-large-head")
              }
            >
              {tab === "首页" ? (
                <>
                  <button
                    aria-label="打开Threads菜单"
                    onClick={() => setSide(true)}
                  >
                    <Menu />
                  </button>
                  <svg
                    className="tr-logo"
                    width="29"
                    height="36"
                    viewBox="0 0 64 64"
                    aria-label="Threads"
                  >
                    <path
                      d="M48 17C42 5 17 8 14 25c-5 23 26 32 36 17 9-15-9-25-23-17-11 8 7 17 13 8 5-8 0-16-10-14M49 29c6 20-16 31-29 17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <button
                    aria-label="搜索Threads"
                    onClick={() => setTab("搜索")}
                  >
                    <Search />
                  </button>
                </>
              ) : (
                <>
                  <h1>
                    {tab === "消息"
                      ? "消息"
                      : tab === "动态"
                        ? "动态"
                        : tab === "个人主页"
                          ? p.owner || "机主"
                          : tab}
                  </h1>
                  {(tab === "消息" || tab === "动态") && <BellOff />}
                  <button
                    aria-label="新建串文"
                    onClick={() => setCompose(true)}
                  >
                    <SquarePen />
                  </button>
                </>
              )}
            </header>
            {(tab === "消息" || tab === "搜索") && (
              <label className="tr-search">
                <Search size={18} />
                <input
                  aria-label="搜索Threads内容"
                  placeholder="搜索"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            )}
            {(tab === "消息" || tab === "动态") && (
              <nav className="tr-filters">
                {(tab === "消息"
                  ? ["筛选", "收件箱", "陌生消息"]
                  : ["全部", "关注", "对话", "提及", "你关注的人"]
                ).map((t) => (
                  <button
                    key={t}
                    className={filter === t ? "selected" : ""}
                    onClick={() => setFilter(t)}
                  >
                    {t === "筛选" ? <SlidersHorizontal size={19} /> : t}
                  </button>
                ))}
              </nav>
            )}
            {tab === "首页" &&
              feed
                .filter((i) =>
                  filter === "收藏"
                    ? saved.includes(i.id)
                    : filter === "已关注"
                      ? i.meta.following === "true"
                      : filter === "限时帖"
                        ? i.meta.story === "true"
                        : true,
                )
                .map(card)}
            {tab === "搜索" &&
              feed.filter((i) => (i.body + i.sender).includes(query)).map(card)}
            {tab === "消息" &&
              messages
                .filter(
                  (i) =>
                    (i.body + i.sender).includes(query) &&
                    (filter !== "陌生消息" || i.meta.request === "true"),
                )
                .map((i) => (
                  <button
                    className="tr-message"
                    key={i.id}
                    onClick={() => open(i)}
                  >
                    <Avatar name={i.sender} src={i.avatar} />
                    <span>
                      <b>{i.sender}</b>
                      <small>
                        {i.body} · {i.time.slice(-5)}
                      </small>
                    </span>
                    {i.favorite && <Pin size={16} />}
                  </button>
                ))}
            {tab === "动态" && (
              <>
                <h3 className="tr-section">过去 7 天</h3>
                {activities
                  .filter((i) =>
                    filter === "关注"
                      ? i.meta.activityType === "follow"
                      : filter === "对话"
                        ? i.meta.activityType === "reply"
                        : filter === "提及"
                          ? i.meta.activityType === "mention"
                          : true,
                  )
                  .map((i) => (
                    <div className="tr-activity" key={i.id}>
                      <Avatar name={i.sender} src={i.avatar} />
                      <div>
                        <b>{i.sender}</b>
                        <small>{i.time.slice(-5)}</small>
                        <p>{i.body}</p>
                        <div className="tr-actions">
                          <Heart />
                          <Send />
                        </div>
                      </div>
                    </div>
                  ))}
                {!activities.length && <p className="tr-empty">暂无动态</p>}
              </>
            )}
            {tab === "个人主页" && (
              <>
                <div className="tr-profile">
                  <Avatar name={p.owner || "机主"} src={p.ownerAvatar} />
                  <p>{p.owner}</p>
                </div>
                {feed
                  .filter(
                    (i) => i.sender === p.owner || i.meta.local === "true",
                  )
                  .map(card)}
              </>
            )}
            {((tab === "消息" && !messages.length) ||
              (tab === "首页" && !feed.length)) && (
              <p className="tr-empty">暂无内容</p>
            )}
          </>
        )}
      </div>
      <nav className="tr-bottom">
        {[Home, Send, Plus, Heart, User].map((Icon, n) => (
          <button
            key={n}
            aria-label={
              [
                "Threads首页",
                "Threads消息",
                "新建串文",
                "Threads动态",
                "Threads个人主页",
              ][n]
            }
            className={
              tab === ["首页", "消息", "", "动态", "个人主页"][n]
                ? "selected"
                : ""
            }
            onClick={() => {
              setSelected(null);
              if (n === 2) {
                setCompose(true);
                setKeyboard(true);
              } else setTab(["首页", "消息", "", "动态", "个人主页"][n]);
            }}
          >
            <Icon
              fill={
                (n === 0 && tab === "首页") || (n === 3 && tab === "动态")
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        ))}
      </nav>
      {side && (
        <div className="tr-side-cover" onClick={() => setSide(false)}>
          <aside className="tr-side" onClick={(e) => e.stopPropagation()}>
            <header>
              <b>动态</b>
              <button
                aria-label="关闭Threads菜单"
                onClick={() => setSide(false)}
              >
                <X />
              </button>
            </header>
            <div className="tr-side-tools">
              <button
                onClick={() => {
                  setTab("首页");
                  setSide(false);
                }}
              >
                <Heart />
              </button>
              <button
                onClick={() => {
                  setFilter("收藏");
                  setSide(false);
                }}
              >
                <Bookmark />
              </button>
            </div>
            <div className="tr-side-list">
              {["为你推荐", "已关注", "限时帖"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFilter(t);
                    setSide(false);
                  }}
                >
                  {t}
                  <ChevronRight />
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
      {compose && (
        <section className="tr-compose">
          <header>
            <button
              onClick={() => {
                setCompose(false);
                setKeyboard(false);
              }}
            >
              取消
            </button>
            <b>新建串文</b>
            <button aria-label="串文选项" onClick={() => setOptions(!options)}>
              <MoreHorizontal />
            </button>
          </header>
          <div className="tr-compose-content">
            <Avatar name={p.owner || "机主"} />
            <div>
              <b>{p.owner}</b>
              <span className="tr-muted"> › 社群或话题</span>
              <textarea
                aria-label="串文内容"
                placeholder="有什么新鲜事吗？"
                value={draft}
                inputMode="none"
                onFocus={() => setKeyboard(true)}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={2000}
              />
              <p className="tr-muted">添加到串文</p>
            </div>
          </div>
          <div className="tr-compose-actions">
            <button onClick={() => setOptions(!options)}>
              <SlidersHorizontal size={21} />
              帖子选项
            </button>
            <button
              disabled={!draft.trim()}
              onClick={() => {
                setPosts([draft.trim(), ...posts]);
                setDraft("");
                setCompose(false);
                setKeyboard(false);
                setTab("首页");
              }}
            >
              发布
            </button>
          </div>
          {keyboard && (
            <div className="tr-keyboard">
              <div className="tr-candidates">
                {["我", "你", "好", "他", "不", "这", "这个", "对"].map((k) => (
                  <button
                    key={k}
                    onClick={() =>
                      setDraft(draft + (shift ? k.toUpperCase() : k))
                    }
                  >
                    {k}
                  </button>
                ))}
                <button
                  aria-label="收起串文键盘"
                  onClick={() => setKeyboard(false)}
                >
                  ⌄
                </button>
              </div>
              {(numbers
                ? ["1234567890", "-/:;()&@", ".,?!"]
                : ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
              ).map((row, n) => (
                <div className="tr-key-row" key={n}>
                  {n === 2 && (
                    <button
                      aria-label="大写"
                      aria-pressed={shift}
                      onClick={() => setShift(!shift)}
                    >
                      <ArrowUp />
                    </button>
                  )}
                  {[...row].map((k) => (
                    <button key={k} onClick={() => setDraft(draft + k)}>
                      {k}
                    </button>
                  ))}
                  {n === 2 && (
                    <button
                      aria-label="删除串文字符"
                      onClick={() => setDraft(draft.slice(0, -1))}
                    >
                      <Delete />
                    </button>
                  )}
                </div>
              ))}
              <div className="tr-key-row">
                <button onClick={() => setNumbers(!numbers)}>
                  {numbers ? "ABC" : "123"}
                </button>
                <button>
                  <Smile />
                </button>
                <button
                  className="space"
                  aria-label="空格"
                  onClick={() => setDraft(draft + " ")}
                >
                  {" "}
                </button>
                <button
                  aria-label="换行"
                  onClick={() => setDraft(draft + "\n")}
                >
                  <CornerDownLeft />
                </button>
              </div>
              <footer>
                <Globe />
                <Mic />
              </footer>
            </div>
          )}
        </section>
      )}
      {options && (
        <div className="tr-options">
          <b>帖子选项</b>
          <p>所有人可以回复</p>
          <button onClick={() => setOptions(false)}>完成</button>
        </div>
      )}
    </div>
  );
}
function MessageCircleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 12a8 8 0 0 1-8 8H4l2-4a8 8 0 1 1 14-4z" />
    </svg>
  );
}
