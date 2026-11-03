export { WeatherSkin, HealthSkin } from "./CalibratedSystemApps";
import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  Calendar,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Folder,
  Globe,
  Grid,
  Heart,
  Image,
  LockKeyhole,
  MapPin,
  Music,
  Phone,
  Search,
  SkipForward,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { download } from "../io";
import { safeMedia, type Item } from "../schema";
import {
  Add,
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  Row,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
export function PhoneSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "최근 통화");
  const [digits, setDigits] = useState(""),
    [call, setCall] = useState("");
  const list = tab === "즐겨찾기" ? items.filter((i) => i.favorite) : items;
  return (
    <div className="catalog-skin native-phone">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        {tab === "키패드" ? (
          <div className="dialer">
            <output>{digits || "번호 입력"}</output>
            <div>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
                (k) => (
                  <button key={k} onClick={() => setDigits((s) => s + k)}>
                    {k}
                    <small>
                      {
                        (
                          {
                            "2": "ABC",
                            "3": "DEF",
                            "4": "GHI",
                            "5": "JKL",
                            "6": "MNO",
                            "7": "PQRS",
                            "8": "TUV",
                            "9": "WXYZ",
                          } as Record<string, string>
                        )[k]
                      }
                    </small>
                  </button>
                ),
              )}
            </div>
            <button
              className="dial-call"
              disabled={!digits}
              aria-label="가상 전화 걸기"
              onClick={() => {
                setCall(digits);
                const i = items.find((i) => meta(i, "number") === digits);
                if (i) p.onRead(i.id);
              }}
            >
              <Phone size={24} />
            </button>
            <button onClick={() => setDigits((s) => s.slice(0, -1))}>
              삭제
            </button>
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            {list.map((i) => (
              <button
                className={`call-row ${meta(i, "status") === "부재중" ? "missed" : ""}`}
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <Phone size={17} />
                <span>
                  <strong>{i.title}</strong>
                  <small>
                    {meta(i, "number", i.sender)} ·{" "}
                    {meta(i, "status", "통화 기록")}
                  </small>
                </span>
                <time>{i.time.slice(5, 10)}</time>
              </button>
            ))}
            <Empty items={list} />
          </>
        )}
      </div>
      <Tabs
        tabs={["즐겨찾기", "최근 통화", "연락처", "키패드"]}
        value={tab}
        set={setTab}
        icons={[<Star />, <Clock />, <Users />, <Grid />]}
      />
      {call && (
        <div className="virtual-call">
          <small>가상 통화</small>
          <Avatar name={call} />
          <h2>{call}</h2>
          <p>스토리 안에서 진행되는 가상 통화입니다</p>
          <button aria-label="끊기" onClick={() => setCall("")}>
            <Phone />
          </button>
        </div>
      )}
    </div>
  );
}
export function ContactsSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "모든 연락처");
  return (
    <div className="catalog-skin native-contacts">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>연락처</h1>
        <SearchBox value={q} set={setQ} />
        <button
          className="contact-self"
          onClick={() => {
            if (items[0]) p.onItem(items[0]);
            else if (p.creator) p.onAdd();
          }}
        >
          <Avatar name={p.owner ?? "나"} />
          <span>
            <strong>{p.owner ?? "내 명함"}</strong>
            <small>내 명함</small>
          </span>
        </button>
        {groupItems(items, "모든 연락처").map((g) => (
          <section key={g}>
            <h4 className="native-section">{g}</h4>
            {items
              .filter((i) => (i.folder || "모든 연락처") === g)
              .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"))
              .map((i) => (
                <Row
                  key={i.id}
                  item={i}
                  onItem={p.onItem}
                  leading={<Avatar name={i.title} />}
                />
              ))}
          </section>
        ))}
        <Empty items={items} />
      </div>
    </div>
  );
}
export function PhotosSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "라이브러리");
  const [album, setAlbum] = useState("");
  const list =
    tab === "즐겨찾기"
      ? items.filter((i) => i.favorite)
      : album
        ? items.filter((i) => (i.folder || "분류되지 않음") === album)
        : items;
  return (
    <div className="catalog-skin native-photos">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{album || tab}</h1>
        {tab === "앨범" && !album ? (
          <div className="album-grid">
            {groupItems(items, "분류되지 않음").map((g) => (
              <button key={g} onClick={() => setAlbum(g)}>
                <Media
                  item={items.find((i) => (i.folder || "분류되지 않음") === g)!}
                />
                <strong>{g}</strong>
                <small>
                  {items.filter((i) => (i.folder || "분류되지 않음") === g).length} 개
                </small>
              </button>
            ))}
          </div>
        ) : (
          <>
            <SearchBox value={q} set={setQ} />
            <div className="photo-mosaic">
              {list.map((i) => (
                <button
                  aria-label={`보기${i.title}`}
                  key={i.id}
                  onClick={() => p.onItem(i)}
                >
                  <Media item={i} />
                  {i.favorite && <Heart size={12} fill="white" />}
                </button>
              ))}
            </div>
            <p className="media-count">{list.length} 개 항목</p>
          </>
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["라이브러리", "앨범", "즐겨찾기"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setAlbum("");
        }}
        icons={[<Image />, <Folder />, <Heart />]}
      />
    </div>
  );
}
export function CameraSkin(p: Props) {
  const [mode, setMode] = useState("사진"),
    [index, setIndex] = useState(0);
  const frames = p.items.filter((i) =>
    mode === "비디오" ? i.kind === "video" : i.kind !== "video",
  );
  const frame = frames[index % Math.max(frames.length, 1)];
  return (
    <div className="catalog-skin native-camera">
      <Header p={p} />
      <div className="camera-top">
        <span>플래시 꺼짐</span>
        <span>{mode === "비디오" ? "HD · 30" : "4:3"}</span>
      </div>
      <div className="camera-view">
        {frame ? <Media item={frame} /> : <p>카메라 화면이 설정되지 않았습니다</p>}
        <div className="camera-grid" />
      </div>
      <div className="camera-mode">
        {["비디오", "사진"].map((m) => (
          <button
            className={mode === m ? "selected" : ""}
            key={m}
            onClick={() => {
              setMode(m);
              setIndex(0);
            }}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="camera-controls">
        <button
          aria-label="이전 화면 보기"
          disabled={!frames.length}
          onClick={() => setIndex((i) => (i + 1) % frames.length)}
        >
          <Image size={24} />
        </button>
        <button
          className="camera-shutter"
          aria-label={p.creator ? "촬영 화면 편집" : "촬영 콘텐츠 보기"}
          disabled={!p.creator && !frame}
          onClick={() => (p.creator ? p.onAdd() : frame && p.onItem(frame))}
        >
          <span />
        </button>
        <button
          aria-label="카메라 화면 전환"
          disabled={frames.length < 2}
          onClick={() => setIndex((i) => i + 1)}
        >
          <Camera size={24} />
        </button>
      </div>
      <small className="camera-caption">제작자가 설정한 가상 카메라 화면</small>
    </div>
  );
}
export function SafariSkin(p: Props) {
  const [q, setQ] = useState(""),
    [tab, setTab] = useState("방문 기록");
  const items = p.items
    .filter((i) =>
      (i.title + i.body + meta(i, "url"))
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .filter((i) =>
      tab === "책갈피"
        ? i.favorite || i.folder !== "방문 기록"
        : i.folder === "방문 기록",
    );
  return (
    <div className="catalog-skin native-safari">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        <div className="safari-favorites">
          {items.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <span>
                <Globe size={28} />
              </span>
              <strong>{i.title}</strong>
              <small>{meta(i, "url")}</small>
            </button>
          ))}
        </div>
        <Empty items={items} label="일치하는 가상 웹페이지가 없습니다" />
      </div>
      <label className="safari-address">
        <LockKeyhole size={13} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="검색어 또는 웹 주소 입력"
          aria-label="주소 표시줄"
          onKeyDown={(e) => {
            if (e.key === "Enter" && items[0]) p.onItem(items[0]);
          }}
        />
        <Search size={16} />
      </label>
      <Tabs
        tabs={["책갈피", "방문 기록"]}
        value={tab}
        set={setTab}
        icons={[<Globe />, <Clock />]}
      />
    </div>
  );
}
export function NotesSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "메모");
  const [folder, setFolder] = useState<string | null>(null);
  const list = folder
    ? items.filter((i) => (i.folder || "메모") === folder)
    : items;
  return (
    <div className="catalog-skin native-notes">
      <Header p={p} />
      <div className="catalog-scroll">
        <button className="notes-back" onClick={() => setFolder(null)}>
          <Folder size={17} />
          폴더
        </button>
        <h1>{folder || "모든 메모"}</h1>
        <SearchBox value={q} set={setQ} />
        {!folder && (
          <div className="note-folders">
            {groupItems(items, "메모").map((g) => (
              <button key={g} onClick={() => setFolder(g)}>
                <Folder size={17} />
                {g}
                <small>
                  {items.filter((i) => (i.folder || "메모") === g).length}
                </small>
              </button>
            ))}
          </div>
        )}
        <div className="notes-list">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <strong>
                {i.password && <LockKeyhole size={12} />} {i.title}
              </strong>
              <p>
                <time>{i.time.slice(5, 10)}</time>{" "}
                {i.password ? "잠긴 메모" : i.body.split("\n")[0]}
              </p>
              <small>{i.folder}</small>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <div className="notes-footer">
        <span>{list.length} 개 메모</span>
        <Add p={p} label="새 메모" />
      </div>
    </div>
  );
}
export function CalendarSkin(p: Props) {
  const [month, setMonth] = useState(8),
    [year, setYear] = useState(2026),
    [day, setDay] = useState(1);
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const list = p.items.filter((i) =>
    i.time.startsWith(`${prefix}-${String(day).padStart(2, "0")}`),
  );
  const move = (d: number) => {
    const date = new Date(Date.UTC(year, month + d, 1));
    setYear(date.getUTCFullYear());
    setMonth(date.getUTCMonth());
    setDay(1);
  };
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay(),
    days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return (
    <div className="catalog-skin native-calendar">
      <Header p={p} />
      <div className="catalog-scroll">
        <div className="month-title">
          <button aria-label="지난달" onClick={() => move(-1)}>
            <ChevronLeft />
          </button>
          <h2>
            {year} 년 {month + 1} 월
          </h2>
          <button aria-label="다음 달" onClick={() => move(1)}>
            <ChevronRight />
          </button>
        </div>
        <div className="calendar-grid">
          {["일", "월", "화", "수", "목", "금", "토"].map((t) => (
            <small key={t}>{t}</small>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <span key={"blank" + i} />
          ))}
          {Array.from({ length: days }, (_, i) => (
            <button
              className={day === i + 1 ? "selected" : ""}
              key={i}
              onClick={() => setDay(i + 1)}
            >
              {i + 1}
              {p.items.some((x) =>
                x.time.startsWith(
                  `${prefix}-${String(i + 1).padStart(2, "0")}`,
                ),
              ) && <i />}
            </button>
          ))}
        </div>
        <h4 className="native-section">
          {month + 1} 월 {day} 일
        </h4>
        {list.map((i) => (
          <button
            className="calendar-event"
            key={i.id}
            onClick={() => p.onItem(i)}
          >
            <time>{i.time.slice(-5)}</time>
            <div>
              <strong>{i.title}</strong>
              <p>{meta(i, "location", i.body)}</p>
            </div>
          </button>
        ))}
        <Empty items={list} label="오늘 일정이 없습니다" />
        <Add p={p} label="일정 추가" />
      </div>
    </div>
  );
}
export function MailSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "받은 편지함");
  const list = items.filter(
    (i) =>
      tab === "모든 메일" ||
      i.folder === tab ||
      (tab === "받은 편지함" &&
        (!i.folder || !["임시 보관함", "보낸 편지함"].includes(i.folder))),
  );
  return (
    <div className="catalog-skin native-mail">
      <Header p={p} />
      <div className="mail-folders">
        {["받은 편지함", "임시 보관함", "보낸 편지함", "모든 메일"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        <SearchBox value={q} set={setQ} />
        {list.map((i) => (
          <button
            className="mail-preview"
            key={i.id}
            onClick={() => p.onItem(i)}
          >
            <i className={!i.read ? "unread" : ""} />
            <div>
              <strong>{i.sender}</strong>
              <h3>{i.title}</h3>
              <p>{i.body}</p>
            </div>
            <time>{i.time.slice(5, 10)}</time>
          </button>
        ))}
        <Empty items={list} />
      </div>
      <footer className="mail-footer">
        <span>{list.length} 개 메일</span>
        <Add p={p} label="메일 작성" />
      </footer>
    </div>
  );
}
export function ClockSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "알람");
  const [enabled, setEnabled] = useSkinState<string[]>(p, "alarms", []),
    [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return (
    <div className="catalog-skin native-clock">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        {tab === "스톱워치" ? (
          <div className="stopwatch">
            <output>
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </output>
            <div>
              <button
                onClick={() => {
                  setSeconds(0);
                  setRunning(false);
                }}
              >
                재설정
              </button>
              <button onClick={() => setRunning(!running)}>
                {running ? "일시 정지" : "시작"}
              </button>
            </div>
          </div>
        ) : (
          items.map((i) => (
            <div className="alarm-row" key={i.id}>
              <button onClick={() => p.onItem(i)}>
                <time>{meta(i, "clock", i.time.slice(-5))}</time>
                <small>
                  {tab === "세계 시계" ? meta(i, "city", i.title) : i.title}
                </small>
              </button>
              {tab === "알람" ? (
                <button
                  role="switch"
                  aria-label={`알람${i.title}`}
                  aria-checked={enabled.includes(i.id)}
                  className={`native-switch ${enabled.includes(i.id) ? "on" : ""}`}
                  onClick={() =>
                    setEnabled(
                      enabled.includes(i.id)
                        ? enabled.filter((x) => x !== i.id)
                        : [...enabled, i.id],
                    )
                  }
                >
                  <span />
                </button>
              ) : (
                <Clock size={35} />
              )}
            </div>
          ))
        )}
      </div>
      <Tabs
        tabs={["세계 시계", "알람", "스톱워치"]}
        value={tab}
        set={setTab}
        icons={[<Globe />, <Clock />, <Clock />]}
      />
    </div>
  );
}
export function RemindersSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "전체");
  const [checked, setChecked] = useSkinState<string[]>(p, "checked", []);
  const list =
    tab === "완료됨"
      ? items.filter((i) => checked.includes(i.id))
      : items.filter((i) => !checked.includes(i.id));
  return (
    <div className="catalog-skin native-reminders">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        <div className="reminder-categories">
          {["전체", "완료됨"].map((t) => (
            <button key={t} onClick={() => setTab(t)}>
              <Calendar size={22} />
              <strong>
                {t === "전체" ? items.length - checked.length : checked.length}
              </strong>
              <span>{t}</span>
            </button>
          ))}
        </div>
        <h1>{tab}</h1>
        {list.map((i) => (
          <div className="reminder-row" key={i.id}>
            <button
              aria-label={`완료: ${i.title}`}
              role="checkbox"
              aria-checked={checked.includes(i.id)}
              onClick={() =>
                setChecked(
                  checked.includes(i.id)
                    ? checked.filter((x) => x !== i.id)
                    : [...checked, i.id],
                )
              }
            >
              <CheckCircle size={21} />
            </button>
            <button onClick={() => p.onItem(i)}>
              <strong>{i.title}</strong>
              <small>
                {i.time} · {i.folder}
              </small>
            </button>
          </div>
        ))}
        <Add p={p} label="새 미리 알림" />
      </div>
    </div>
  );
}
export function FilesSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "최근 항목");
  const [folder, setFolder] = useState("");
  const list = folder
    ? items.filter((i) => (i.folder || "나의 iPhone") === folder)
    : items;
  return (
    <div className="catalog-skin native-files">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{folder || tab}</h1>
        <SearchBox value={q} set={setQ} />
        {tab === "둘러보기" && !folder ? (
          <div className="file-folders">
            {groupItems(items, "나의 iPhone").map((g) => (
              <button key={g} onClick={() => setFolder(g)}>
                <Folder size={45} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
        ) : (
          <div className="file-grid">
            {list.map((i) => (
              <div key={i.id}>
                <button onClick={() => p.onItem(i)}>
                  {i.media ? <Media item={i} /> : <FileText size={49} />}
                  <strong>{i.title}</strong>
                  <small>
                    {meta(i, "extension", "파일")} ·{" "}
                    {meta(i, "size", i.time.slice(0, 10))}
                  </small>
                </button>
                <button
                  aria-label={`${i.title} 텍스트 다운로드`}
                  onClick={() =>
                    download(
                      new Blob([i.body], { type: "text/plain" }),
                      `${i.title}.txt`,
                    )
                  }
                >
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["최근 항목", "둘러보기"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setFolder("");
        }}
        icons={[<Clock />, <Folder />]}
      />
    </div>
  );
}
export function MusicSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "보관함");
  const [song, setSong] = useTrack(p, items);
  return (
    <div className="catalog-skin native-music">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>{tab}</h1>
        {tab === "플레이리스트" ? (
          <div className="music-albums">
            {groupItems(items, "내 음악").map((g) => (
              <button
                key={g}
                onClick={() => {
                  const i = items.find((i) => (i.folder || "내 음악") === g);
                  if (i) setSong(i);
                }}
              >
                <Music size={51} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
        ) : (
          items.map((i, n) => (
            <button
              className="music-track"
              key={i.id}
              onClick={() => {
                setSong(i);
              }}
            >
              <small>{n + 1}</small>
              <span>
                <strong>{i.title}</strong>
                <small>
                  {i.sender} · {meta(i, "album")}
                </small>
              </span>
              <span>{meta(i, "duration")}</span>
            </button>
          ))
        )}
        <Empty items={items} />
      </div>
      {song && (
        <div className="native-now-playing">
          <button onClick={() => p.onItem(song)}>
            <Music size={20} />
            {song.title}
          </button>
          {song.kind === "audio" && safeMedia(song.media) ? (
            <AudioPlayer p={p} item={song} />
          ) : (
            <button onClick={() => p.onItem(song)}>노래 정보 보기</button>
          )}
          <button
            aria-label="다음 곡"
            onClick={() =>
              setSong(
                items[
                  (items.findIndex((i) => i.id === song.id) + 1) % items.length
                ],
              )
            }
          >
            <SkipForward size={18} />
          </button>
        </div>
      )}
      <Tabs
        tabs={["보관함", "플레이리스트"]}
        value={tab}
        set={setTab}
        icons={[<Music />, <Folder />]}
      />
    </div>
  );
}
function LocationMap({
  items,
  onItem,
  find = false,
}: {
  items: Item[];
  onItem: (i: Item) => void;
  find?: boolean;
}) {
  return (
    <div className={`fiction-map ${find ? "find-map" : ""}`}>
      <svg viewBox="0 0 300 300" aria-label="가상 지도">
        <rect width="300" height="300" fill="#e4e5d8" />
        {[35, 100, 190, 260].map((n) => (
          <path
            key={n}
            d={`M0 ${n} H300 M${n} 0 V300`}
            stroke="#fff"
            strokeWidth="11"
          />
        ))}
        <path
          d="M20 0 Q190 110 120 300"
          stroke="#b6d8df"
          strokeWidth="24"
          fill="none"
        />
        <rect x="205" y="112" width="42" height="65" rx="7" fill="#bdcfac" />
      </svg>
      {items.map((i, n) => (
        <button
          key={i.id}
          aria-label={`지도 위치: ${i.title}`}
          className="map-pin"
          style={{
            left: `${Math.max(5, Math.min(90, Number(meta(i, "x", String(20 + ((n * 17) % 65))))))}%`,
            top: `${Math.max(8, Math.min(80, Number(meta(i, "y", String(25 + ((n * 13) % 50))))))}%`,
          }}
          onClick={() => onItem(i)}
        >
          {find ? <Avatar name={i.title} /> : <MapPin size={24} />}
        </button>
      ))}
    </div>
  );
}
export function MapsSkin(p: Props) {
  const { q, setQ, items } = useContent(p, "장소");
  return (
    <div className="catalog-skin native-maps">
      <Header p={p} />
      <LocationMap items={items} onItem={p.onItem} />
      <div className="map-sheet">
        <SearchBox value={q} set={setQ} placeholder="가상 장소 검색" />
        <div className="map-places">
          {items.map((i) => (
            <Row key={i.id} item={i} onItem={p.onItem} leading={<MapPin />} />
          ))}
        </div>
      </div>
    </div>
  );
}
export function WalletSkin(p: Props) {
  const [selected, setSelected] = useState("");
  const cards = p.items.filter((i) => i.folder !== "거래"),
    transactions = p.items.filter((i) => i.folder === "거래");
  return (
    <div className="catalog-skin native-wallet">
      <Header p={p} />
      <div className="catalog-scroll">
        <h1>지갑</h1>
        <div className="wallet-stack">
          {cards.map((i, n) => (
            <button
              key={i.id}
              className={selected === i.id ? "selected" : ""}
              style={{
                background: ["#252d38", "#716456", "#4a655d", "#735e6b"][n % 4],
              }}
              onClick={() => {
                setSelected(i.id);
                p.onItem(i);
              }}
            >
              <strong>{i.title}</strong>
              <span>{meta(i, "number", "••••")}</span>
              <small>{meta(i, "amount", i.sender)}</small>
            </button>
          ))}
        </div>
        <h4 className="native-section">거래 기록</h4>
        {transactions.map((i) => (
          <Row key={i.id} item={i} onItem={p.onItem} leading={<Wallet />}>
            <strong>{meta(i, "amount")}</strong>
          </Row>
        ))}
        <Empty items={p.items} />
      </div>
    </div>
  );
}
export function FindSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "기기");
  const list = items.filter((i) =>
    tab === "기기" ? i.folder !== "사람" : i.folder === "사람",
  );
  return (
    <div className="catalog-skin native-find">
      <Header p={p} />
      <LocationMap items={list} onItem={p.onItem} find />
      <div className="find-sheet">
        <h2>{tab}</h2>
        {list.map((i) => (
          <Row
            key={i.id}
            item={i}
            onItem={p.onItem}
            leading={<Avatar name={i.title} />}
          >
            {meta(i, "status", "위치 기록")}
          </Row>
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["사람", "기기"]}
        value={tab}
        set={setTab}
        icons={[<Users />, <MapPin />]}
      />
    </div>
  );
}
