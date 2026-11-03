import { useState } from "react";
import {
  ChevronLeft,
  MoreHorizontal,
  Share,
  Heart,
  Phone,
  MessageCircle,
  Video,
  Folder,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { RichText } from "../RichText";
import { safeMedia, type Item } from "../schema";
export const nativeDetailApps = new Set([
  "notes",
  "photos",
  "contacts",
  "phone",
  "calendar",
  "files",
  "safari",
]);
export function NativeDetail({
  app,
  item,
  back,
}: {
  app: string;
  item: Item;
  back: () => void;
}) {
  const [favorite, setFavorite] = useState(item.favorite),
    [copied, setCopied] = useState(false),
    [call, setCall] = useState(false);
  const media = safeMedia(item.media),
    name =
      app === "notes"
        ? "메모"
        : app === "contacts"
          ? "연락처"
          : app === "photos"
            ? "모든 사진"
            : app === "phone"
              ? "최근 통화"
              : app === "calendar"
                ? "캘린더"
                : app === "files"
                  ? "둘러보기"
                  : "책갈피";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.body);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={"native-detail native-detail-" + app}>
      <header className="app-nav">
        <button aria-label="뒤로" onClick={back}>
          <ChevronLeft size={24} />
          {name}
        </button>
        <strong>{app === "photos" ? item.time.slice(0, 10) : ""}</strong>
        <button aria-label="추가 작업" onClick={() => setCopied(!copied)}>
          <MoreHorizontal size={23} />
        </button>
      </header>
      {copied && (
        <div className="native-action-sheet">
          <button onClick={copy}>
            <Copy size={18} />
            텍스트 복사
          </button>
          <button onClick={() => setCopied(false)}>취소</button>
        </div>
      )}
      {app === "photos" ? (
        <>
          <div className="native-photo-stage">
            {media ? (
              <img src={media} alt={item.title} />
            ) : (
              <div className="native-photo-caption">
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            )}
          </div>
          <footer className="native-detail-toolbar">
            <button aria-label="사진 설명 공유" onClick={copy}>
              <Share />
            </button>
            <button
              aria-label="사진 즐겨찾기"
              onClick={() => setFavorite(!favorite)}
            >
              <Heart fill={favorite ? "#007aff" : "none"} />
            </button>
            <span>{copied ? "복사됨" : item.title}</span>
          </footer>
        </>
      ) : app === "contacts" || app === "phone" ? (
        <div className="native-detail-scroll">
          <div className="native-contact-hero">
            <span>{item.title.slice(0, 1)}</span>
            <h1>{item.title}</h1>
          </div>
          <div className="native-contact-actions">
            {[
              [MessageCircle, "메시지"],
              [Phone, "전화"],
              [Video, "영상 통화"],
            ].map(([Icon, label]) => {
              const Glyph = Icon as typeof Phone;
              return (
                <button key={String(label)} onClick={() => setCall(true)}>
                  <Glyph size={23} />
                  {String(label)}
                </button>
              );
            })}
          </div>
          <div className="native-detail-group">
            <small>휴대전화</small>
            <p className="native-blue">{item.meta.phone || "번호가 설정되지 않음"}</p>
          </div>
          <div className="native-detail-group">
            <small>메모</small>
            <p>{item.body}</p>
          </div>
          {call && (
            <div className="native-detail-group">
              <p>가상 시뮬레이션 · {item.title}</p>
              <button onClick={() => setCall(false)}>종료</button>
            </div>
          )}
        </div>
      ) : app === "notes" ? (
        <>
          <div className="native-detail-scroll native-note-paper">
            <time>{item.time}</time>
            <h1>{item.title}</h1>
            <RichText value={item.richText} fallback={item.body} />
          </div>
          <footer className="native-detail-toolbar">
            <button aria-label="뒤로文件夹" onClick={back}>
              <Folder />
            </button>
            <span />
            <button aria-label="复制메모" onClick={copy}>
              {copied ? <Check /> : <Share />}
            </button>
          </footer>
        </>
      ) : app === "calendar" ? (
        <div className="native-detail-scroll native-event-paper">
          <h1>{item.title}</h1>
          <p>{item.time}</p>
          <div className="native-detail-group">
            <small>일정</small>
            <p>{item.body}</p>
          </div>
          {Object.entries(item.meta).map(([k, v]) => (
            <div className="native-detail-group" key={k}>
              <small>{k}</small>
              <p>{v}</p>
            </div>
          ))}
        </div>
      ) : app === "safari" ? (
        <>
          <div className="native-detail-scroll native-reader">
            <h1>{item.title}</h1>
            <RichText value={item.richText} fallback={item.body} />
          </div>
          <footer className="native-reader-address">
            <Search size={16} />
            <span>{item.meta.url || item.title}</span>
            <Share size={18} />
          </footer>
        </>
      ) : (
        <div className="native-detail-scroll native-file-preview">
          <Folder size={64} color="#007aff" />
          <h2>{item.title}</h2>
          <p>{item.body}</p>
          <small>{item.time}</small>
          <button onClick={copy}>콘텐츠 복사</button>
        </div>
      )}
    </div>
  );
}
