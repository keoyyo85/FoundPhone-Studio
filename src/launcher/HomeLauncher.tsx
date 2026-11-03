import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import {
  Search,
  Plus,
  Minus,
  ChevronLeft,
  Grip,
  Clock,
  CloudSun,
  Battery,
  Download,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { AppDock } from "../vendor/ios-web/Launcher";
import { category } from "../apps";
import type { Work } from "../schema";
import {
  homeEntries,
  packHome,
  moveHome,
  type HomeEntry,
  type DeviceLayout,
  type AppConfig,
  type Widget,
} from "./layout";
type Props = {
  work: Work;
  storeOpen?: boolean;
  closeStore?: () => void;
  layout: DeviceLayout;
  change: (fn: (l: DeviceLayout) => void) => void;
  importLayout: (v: unknown) => void;
  error: string;
  open: (id: string) => void;
  onFolder: (name: string) => void;
  search: () => void;
  icon: (app: AppConfig, small?: boolean) => ReactNode;
  time: string;
  clearApp: (id: string) => void;
};
const widgetLabels = {
  calendar: "캘린더",
  clock: "시계",
  weather: "날씨",
  notes: "메모",
  battery: "배터리",
};
const widgetApp = {
  calendar: "calendar",
  clock: "clock",
  weather: "weather",
  notes: "notes",
  battery: "settings",
};
function WidgetFace({
  widget,
  work,
  time,
}: {
  widget: Widget;
  work: Work;
  time: string;
}) {
  const date = new Date((work.phone.date || "2026-10-25") + "T12:00:00Z");
  const weather = work.data.weather?.[0];
  return (
    <div className={"widget-face widget-" + widget.type}>
      {widget.type === "calendar" ? (
        <>
          <span className="widget-red">
            {new Intl.DateTimeFormat("zh-CN", {
              weekday: "long",
              timeZone: "UTC",
            }).format(date)}
          </span>
          <b className="widget-day">{date.getUTCDate()}</b>
          <small>{work.data.calendar?.[0]?.title || "오늘 일정이 없습니다"}</small>
        </>
      ) : widget.type === "clock" ? (
        <>
          <Clock size={31} />
          <b>{time}</b>
          <small>시계</small>
        </>
      ) : widget.type === "weather" ? (
        <>
          <small>{weather?.title || "도시를 추가하지 않았습니다"}</small>
          <b>{weather?.meta.temperature || "—"}°</b>
          <CloudSun size={27} />
          <small>{weather?.meta.condition || "날씨 정보 없음"}</small>
        </>
      ) : widget.type === "notes" ? (
        <>
          <strong>메모</strong>
          {(work.data.notes || [])
            .filter((i) => !i.hidden && !i.password)
            .slice(0, 3)
            .map((i) => (
              <small key={i.id}>{i.title}</small>
            ))}
          {!(work.data.notes || []).some((i) => !i.hidden && !i.password) && (
            <small>无메모</small>
          )}
        </>
      ) : (
        <>
          <Battery size={44} />
          <b>{work.phone.battery}%</b>
          <small>배터리</small>
        </>
      )}
    </div>
  );
}
export function HomeLauncher(p: Props) {
  const [editing, setEditing] = useState(false),
    [sheet, setSheet] = useState(p.storeOpen ? "library" : ""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("전체"),
    [selected, setSelected] = useState(""),
    [uninstall, setUninstall] = useState(false),
    [keep, setKeep] = useState(true),
    [page, setPage] = useState(0),
    [error, setError] = useState(""),
    [ghost, setGhost] = useState<{
      entry: HomeEntry;
      x: number;
      y: number;
    } | null>(null),
    [widgetType, setWidgetType] = useState<Widget["type"]>("calendar"),
    [size, setSize] = useState<Widget["size"]>("small");
  const root = useRef<HTMLDivElement>(null),
    pager = useRef<HTMLDivElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    edge = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    drag = useRef<{
      entry: HomeEntry;
      x: number;
      y: number;
      started: number;
      active: boolean;
      target: string;
      hover: number;
      pointer: number;
    } | null>(null),
    suppress = useRef(false),
    swipe = useRef<{
      pointer: number;
      x: number;
      y: number;
      left: number;
      started: number;
      active: boolean;
    } | null>(null);
  const pages = packHome(homeEntries(p.layout), p.layout.positions),
    apps = p.layout.apps,
    active = apps.find((a) => a.id === selected);
  if (editing && pages.length < 20) pages.push([]);
  const beginSwipe = (e: PointerEvent<HTMLDivElement>) => {
    if (
      editing ||
      e.button !== 0 ||
      !(e.target as HTMLElement).closest(".home-pages")
    )
      return;
    const el = pager.current;
    if (!el) return;
    swipe.current = {
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: el.scrollLeft,
      started: Date.now(),
      active: false,
    };
    el.setPointerCapture(e.pointerId);
  };
  const moveSwipe = (e: PointerEvent<HTMLDivElement>) => {
    const gesture = swipe.current,
      el = pager.current;
    if (!gesture || !el || gesture.pointer !== e.pointerId || editing) return;
    const dx = e.clientX - gesture.x,
      dy = e.clientY - gesture.y;
    if (!gesture.active) {
      if (Date.now() - gesture.started >= 450) return;
      if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
      gesture.active = true;
      clearTimeout(timer.current);
      drag.current = null;
      suppress.current = true;
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
    }
    e.preventDefault();
    e.stopPropagation();
    const scale = el.getBoundingClientRect().width / el.clientWidth;
    el.scrollLeft = gesture.left - dx / scale;
  };
  const finishSwipe = (e: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const gesture = swipe.current,
      el = pager.current;
    if (!gesture || gesture.pointer !== e.pointerId) return;
    swipe.current = null;
    if (!gesture.active || !el) return;
    clearTimeout(timer.current);
    e.stopPropagation();
    const dx = e.clientX - gesture.x;
    const origin = Math.round(gesture.left / el.clientWidth);
    const step =
      !cancelled && Math.abs(dx) > el.getBoundingClientRect().width * 0.14
        ? dx < 0
          ? 1
          : -1
        : 0;
    const next = Math.max(0, Math.min(pages.length - 1, origin + step));
    el.style.scrollSnapType = "";
    el.style.scrollBehavior = "";
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setPage(next);
  };
  const patch = (id: string, fn: (a: AppConfig) => void) =>
    p.change((l) => {
      const a = l.apps.find((a) => a.id === id);
      if (a) fn(a);
    });

  const start = (e: PointerEvent<HTMLButtonElement>, entry: HomeEntry) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    suppress.current = false;
    drag.current = {
      entry,
      x: e.clientX,
      y: e.clientY,
      started: Date.now(),
      active: false,
      target: "",
      hover: 0,
      pointer: e.pointerId,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    timer.current = setTimeout(() => {
      setEditing(true);
      suppress.current = true;
    }, 500);
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const d = drag.current;
    if (!d) return;
    const distance = Math.hypot(e.clientX - d.x, e.clientY - d.y);
    if (distance > 7 && (editing || Date.now() - d.started > 450)) {
      d.active = true;
      suppress.current = true;
      clearTimeout(timer.current);
      setEditing(true);
      const r = root.current!.getBoundingClientRect(),
        scale = r.width / 393;
      setGhost({
        entry: d.entry,
        x: (e.clientX - r.left) / scale,
        y: (e.clientY - r.top) / scale,
      });
      const hit = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-home-key],[data-drop-zone]");
      let target = hit?.dataset.homeKey || hit?.dataset.dropZone || "";
      if (target.startsWith("page:") && hit) {
        const box = hit.getBoundingClientRect();
        const x = Math.max(
            0,
            Math.min(
              3,
              Math.floor(
                (e.clientX - box.left - 16 * scale) / ((361 / 4) * scale),
              ),
            ),
          ),
          y = Math.max(
            0,
            Math.min(5, Math.floor((e.clientY - box.top) / (99 * scale))),
          );
        target = `cell:${target.slice(5)}:${x}:${y}`;
      }
      if (target !== d.target) {
        d.target = target;
        d.hover = Date.now();
      }
      const near =
        e.clientX < r.left + 22 ? -1 : e.clientX > r.right - 22 ? 1 : 0;
      if (near && !edge.current)
        edge.current = setTimeout(() => {
          const next = Math.max(0, Math.min(pages.length - 1, page + near));
          pager.current?.scrollTo({
            left: next * pager.current.clientWidth,
            behavior: "smooth",
          });
          setPage(next);
          if (drag.current) {
            drag.current.target = "";
            drag.current.hover = Date.now();
          }
          edge.current = undefined;
        }, 550);
      if (!near) {
        clearTimeout(edge.current);
        edge.current = undefined;
      }
    } else if (distance > 10) clearTimeout(timer.current);
  };
  const end = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    clearTimeout(timer.current);
    clearTimeout(edge.current);
    edge.current = undefined;
    const d = drag.current;
    drag.current = null;
    setGhost(null);
    if (!d?.active) return;
    const target = d.target;
    if (!target || target === d.entry.key) return;
    if (
      (target === "dock" || target.startsWith("dock:")) &&
      !apps.find((a) => a.id === d.entry.key)?.dock &&
      apps.filter((a) => a.dock && a.visible && a.installed).length >= 4
    ) {
      setError("Dock에는 앱을 최대 4개까지 놓을 수 있습니다");
      return;
    }
    p.change((l) => {
      const a = l.apps.find((a) => a.id === d.entry.key);
      if (target.startsWith("cell:")) {
        const [, pg, cx, cy] = target.split(":").map(Number);
        const w = d.entry.widget
            ? d.entry.widget.size === "small"
              ? 2
              : 4
            : 1,
          h = d.entry.widget ? (d.entry.widget.size === "large" ? 4 : 2) : 1;
        if (pg > 19 || cx + w > 4 || cy + h > 6) return;
        const other =
          packHome(
            homeEntries(l).filter((e) => e.key !== d.entry.key),
            l.positions,
          )[pg] || [];
        if (
          other.some(
            (e) =>
              cx < e.x + e.w && cx + w > e.x && cy < e.y + e.h && cy + h > e.y,
          )
        )
          return;
        if (a) {
          a.dock = false;
          a.folder = "";
        }
        l.positions[d.entry.key] = { page: pg, x: cx, y: cy };
        return;
      }
      if (target === "dock" || target.startsWith("dock:")) {
        if (!a) return;
        const count = l.apps.filter(
          (x) => x.dock && x.visible && x.installed,
        ).length;
        if (!a.dock && count >= 4) {
          return;
        }
        delete l.positions[d.entry.key];
        a.dock = true;
        a.folder = "";
        a.visible = true;
        if (target.startsWith("dock:")) {
          const from = l.apps.findIndex((x) => x.id === a.id),
            to = l.apps.findIndex((x) => x.id === target.slice(5));
          if (from >= 0 && to >= 0 && from !== to) {
            const [moved] = l.apps.splice(from, 1);
            l.apps.splice(to, 0, moved);
          }
        }
        return;
      }
      if (a) {
        a.dock = false;
        a.folder = "";
      }
      if (target.startsWith("folder:") && a) {
        a.folder = target.slice(7);
        delete l.positions[a.id];
        return;
      }
      const other = l.apps.find((x) => x.id === target);
      if (a && other && Date.now() - d.hover > 650) {
        const folder = "폴더";
        a.folder = folder;
        other.folder = folder;
        other.dock = false;
        delete l.positions[a.id];
        delete l.positions[other.id];
        return;
      }
      delete l.positions[d.entry.key];
      delete l.positions[target];
      moveHome(l, d.entry.key, target);
    });
  };
  const click = (entry: HomeEntry) => {
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    if (editing) {
      if (entry.app) {
        setSelected(entry.app.id);
        setSheet("actions");
      } else if (entry.widget) {
        setSelected(entry.widget.id);
        setSheet("widget-actions");
      } else p.onFolder(entry.folder!);
      return;
    }
    if (entry.app?.id === "appstore" && p.storeOpen) {
      setSheet("library");
      return;
    }
    if (entry.app) p.open(entry.app.id);
    else if (entry.folder) p.onFolder(entry.folder);
    else if (entry.widget) p.open(widgetApp[entry.widget.type]);
  };
  const cell = (entry: HomeEntry, dock = false) => (
    <button
      key={entry.key}
      className={"launcher-cell " + (entry.widget ? "launcher-widget" : "")}
      data-home-key={dock ? "dock:" + entry.key : entry.key}
      data-app-id={entry.app?.id}
      aria-label={
        entry.app
          ? "열기" + entry.app.name
          : entry.folder
            ? "열기폴더" + entry.folder
            : widgetLabels[entry.widget!.type] + "위젯"
      }
      onPointerDown={(e) => start(e, entry)}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={() => {
        clearTimeout(timer.current);
        drag.current = null;
        setGhost(null);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setEditing(true);
        if (entry.app) {
          setSelected(entry.app.id);
          setSheet("actions");
        }
      }}
      onClick={() => click(entry)}
    >
      {entry.app ? (
        p.icon({ ...entry.app, ...(dock ? { name: "" } : {}) })
      ) : entry.widget ? (
        <WidgetFace widget={entry.widget} work={p.work} time={p.time} />
      ) : (
        <span className="app-icon-wrap">
          <span className="folder-icon">
            {apps
              .filter((a) => a.installed && a.folder === entry.folder)
              .slice(0, 9)
              .map((a) => p.icon(a, true))}
          </span>
          <span className="app-name">{entry.folder}</span>
        </span>
      )}
      {editing && (
        <span className="launcher-remove">
          <Minus size={12} />
        </span>
      )}
    </button>
  );
  const addWidget = () => {
    if (p.layout.widgets.length >= 24) {
      setError("위젯은 최대 24개까지 추가할 수 있습니다");
      return;
    }
    p.change((l) => {
      const widget = {
        id: "widget-" + crypto.randomUUID(),
        type: widgetType,
        size,
      };
      l.widgets.push(widget);
      l.order = [
        widget.id,
        ...homeEntries(l)
          .map((e) => e.key)
          .filter((k) => k !== widget.id),
      ];
      const app = l.apps.find((a) => a.id === widgetApp[widgetType]);
      if (app) {
        app.installed = true;
        app.visible = true;
      }
    });
    setSheet("");
    setEditing(true);
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(p.layout, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "phone-layout.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <motion.div
      ref={root}
      className={
        "home-screen interactive-home " + (editing ? "home-editing" : "")
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onPointerDownCapture={beginSwipe}
      onPointerMoveCapture={moveSwipe}
      onPointerUpCapture={(e) => finishSwipe(e)}
      onPointerCancelCapture={(e) => finishSwipe(e, true)}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,select,label"))
          return;
        timer.current = setTimeout(() => setEditing(true), 600);
      }}
      onPointerUp={() => clearTimeout(timer.current)}
      onPointerMove={(e) => {
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > 8)
          clearTimeout(timer.current);
      }}
    >
      <div className="launcher-toolbar">
        {editing ? (
          <>
            <button aria-label="추가위젯" onClick={() => setSheet("widgets")}>
              <Plus size={18} />
              위젯
            </button>
            <button onClick={() => setSheet("layout")}>레이아웃</button>
            <button onClick={() => setEditing(false)}>완료</button>
          </>
        ) : null}
      </div>
      <div
        className="home-pages"
        ref={pager}
        onScroll={(e) =>
          setPage(
            Math.round(
              e.currentTarget.scrollLeft / e.currentTarget.clientWidth,
            ),
          )
        }
      >
        {pages.map((cells, n) => (
          <div
            className="home-app-grid"
            data-drop-zone={"page:" + n}
            role="group"
            aria-label={"홈 화면 " + (n + 1) + "페이지"}
            key={n}
          >
            {cells.map(({ entry, x, y, w, h }) => (
              <div
                className="launcher-slot"
                key={entry.key}
                style={{
                  gridColumn: `${x + 1} / span ${w}`,
                  gridRow: `${y + 1} / span ${h}`,
                }}
              >
                {cell(entry)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="launcher-bottom-tools">
        {pages.length > 1 && (
          <div className="home-page-dots">
            {pages.map((_, i) => (
              <button
                key={i}
                aria-label={"홈 화면 " + (i + 1) + "페이지"}
                aria-current={page === i ? "page" : undefined}
                onClick={() =>
                  pager.current?.scrollTo({
                    left: i * pager.current.clientWidth,
                    behavior: "smooth",
                  })
                }
              />
            ))}
          </div>
        )}
        <button className="home-search" onClick={p.search}>
          <Search size={12} />
          검색
        </button>
      </div>
      <div data-drop-zone="dock">
        <AppDock>
          {apps
            .filter((a) => a.installed && a.visible && a.dock)
            .map((a) => cell({ key: a.id, kind: "app", app: a }, true))}
        </AppDock>
      </div>
      {ghost && (
        <div className="launcher-ghost" style={{ left: ghost.x, top: ghost.y }}>
          {ghost.entry.app ? p.icon(ghost.entry.app) : <Grip size={45} />}
        </div>
      )}
      {(error || p.error) && (
        <button className="launcher-toast" onClick={() => setError("")}>
          {error || p.error}
        </button>
      )}
      {sheet && (
        <div
          className={"launcher-sheet " + (p.storeOpen ? "storefront" : "")}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <header>
            <button
              onClick={() => {
                if (p.storeOpen) p.closeStore?.();
                setSheet("");
                setSelected("");
                setUninstall(false);
              }}
              aria-label="앱 관리 닫기"
            >
              <ChevronLeft />
              홈 화면
            </button>
            <strong>
              {sheet === "library"
                ? "App Store"
                : sheet === "widgets"
                  ? "위젯"
                  : sheet === "layout"
                    ? "레이아웃 저장"
                    : active?.name || "위젯"}
            </strong>
          </header>
          <div className="launcher-sheet-scroll">
            {sheet === "library" ? (
              <>
                <div className="storefront-title">
                  <h1>검색</h1>
                  <span>App Store</span>
                </div>
                <label className="launcher-search">
                  <Search size={18} />
                  <input
                    placeholder="검색전체App"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <nav className="library-filters">
                  {[
                    "전체",
                    "시스템",
                    "커뮤니케이션",
                    "소셜",
                    "미디어",
                    "라이프",
                    "도구",
                    "설치됨",
                  ].map((label) => (
                    <button
                      key={label}
                      aria-pressed={filter === label}
                      onClick={() => setFilter(label)}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                <p className="library-count">
                  설치됨{apps.filter((a) => a.installed).length} / 전체
                  {apps.length}个App
                </p>
                {apps
                  .filter(
                    (a) =>
                      (a.name + a.id)
                        .toLowerCase()
                        .includes(query.toLowerCase()) &&
                      (filter === "전체" ||
                        (filter === "설치됨" && a.installed) ||
                        category(a.id) === filter),
                  )
                  .map((a) => (
                    <div className="runtime-library-row" key={a.id}>
                      {p.icon({ ...a, name: "" })}
                      <button
                        className="library-app-title"
                        onClick={() => {
                          setSelected(a.id);
                          setSheet("actions");
                        }}
                      >
                        <strong>{a.name}</strong>
                        <small>
                          {category(a.id)} ·{" "}
                          {a.installed
                            ? a.visible
                              ? "홈 화면에 있음"
                              : "앱 보관함에만 있음"
                            : "설치되지 않음"}
                        </small>
                      </button>
                      <button
                        className="library-get"
                        onClick={() => {
                          if (a.id === "appstore") {
                            setSheet("library");
                            return;
                          }
                          if (a.installed && a.visible) {
                            setSheet("");
                            p.open(a.id);
                          } else
                            patch(a.id, (x) => {
                              x.installed = true;
                              x.visible = true;
                              x.folder = "";
                              x.dock = false;
                            });
                        }}
                      >
                        {a.installed
                          ? a.visible
                            ? "열기"
                            : "홈 화면에 추가"
                          : "받기"}
                      </button>
                    </div>
                  ))}
              </>
            ) : sheet === "widgets" ? (
              <>
                <div className="widget-types">
                  {Object.entries(widgetLabels).map(([id, label]) => (
                    <button
                      key={id}
                      aria-pressed={widgetType === id}
                      onClick={() => setWidgetType(id as Widget["type"])}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className={"widget-preview widget-preview-" + size}>
                  <WidgetFace
                    widget={{ id: "preview", type: widgetType, size }}
                    work={p.work}
                    time={p.time}
                  />
                </div>
                <div className="widget-types">
                  {(["small", "medium", "large"] as const).map((s, i) => (
                    <button
                      key={s}
                      aria-pressed={size === s}
                      onClick={() => setSize(s)}
                    >
                      {["소", "중", "대"][i]}
                    </button>
                  ))}
                </div>
                <button className="launcher-primary" onClick={addWidget}>
                  추가{widgetLabels[widgetType]}위젯
                </button>
              </>
            ) : sheet === "layout" ? (
              <>
                <p>레이아웃、安装状态和위젯自动保存在本浏览器。</p>
                <button className="launcher-action" onClick={download}>
                  <Download />
                  导出레이아웃JSON
                </button>
                <label className="launcher-action">
                  <Upload />
                  导入레이아웃JSON
                  <input
                    aria-label="홈 화면 레이아웃 가져오기"
                    type="file"
                    accept=".json"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        if (f.size > 4 * 1024 * 1024)
                          throw Error("레이아웃 파일이 너무 큽니다");
                        p.importLayout(JSON.parse(await f.text()));
                        setSheet("");
                      } catch (err) {
                        setError(String(err));
                      }
                    }}
                  />
                </label>
                <p>원본 스토리와 플레이어 저장 데이터는 변경되지 않습니다.</p>
              </>
            ) : sheet === "widget-actions" ? (
              <>
                <div className="widget-types">
                  {(["small", "medium", "large"] as const).map((size, n) => (
                    <button
                      key={size}
                      aria-pressed={
                        p.layout.widgets.find((w) => w.id === selected)
                          ?.size === size
                      }
                      onClick={() =>
                        p.change((l) => {
                          const w = l.widgets.find((w) => w.id === selected);
                          if (w) {
                            w.size = size;
                            delete l.positions[selected];
                          }
                        })
                      }
                    >
                      {["소", "중", "대"][n]}
                    </button>
                  ))}
                </div>
                <button
                  className="launcher-action danger"
                  onClick={() => {
                    p.change((l) => {
                      l.widgets = l.widgets.filter((w) => w.id !== selected);
                      delete l.positions[selected];
                      l.order = l.order.filter((id) => id !== selected);
                    });
                    setSheet("");
                  }}
                >
                  移除위젯
                </button>
              </>
            ) : active ? (
              <>
                {!uninstall ? (
                  <>
                    <label className="launcher-field">
                      앱 이름
                      <input
                        aria-label="앱 이름"
                        maxLength={100}
                        value={active.name}
                        onChange={(e) =>
                          patch(active.id, (a) => {
                            a.name = e.target.value;
                          })
                        }
                      />
                    </label>
                    <label className="launcher-field">
                      폴더
                      <input
                        aria-label="폴더 이름"
                        maxLength={80}
                        placeholder="비워 두면 폴더에서 이동"
                        value={active.folder}
                        onChange={(e) =>
                          patch(active.id, (a) => {
                            a.folder = e.target.value;
                            a.dock = false;
                          })
                        }
                      />
                    </label>
                    <label className="launcher-field">
                      사용자 지정 아이콘 텍스트
                      <input
                        aria-label="사용자 지정 아이콘 텍스트"
                        maxLength={2}
                        value={active.icon.length < 3 ? active.icon : ""}
                        onChange={(e) =>
                          patch(active.id, (a) => {
                            a.icon = e.target.value;
                          })
                        }
                      />
                    </label>
                    <label className="launcher-action">
                      아이콘 업로드
                      <input
                        aria-label="앱 아이콘 업로드"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            if (
                              file.size > 2 * 1024 * 1024 ||
                              !/^image\/(png|jpeg|webp|gif)$/.test(file.type)
                            )
                              throw Error("2MB 이하의 이미지를 선택하세요");
                            const url = URL.createObjectURL(file);
                            try {
                              const image = new Image();
                              image.src = url;
                              await image.decode();
                              const canvas = document.createElement("canvas");
                              canvas.width = 128;
                              canvas.height = 128;
                              const context = canvas.getContext("2d")!;
                              const side = Math.min(
                                image.naturalWidth,
                                image.naturalHeight,
                              );
                              context.drawImage(
                                image,
                                (image.naturalWidth - side) / 2,
                                (image.naturalHeight - side) / 2,
                                side,
                                side,
                                0,
                                0,
                                128,
                                128,
                              );
                              const data = canvas.toDataURL("image/png");
                              patch(active.id, (a) => {
                                a.icon = data;
                              });
                            } finally {
                              URL.revokeObjectURL(url);
                            }
                          } catch (err) {
                            setError(String(err));
                          }
                        }}
                      />
                    </label>
                    <button
                      className="launcher-action"
                      onClick={() => {
                        if (
                          !active.dock &&
                          apps.filter((a) => a.installed && a.visible && a.dock)
                            .length >= 4
                        ) {
                          setError("Dock에는 앱을 최대 4개까지 놓을 수 있습니다");
                          return;
                        }
                        patch(active.id, (a) => {
                          a.installed = true;
                          a.visible = true;
                          a.dock = !a.dock;
                          a.folder = "";
                        });
                        setSheet("");
                      }}
                    >
                      {active.dock ? "Dock에서 제거" : "Dock에 추가"}
                    </button>
                    <button
                      className="launcher-action"
                      onClick={() => {
                        patch(active.id, (a) => {
                          if (a.id === "appstore") return;
                          a.visible = false;
                        });
                        setSheet("");
                      }}
                    >
                      从홈 화면移除
                    </button>
                    <button
                      className="launcher-action danger"
                      disabled={active.id === "appstore"}
                      onClick={() => {
                        setUninstall(true);
                        setKeep(true);
                      }}
                    >
                      앱 삭제
                    </button>
                  </>
                ) : (
                  <div role="dialog" aria-label="앱 삭제 확인">
                    <h2>삭제{active.name}？</h2>
                    <label className="launcher-checkbox">
                      <input
                        type="checkbox"
                        checked={keep}
                        onChange={(e) => setKeep(e.target.checked)}
                      />
                      이 앱의 로컬 콘텐츠 유지
                    </label>
                    <p>선택을 해제하면 로컬 콘텐츠가 삭제되며 원본 스토리에는 영향을 주지 않습니다.</p>
                    <button
                      className="launcher-primary danger"
                      onClick={() => {
                        p.change((l) => {
                          const a = l.apps.find((a) => a.id === active.id)!;
                          a.installed = false;
                          a.visible = false;
                          a.dock = false;
                          if (!keep && !l.cleared.includes(a.id))
                            l.cleared.push(a.id);
                        });
                        if (!keep) p.clearApp(active.id);
                        setUninstall(false);
                        setSheet("");
                      }}
                    >
                      确认삭제
                    </button>
                    <button
                      className="launcher-action"
                      onClick={() => setUninstall(false)}
                    >
                      취소
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </motion.div>
  );
}
