/* React/data adapters for dudwo5/Mymy UI templates: kt/ktn/KHD/bub,
 * igHome/igProfile/igDM/igSheet, xHome. See NOTICE.txt for permission.
 * Author content, DOM globals, timers and media dependencies are excluded. */
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Settings,
  Users,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Home,
  Grid,
  Send,
  Bookmark,
  Repeat2,
  BarChart2,
  Share,
  User,
  Bell,
  X,
  Smile,
  Menu,
  Compass,
} from "lucide-react";
import type { SkinProps } from "../../AppSkins";
import { Avatar, Media } from "../../skins/shared";
import { useSkinState } from "../../skinState";
import { makeItem, type Item } from "../../schema";
import "./ui.css";
import "./adapter.css";
function grouped(items: Item[]) {
  return [...new Set(items.map((i) => i.title))].map((title) => ({
    title,
    items: items.filter((i) => i.title === title),
  }));
}
export function messageRun(items: Item[], index: number) {
  const m = items[index],
    previous = items[index - 1],
    next = items[index + 1];
  return {
    first:
      !previous ||
      previous.outgoing !== m.outgoing ||
      previous.sender !== m.sender,
    last: !next || next.outgoing !== m.outgoing || next.sender !== m.sender,
  };
}
const read = (p: SkinProps, i: Item) =>
  p.creator || i.password ? p.onItem(i) : p.onRead(i.id);
function Blank() {
  return <p className="mymy-empty">暂无内容</p>;
}
function Back({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="뒤로" onClick={onClick}>
      <ArrowLeft size={22} />
    </button>
  );
}
export function kakaoCharacterReply(thread: string, message: string, turn: number) {
  const text = message.toLowerCase();
  const has = (...words: string[]) => words.some((word) => text.includes(word));
  if (thread === "윤아언니") {
    if (has("보고싶", "보고 싶어", "보고 싶어", "miss you", "보고 싶")) return { sender: "윤아언니", body: ["나도 지우 보고 싶었어. 오늘 조금 더 같이 있을까? 🥺", "그렇게 말하면 지금 당장 보러 가고 싶잖아 ㅎㅎ", "나도 그래. 연습 끝나면 전화해. 기다릴게."][turn % 3] };
    if (has("좋아해", "사랑", "love", "좋아해", "사랑해")) return { sender: "윤아언니", body: ["지우야… 그런 말은 만나서 해 주면 안 돼? 지금 심장이 너무 빨리 뛰어.", "나도 너 많이 좋아해. 네가 생각하는 것보다 더.", "갑자기 이렇게 솔직하면 언니 심장은 어떡해 ㅎㅎ ❤️"][turn % 3] };
    if (has("밥", "밥 먹", "먹었", "배고", "배고")) return { sender: "윤아언니", body: ["아직 안 먹었으면 나랑 같이 먹자. 오늘은 내가 살게!", "지우要先好好밥 먹，不要又因為練習而跳過正餐。", "떡볶이 먹으러 갈까? 네가 제일 좋아하는 곳으로 가자."][turn % 3] };
    if (has("힘들", "피곤", "피곤", "속상", "속상", "괜찮")) return { sender: "윤아언니", body: ["오늘 많이 힘들었지? 내 앞에서는 괜찮은 척 안 해도 돼. 내가 들어 줄게.", "우리 지우 고생했어. 잠깐 쉬어. 내가 옆에 있을게.", "무슨 일 있었어? 천천히 말해. 급하게 대답하지 않아도 돼."][turn % 3] };
    if (has("전화", "통화", "call", "전화해")) return { sender: "윤아언니", body: ["好呀，現在전화해妳？我想聽妳的聲音。", "等我一下，我去안녕靜一點的地方。지우的전화一定要接。", "嗯！結束後馬上전화해我，我會等妳。"][turn % 3] };
    if (has("안녕", "안녕", "hi", "hello", "晚안녕")) return { sender: "윤아언니", body: ["지우야 안녕 ❤️ 오늘 하루 어땠어?", "왔어? 마침 너 생각하고 있었는데 ㅎㅎ", "우리 지우 오늘도 수고했어. 아까 뭐 하고 있었어?"][turn % 3] };
    return { sender: "윤아언니", body: ["응응, 조금만 더 얘기해 줘. 지금은 네 말만 듣고 있어.", "ㅋㅋㅋ 정말? 그래서 어떻게 됐어? 언니 궁금해.", "지우야, 네 사소한 일까지 다 듣고 싶어. 오늘 있었던 일 더 얘기해 줘.", "그랬구나. 나라면 무조건 먼저 지우 편이 되어 줄 거야. ❤️"][turn % 4] };
  }
  if (thread === "해원언니") return { sender: "해원언니", body: has("윤아", "윤아", "지우", "데이트", "데이트") ? ["妳們最近是不是太明顯了？哈哈 不過也要注意別讓지우有壓力。", "我知道妳的心意，但工作期間還是低調一點，也要替지우著想。", "내가 모를 줄 알았어? 둘 다 소중하니까 천천히 해도 돼."][turn % 3] : ["리더로서 한마디 할게. 오늘은 몸부터 챙기고 연습 너무 무리하지 마.", "다들 내일 일정 확인했지? 늦지 말고 오늘은 일찍 쉬자."][turn % 2] };
  if (thread === "릴리언니") return { sender: "릴리언니", body: has("윤아", "윤아", "지우", "cute", "귀여") ? ["Awww you two are so cute!! Jiwoo, Yuna talks about you ALL the time 🥹", "I knew it!! Her smile gives everything away 😂", "If you two are happy, I'm happy! But don't forget to invite me for tteokbokki!!"][turn % 3] : ["Jiwoo!! You did amazing today. I'm so proud of you 💗", "Let's all get something delicious after practice. I need food and a little gossip 😂", "You can always talk to me, okay? I'm cheering for you!!"][turn % 3] };
  if (thread === "배언니") return { sender: "배언니", body: has("윤아", "윤아", "지우", "데이트", "데이트") ? ["윤아언니最近只要看手機就會笑哈哈 我大概知道是誰的功勞。", "떡볶이 먹으러 간다며? 나도 데려가 줘~", "지우呀，逗윤아언니變得好有趣，妳要負責哈哈"][turn % 3] : ["오늘 간식 먹었어? 연습 끝나고 같이 먹으러 가자!", "ㅋㅋㅋ 알겠어. 이 언니가 계속 응원할게!"][turn % 2] };
  if (thread === "규진") return { sender: "규진", body: has("윤아", "윤아", "지우") ? ["언니들 뭐예요 ㅋㅋ 저 다 봤어요 👀", "윤아언니今天已經第三次提到지우언니了哈哈", "두 사람 진짜 사귀게 되면 막내한테 제일 먼저 알려 줘야 해요!!"][turn % 3] : ["지우언니在做什麼？我好無聊哈哈", "언니 내일 연습 때 봐요! 오늘 푹 쉬어요 💗"][turn % 2] };
  if (thread === "언니") return { sender: "언니", body: has("밥", "밥 먹", "먹었", "배고", "배고") ? ["밥 먹了嗎？不要又只顧著練習，忘記吃東西。", "냉장고에 반찬 넣어 뒀어. 집에 가서 꼭 먹어."][turn % 2] : ["我們家忙內今天還好嗎？有煩惱就跟언니說。", "늦게 끝나면 꼭 연락해. 내가 데리러 갈게.", "아무리 바빠도 잠은 충분히 자야 해. 알겠지?"][turn % 3] };
  if (thread === "엄마") return { sender: "엄마", body: has("밥", "밥 먹", "먹었", "배고", "배고") ? ["女兒밥 먹了嗎？記得吃點熱的。", "要不要엄마寄一些小菜過去？不要漏掉正餐。"][turn % 2] : ["지우呀，今天也辛苦了。엄마永遠站在妳這邊。", "不要把身體피곤壞了，好好休息，不舒服要馬上說。", "有空打전화給엄마吧，想聽聽妳的聲音。"][turn % 3] };
  if (thread === "매니저님") return { sender: "매니저님", body: ["지우，明天行程：10:30 妝髮、12:00 錄音、16:00 拍攝。請確認移動時間。", "오늘 연습 종료 후 차량은 20:10 정문 앞에서 대기하겠습니다.", "이번 주 일정이 업데이트되었습니다. 변경 사항은 단체방에 공지하겠습니다."][turn % 3] };
  if (thread === "엔믹스 단체방") {
    const replies = [
      { sender: "규진", body: "哈哈哈ㅋ 언니們又開始了！지우언니會怎麼反應呀？" },
      { sender: "배언니", body: "윤아언니現在的笑容，我們全都看得一清二楚～" },
      { sender: "릴리언니", body: "THIS IS TOO CUTE 😂 우리 다 같이 떡볶이 먹으러 가요!" },
      { sender: "해원언니", body: "好了，先別鬧她們了！明天大家都有行程，今晚早點休息。尤其是윤아，記得照顧好지우。" },
      { sender: "윤아언니", body: "啊，真的別再鬧我了啦哈哈 지우呀，別在意她們。언니帶妳偷偷逃走 ❤️" },
    ];
    return replies[turn % replies.length];
  }
  return { sender: "윤아언니", body: "我看到訊息了！지우呀，可以再跟我說詳細一點嗎？❤️" };
}
export function MymyKakao(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "채팅"),
    [sent, setSent] = useSkinState<string[]>(p, "mymyKktSent", []),
    [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false);
  const list = grouped(p.items),
    messages = [
      ...p.items.filter((i) => i.title === p.thread),
      ...sent.flatMap((raw, index) => {
        try {
          const entry: unknown = JSON.parse(raw);
          if (
            !Array.isArray(entry) ||
            (entry.length !== 3 && entry.length !== 6) ||
            !entry.every((v) => typeof v === "string" || typeof v === "boolean") ||
            entry[0] !== p.thread
          ) return [];
          return [
            makeItem({
              id: "local-kkt-" + index,
              title: String(entry[0]),
              body: String(entry[1]),
              time: String(entry[2]),
              sender: typeof entry[3] === "string" ? entry[3] : p.owner || "휴대폰 주인",
              avatar: typeof entry[5] === "string" ? entry[5] : "",
              outgoing: entry.length === 3 ? true : entry[4] === true,
              meta: { local: "true" },
            }),
          ];
        } catch {
          return [];
        }
      }),
    ],
    scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [p.thread, messages.length]);
  return (
    <div className="mymy-ui mymy-kakao" data-mymy="kakao">
      {p.thread ? (
        <>
          <header className="kzth">
            <Back onClick={() => p.onThread("")} />
            <span className="kzname">{p.thread}</span>
            <span className="kzpill">
              <button aria-label="채팅菜单" onClick={() => setMenu(!menu)}>
                <Menu size={21} />
              </button>
            </span>
          </header>
          <div className="msgs kk" ref={scroll}>
            {messages.map((m, i) => {
              const run = messageRun(messages, i);
              return (
                <div
                  key={m.id}
                  className={
                    "kzm " +
                    (m.outgoing ? "kzmy" : "kzot") +
                    (run.first ? " first" : "")
                  }
                >
                  {!m.outgoing && run.first && (
                    <>
                      <div className="kzmav">
                        <Avatar name={m.sender} src={m.avatar} />
                      </div>
                      <div className="kzmn">{m.sender}</div>
                    </>
                  )}
                  {m.outgoing && run.last && (
                    <span className="kzt">
                      {m.meta.unread || ""}
                      <br />
                      {m.time.slice(-5)}
                    </span>
                  )}
                  <button
                    className={"kzbub" + (m.media ? " kzimg" : "")}
                    onClick={() => m.meta.local !== "true" && read(p, m)}
                  >
                    {m.media ? <Media item={m} /> : m.body}
                  </button>
                  {!m.outgoing && run.last && (
                    <span className="kzt">{m.time.slice(-5)}</span>
                  )}
                </div>
              );
            })}
            {!messages.length && <Blank />}
          </div>
          <form
            className="kzinp"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) {
                const body = draft.trim();
                const time = p.virtualTime || "14:41";
                const reply = kakaoCharacterReply(p.thread, body, messages.length + sent.length);
                const avatar = p.items.find((item) => item.sender === reply.sender)?.avatar || "";
                setSent([
                  ...sent,
                  JSON.stringify([p.thread, body, time, p.owner || "金지우", true, ""]),
                  JSON.stringify([p.thread, reply.body, time, reply.sender, false, avatar]),
                ]);
                setDraft("");
              }
            }}
          >
            <button
              type="button"
              aria-label="添加채팅内容"
              onClick={() => (p.creator ? p.onAdd() : setMenu(!menu))}
            >
              <Plus size={21} />
            </button>
            <input
              aria-label="카카오톡 메시지"
              placeholder="메시지 입력"
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Smile size={22} />
            <button
              className={draft.trim() ? "go" : ""}
              aria-label="发送카카오톡 메시지"
              disabled={!draft.trim()}
            >
              ↑
            </button>
          </form>
          {menu && (
            <div className="mymy-local-menu">
              <strong>{p.thread}</strong>
              <p>
                群成员：{[...new Set(messages.map((m) => m.sender))].join("、")}
              </p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </>
      ) : (
        <div className="kzkk">
          <div className="kzhd">
            <header className="kzkh">
              <b className="kzti">
                {tab === "친구" ? p.owner || "친구" : "채팅"}
              </b>
              <span className="kzic">
                <button
                  aria-label="검색채팅"
                  onClick={() => setQuery(query ? "" : " ")}
                >
                  <Search size={21} />
                </button>
                {p.creator && (
                  <button aria-label="콘텐츠 추가" onClick={p.onAdd}>
                    <Plus />
                  </button>
                )}
                <button aria-label="카카오톡 설정" onClick={() => setMenu(!menu)}>
                  <Settings size={21} />
                </button>
              </span>
            </header>
            <div className="kzkc2">
              {["친구", "채팅"].map((t) => (
                <button
                  key={t}
                  className={
                    "kzkpl " +
                    (t === tab || (t === "추천" && tab === "추천")
                      ? "on"
                      : "")
                  }
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {query !== "" && (
              <input
                className="mymy-search"
                aria-label="카카오톡 검색"
                value={query.trimStart()}
                onChange={(e) => setQuery(e.target.value || " ")}
                placeholder="검색"
              />
            )}
          </div>
          <div className="kzkb">
            <div className="kzksec">
              {tab === "친구" ? "친구" : "全部채팅"} {list.length}
            </div>
            {list
              .filter((g) => g.title.includes(query.trim()))
              .map((g) => {
                const last = g.items.at(-1)!;
                return (
                  <button
                    className="kzkr kzkcr"
                    key={g.title}
                    onClick={() => p.onThread(g.title)}
                  >
                    <Avatar name={last.sender || g.title} src={last.avatar} />
                    <span className="kzkn">
                      <b>{g.title}</b>
                      <small>{tab === "친구" ? last.sender : last.body}</small>
                    </span>
                    <span className="kzkmt">
                      {last.time.slice(-5)}
                      {last.meta.unread && (
                        <i className="kzkbd">{last.meta.unread}</i>
                      )}
                    </span>
                  </button>
                );
              })}
            {!list.length && <Blank />}
          </div>
          <nav className="kzknv">
            {[Users, MessageCircle, Compass, Grid, MoreHorizontal].map(
              (Icon, i) => (
                <button
                  key={i}
                  aria-label={["친구", "채팅", "탐색", "더 보기", "설정"][i]}
                  className={(tab === "친구" ? 0 : 1) === i ? "on" : ""}
                  onClick={() =>
                    i < 2 ? setTab(["친구", "채팅"][i]) : setMenu(true)
                  }
                >
                  <Icon />
                </button>
              ),
            )}
          </nav>
          {menu && (
            <div className="mymy-local-menu">
              <strong>KakaoTalk</strong>
              <p>作品内채팅</p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function MymyInstagram(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "홈"),
    [liked, setLiked] = useSkinState<string[]>(p, "mymyLiked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "mymySaved", []),
    [replies, setReplies] = useSkinState<string[]>(p, "mymyReplies", []),
    [seen, setSeen] = useSkinState<string[]>(p, "mymySeen", []);
  const [sheet, setSheet] = useState<Item | null>(null),
    [selected, setSelected] = useState<Item | null>(null),
    [story, setStory] = useState(0),
    [draft, setDraft] = useState(""),
    [pop, setPop] = useState("");
  const posts = p.items.filter(
      (i) => i.folder !== "메시지" && i.meta.story !== "true",
    ),
    stories = p.items.filter((i) => i.meta.story === "true"),
    dms = p.items.filter((i) => i.folder === "메시지"),
    active = stories[story - 1];
  const toggle = (id: string, values: string[], set: (v: string[]) => void) =>
    set(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(
      () => setStory((n) => (n < stories.length ? n + 1 : 0)),
      5000,
    );
    return () => clearTimeout(t);
  }, [active, stories.length]);
  const openStory = (i: number) => {
    const m = stories[i];
    setSeen([...new Set([...seen, m.id])]);
    read(p, m);
    setStory(i + 1);
  };
  const openPost = (i: Item) => {
    if (p.creator || i.password) p.onItem(i);
    else {
      read(p, i);
      setSelected(i);
    }
  };
  const post = (i: Item) => (
    <article className="igp" key={i.id}>
      <header className="igph">
        <Avatar name={i.sender} src={i.avatar} />
        <div className="igpn">
          <button onClick={() => setTab("个人홈")}>
            <b>{i.sender}</b>
          </button>
          <small>{i.meta.location || i.time}</small>
        </div>
        <button aria-label="게시물 상세" onClick={() => openPost(i)}>
          <MoreHorizontal />
        </button>
      </header>
      <div
        className="carw"
        onDoubleClick={() => {
          if (!liked.includes(i.id)) {
            setLiked([...liked, i.id]);
            p.onLike?.(i.id);
          }
          setPop(i.id);
        }}
      >
        <Media item={i} />
        {pop === i.id && (
          <Heart
            className="mymy-heart-pop"
            fill="white"
            onAnimationEnd={() => setPop("")}
          />
        )}
      </div>
      <div className="iga">
        <button
          aria-label={"좋아요" + i.title}
          aria-pressed={liked.includes(i.id)}
          onClick={() => {
            const wasLiked = liked.includes(i.id);
            toggle(i.id, liked, setLiked);
            if (!wasLiked) p.onLike?.(i.id);
          }}
        >
          <Heart
            fill={liked.includes(i.id) ? "#ff3040" : "none"}
            color={liked.includes(i.id) ? "#ff3040" : "currentColor"}
          />
        </button>
        <button
          aria-label={"댓글" + i.title}
          onClick={() => {
            read(p, i);
            setSheet(i);
          }}
        >
          <MessageCircle />
        </button>
        <button aria-label="게시물 공유" onClick={() => setTab("메시지")}>
          <Send />
        </button>
        <button
          className="mymy-save"
          aria-label={"저장" + i.title}
          aria-pressed={saved.includes(i.id)}
          onClick={() => toggle(i.id, saved, setSaved)}
        >
          <Bookmark fill={saved.includes(i.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="lk2">{i.likes + (liked.includes(i.id) ? 1 : 0)} 次赞</p>
      <button
        className="igc"
        onClick={() => {
          openPost(i);
        }}
      >
        <b>{i.sender}</b> {i.body}
      </button>
      <button className="cmall" onClick={() => setSheet(i)}>
        查看댓글{" "}
        {i.comments.length +
          replies.filter((r) => r.startsWith(i.id + "\t")).length}
      </button>
      <p className="igt">{i.time}</p>
    </article>
  );
  return (
    <div className="mymy-ui mymy-instagram" data-mymy="instagram">
      <div className="ig">
        <header className="igh">
          <button
            aria-label={selected ? "뒤로Instagram动态" : "현재 앱 닫기"}
            onClick={() => (selected ? setSelected(null) : p.onBack())}
          >
            <ArrowLeft />
          </button>
          <span className="igl2">
            {selected ? "게시물" : tab === "홈" ? "Instagram" : tab}
          </span>
          <button aria-label="打开메시지" onClick={() => setTab("메시지")}>
            <Send />
          </button>
        </header>
        <div className="igb">
          {selected && post(selected)}
          {!selected && tab === "홈" && (
            <>
              <div className="sts">
                {stories.map((s, n) => (
                  <button
                    className="st"
                    key={s.id}
                    onClick={() => openStory(n)}
                  >
                    <span
                      className={"sr on " + (seen.includes(s.id) ? "seen" : "")}
                    >
                      <Avatar name={s.sender} src={s.avatar} />
                    </span>
                    <small>{s.sender}</small>
                  </button>
                ))}
              </div>
              {posts.map(post)}
              {!posts.length && <Blank />}
            </>
          )}
          {!selected && tab === "个人홈" && (
            <>
              <div className="pf">
                <Avatar name={p.owner || "휴대폰 주인"} />
                <div className="ps">
                  <div>
                    <b>{posts.length}</b>
                    <small>게시물</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>粉丝</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>关注</small>
                  </div>
                </div>
              </div>
              <p className="pn">{p.owner}</p>
              <div className="ptab">
                <div className="on">
                  <Grid />
                </div>
              </div>
              <div className="pg2">
                {posts.map((i) => (
                  <button key={i.id} onClick={() => openPost(i)}>
                    <Media item={i} />
                  </button>
                ))}
              </div>
            </>
          )}
          {!selected && tab === "메시지" && (
            <>
              {dms.map((i) => (
                <button className="kzkr" key={i.id} onClick={() => openPost(i)}>
                  <Avatar name={i.sender} src={i.avatar} />
                  <span className="kzkn">
                    <b>{i.title}</b>
                    <small>{i.body}</small>
                  </span>
                </button>
              ))}
              {!dms.length && <Blank />}
            </>
          )}
          {!selected && tab === "검색" && (
            <>
              <input
                className="mymy-search"
                aria-label="검색Instagram"
                placeholder="검색"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              {posts
                .filter((i) => (i.title + i.body + i.sender).includes(draft))
                .map(post)}
            </>
          )}
        </div>
        <nav className="mymy-ig-nav">
          {[Home, Search, Send, User].map((Icon, n) => (
            <button
              key={n}
              aria-label={["홈", "검색", "메시지", "个人홈"][n]}
              aria-pressed={
                !selected && tab === ["홈", "검색", "메시지", "个人홈"][n]
              }
              onClick={() => {
                setSelected(null);
                setTab(["홈", "검색", "메시지", "个人홈"][n]);
              }}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
      {sheet && (
        <div className="kzcs">
          <button
            className="kzbk"
            aria-label="关闭댓글"
            onClick={() => setSheet(null)}
          />
          <section className="kzsh" role="dialog" aria-label="Instagram댓글">
            <div className="mymy-sheet-handle" />
            <header>
              <b>댓글</b>
              <button aria-label="关闭댓글面板" onClick={() => setSheet(null)}>
                <X />
              </button>
            </header>
            <div className="mymy-comments">
              {[
                ...sheet.comments,
                ...replies
                  .filter((r) => r.startsWith(sheet.id + "\t"))
                  .map((r) => r.split("\t").slice(1).join("\t")),
              ].map((c, n) => (
                <p key={n}>
                  <Avatar name={c.split(":")[0]} />
                  {c}
                </p>
              ))}
            </div>
            <form
              className="cmb2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, sheet.id + "\t" + draft.trim()]);
                  p.onInteract?.("comment", sheet.id);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="添加댓글"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="添加댓글"
                maxLength={500}
              />
              <button>发布</button>
            </form>
          </section>
        </div>
      )}
      {active && (
        <div
          className="mymy-story"
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const next =
              e.clientX - box.left < box.width * 0.3 ? story - 1 : story + 1;
            setStory(next > stories.length ? 0 : Math.max(0, next));
          }}
        >
          <div className="mymy-story-bars">
            {stories.map((s, n) => (
              <i key={s.id} className={n < story ? "seen" : ""} />
            ))}
          </div>
          <header>
            <Avatar name={active.sender} src={active.avatar} />
            <b>{active.sender}</b>
            <button
              aria-label="스토리 닫기"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setStory(0)}
            >
              <X />
            </button>
          </header>
          <Media item={active} />
          <p>{active.body}</p>
        </div>
      )}
    </div>
  );
}
export function MymyX(p: SkinProps) {
  const [dark, setDark] = useSkinState<boolean>(p, "x-dark", true);
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "추천"),
    [likes, setLikes] = useSkinState<string[]>(p, "mymyXLikes", []),
    [reposts, setReposts] = useSkinState<string[]>(p, "mymyXReposts", []),
    [marks, setMarks] = useSkinState<string[]>(p, "mymyXMarks", []),
    [query, setQuery] = useState("");
  const isLiked = (id: string) =>
    typeof p.ui?.["liked-" + id] === "boolean"
      ? Boolean(p.ui["liked-" + id])
      : likes.includes(id);
  const isSaved = (id: string) =>
    typeof p.ui?.["saved-" + id] === "boolean"
      ? Boolean(p.ui["saved-" + id])
      : marks.includes(id);
  const toggle = (id: string, v: string[], set: (x: string[]) => void) =>
    set(v.includes(id) ? v.filter((x) => x !== id) : [...v, id]);
  return (
    <div
      className={"mymy-ui mymy-x " + (dark ? "x-reference-dark" : "")}
      data-mymy="twitter"
    >
      <div className="kzxw">
        <header className="kzxh">
          <button aria-label="현재 앱 닫기" onClick={p.onBack}>
            <ArrowLeft />
          </button>
          <div className="kzxlg">𝕏</div>
          <button aria-label="X 테마 전환" onClick={() => setDark(!dark)}>
            <User />
          </button>
        </header>
        <div className="kzxtb">
          {["추천", "팔로잉", "추가 +", "시간"].map((t) => (
            <button
              className={t === tab ? "on" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "검색" && (
          <input
            className="mymy-search"
            aria-label="검색X"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색"
          />
        )}
        <div className="kzxfd">
          {p.items
            .filter((i) => (i.title + i.body).includes(query))
            .map((i) => (
              <article className="kzxt" key={i.id}>
                <Avatar name={i.sender} src={i.avatar} />
                <div className="kzxb">
                  <div className="kzxn">
                    <b>{i.sender}</b>
                    <small>
                      @{i.meta.handle || "user"} · {i.time.slice(-5)}
                    </small>
                    <em>
                      <MoreHorizontal size={18} />
                    </em>
                  </div>
                  <button
                    className="kzxx"
                    onClick={() => {
                      read(p, i);
                      p.onItem(i);
                    }}
                  >
                    {i.body}
                  </button>
                  {i.media && (
                    <button
                      className="kzxv"
                      aria-label="미디어 열기"
                      onClick={() => p.onItem(i)}
                    >
                      <Media item={i} />
                    </button>
                  )}
                  <div className="kzxac">
                    <button
                      aria-label={"댓글" + i.title}
                      onClick={() => p.onItem(i)}
                    >
                      <MessageCircle />
                      {i.comments.length}
                    </button>
                    <button
                      aria-label={"리포스트" + i.title}
                      aria-pressed={reposts.includes(i.id)}
                      onClick={() => toggle(i.id, reposts, setReposts)}
                    >
                      <Repeat2 />
                      {reposts.includes(i.id) ? 1 : 0}
                    </button>
                    <button
                      aria-label={"좋아요" + i.title}
                      aria-pressed={isLiked(i.id)}
                      onClick={() => {
                        toggle(i.id, likes, setLikes);
                        p.onUi?.("liked-" + i.id, !isLiked(i.id));
                      }}
                    >
                      <Heart fill={isLiked(i.id) ? "#f91880" : "none"} />
                      {i.likes + (isLiked(i.id) ? 1 : 0)}
                    </button>
                    <span>
                      <BarChart2 />
                      {i.meta.views || "—"}
                    </span>
                    <button
                      aria-label={"저장" + i.title}
                      aria-pressed={isSaved(i.id)}
                      onClick={() => {
                        toggle(i.id, marks, setMarks);
                        p.onUi?.("saved-" + i.id, !isSaved(i.id));
                      }}
                    >
                      <Bookmark />
                    </button>
                    <button aria-label="공유" onClick={() => p.onItem(i)}>
                      <Share />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          {!p.items.length && <Blank />}
        </div>
        <nav className="kzxnav">
          {[Home, Search, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={["시간线", "검색", "알림", "메시지"][n]}
              onClick={() => n < 2 && setTab(n ? "검색" : "추천")}
              disabled={n > 1}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
