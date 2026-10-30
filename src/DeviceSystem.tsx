import { SystemNotifications } from "./SystemNotifications";
import {
  ConnectivityModule,
  SliderModule,
} from "./vendor/ios-web/ControlModules";
import { UnlockHandle } from "./vendor/ios-web/UnlockHandle";
import { useState, useEffect, createContext, useContext } from "react";
import {
  LockKeyhole,
  Flashlight,
  Camera,
  Delete,
  ChevronDown,
  Play,
  SkipForward,
  Moon,
  RotateCcw,
  Monitor,
  Timer,
  Calculator,
  Globe,
  Mic,
  ArrowUp,
  ChevronUp,
  Plus,
  Power,
  Signal,
  House,
  ScanLine,
  Circle,
  Radio,
  Wifi,
  Battery,
  Heart,
  Music2,
  Airplay,
  ChevronRight,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";
import type { Work } from "./schema";
export const KeyboardContext = createContext<(open: boolean) => void>(() => {});
export function NativeComposer({
  creator,
  onAdd,
}: {
  creator: boolean;
  onAdd: () => void;
}) {
  const open = useContext(KeyboardContext);
  return (
    <button
      className="native-compose-field"
      aria-label={creator ? "添加消息" : "输入消息"}
      onClick={() => (creator ? onAdd() : open(true))}
    >
      {creator ? "添加消息" : ""}
    </button>
  );
}
export function DeviceLock({
  work,
  time,
  notices,
  onDismiss,
  pinOpen,
  setPinOpen,
  error,
  onUnlock,
  onCamera,
  onLight,
}: {
  work: Work;
  time: string;
  notices: string[];
  onDismiss: (index: number) => void;
  pinOpen: boolean;
  setPinOpen: (v: boolean) => void;
  error: string;
  onUnlock: (v: string) => void;
  onCamera: () => void;
  onLight: () => void;
}) {
  const [code, setCode] = useState("");
  useEffect(() => {
    if (error) setCode("");
  }, [error]);
  useEffect(() => {
    if (!pinOpen) setCode("");
  }, [pinOpen]);
  const digit = (key: string) => {
    const value = key === "⌫" ? code.slice(0, -1) : (code + key).slice(0, 12);
    setCode(value);
    if (
      /^\d+$/.test(work.phone.passcode) &&
      value.length === work.phone.passcode.length
    ) {
      onUnlock(value);
      setCode("");
    }
  };
  const open = () => (work.phone.passcode ? setPinOpen(true) : onUnlock(""));
  return (
    <motion.div
      className={"lock-screen device-lock " + (pinOpen ? "pin-open" : "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: -852, opacity: 0 }}
      transition={{ duration: 0.48, ease: [0.32, 0.72, 0, 1] }}
      onClick={(e) => {
        if (!pinOpen && !(e.target as HTMLElement).closest("button")) open();
      }}
    >
      {!pinOpen ? (
        <>
          <div className="lock-clock-block">
            <LockKeyhole size={18} />
            <p>
              {new Intl.DateTimeFormat("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
                timeZone: "UTC",
              }).format(
                new Date((work.phone.date || "2026-09-01") + "T12:00:00Z"),
              )}
            </p>
            <h1>{time}</h1>
          </div>
          <div className="lock-notifications">
            {work.phone.notifications && (
              <SystemNotifications
                compact
                notices={notices}
                apps={work.apps}
                onOpen={open}
                onDismiss={onDismiss}
              />
            )}
          </div>
          <UnlockHandle onUnlock={open} />

          <div className="lock-tools">
            <button onClick={onLight} aria-label="手电筒">
              <Flashlight size={23} />
            </button>
            <button
              onClick={onCamera}
              disabled={
                !work.apps.some((a) => a.installed && a.id === "camera")
              }
              aria-label="相机"
            >
              <Camera size={25} />
            </button>
          </div>
        </>
      ) : (
        <div className="device-passcode">
          <LockKeyhole size={22} />
          <h2>输入密码</h2>
          <div
            className={"passcode-dots " + (error ? "pin-shake" : "")}
            aria-label={"已输入" + code.length + "位密码"}
          >
            {Array.from({ length: work.phone.passcode.length }, (_, i) => (
              <i key={i} className={i < code.length ? "filled" : ""} />
            ))}
          </div>
          <input
            className={
              /^\d+$/.test(work.phone.passcode)
                ? "accessible-pin"
                : "legacy-passcode"
            }
            aria-label="锁屏密码"
            autoComplete="off"
            inputMode="numeric"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onUnlock(code)}
          />
          <div className="pin-keypad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].map(
              (n, i) =>
                n ? (
                  <button
                    key={i}
                    aria-label={"密码键" + n}
                    onClick={() => digit(n)}
                  >
                    <b>{n}</b>
                    <small>
                      {
                        [
                          "",
                          "",
                          "ABC",
                          "DEF",
                          "GHI",
                          "JKL",
                          "MNO",
                          "PQRS",
                          "TUV",
                          "WXYZ",
                        ][Number(n)]
                      }
                    </small>
                  </button>
                ) : (
                  <span key={i} />
                ),
            )}
          </div>
          <span role="status" className="pin-error">
            {error}
          </span>
          {!/^[0-9]+$/.test(work.phone.passcode) && (
            <button onClick={() => onUnlock(code)}>解锁</button>
          )}
          <div className="pin-footer">
            <button onClick={() => setPinOpen(false)}>取消</button>
            <button
              aria-label="删除一位密码"
              onClick={() => (code ? digit("⌫") : setPinOpen(false))}
            >
              {code ? "删除" : "取消"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
export function ControlCenter({
  battery = 94,
  network,
  close,
}: {
  battery?: number;
  network: string;
  close: () => void;
}) {
  const [rotation, setRotation] = useState(true),
    [focus, setFocus] = useState(false),
    [playing, setPlaying] = useState(false);
  const [brightness, setBrightness] = useState(50),
    [volume, setVolume] = useState(25);
  const [tool, setTool] = useState("");
  return (
    <motion.div
      className="system-panel device-control"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
    >
      <button className="cc-close" aria-label="关闭控制中心" onClick={close}>
        <Power />
      </button>
      <button
        className="cc-edit"
        aria-label="控制中心编辑"
        onClick={() => setTool("编辑控制")}
      >
        <Plus />
      </button>
      <div className="cc-current">
        <span>
          <Airplay size={13} />
        </span>
        控制中心 <ChevronRight size={16} />
      </div>
      <div className="cc-status" aria-label={"蜂窝网络 " + network}>
        <div>
          <span>
            <Signal size={18} />
            <small>主号</small> 中国移动 <Wifi size={17} />
          </span>
          <span>
            <Signal size={18} />
            <small>副号</small> 中国电信
          </span>
        </div>
        <span>
          <Lock size={13} /> {battery}% <Battery size={27} />
        </span>
      </div>
      <nav className="cc-page-rail" aria-label="控制中心分类">
        {[Heart, Music2, House, Radio].map((Icon, i) => (
          <button
            key={i}
            aria-label={["常用控制", "媒体控制", "家庭控制", "连接控制"][i]}
            onClick={() =>
              document
                .querySelector(
                  [".cc-grid", ".cc-music", ".cc-home", ".cc-connect"][i],
                )
                ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
            }
          >
            <Icon fill={i === 0 ? "currentColor" : "none"} />
          </button>
        ))}
      </nav>
      <div className="cc-grid">
        <ConnectivityModule />
        <div className="cc-music">
          <div className="cc-media-top">
            <span>
              <Music2 size={28} />
            </span>
            <Airplay size={21} />
          </div>
          <div className="cc-media-title">
            <strong>{playing ? "测试播放" : "未在播放"}</strong>
            <small>音乐</small>
          </div>
          <div>
            <button aria-label="上一首">
              <SkipForward style={{ transform: "rotate(180deg)" }} />
            </button>
            <button
              aria-label={playing ? "暂停" : "播放"}
              onClick={() => setPlaying(!playing)}
            >
              <Play fill="currentColor" />
            </button>
            <button aria-label="下一首">
              <SkipForward />
            </button>
          </div>
        </div>
        <button
          className={"cc-square " + (rotation ? "cc-white" : "")}
          aria-label="旋转锁定"
          aria-pressed={rotation}
          onClick={() => setRotation(!rotation)}
        >
          <span className="cc-rotation">
            <RotateCcw />
            <Lock size={14} />
          </span>
        </button>
        <button
          className="cc-square"
          onClick={() => setTool(tool ? "" : "屏幕镜像")}
          aria-label="屏幕镜像"
        >
          <Monitor />
        </button>
        <SliderModule
          type="brightness"
          value={brightness}
          onChange={setBrightness}
        />
        <SliderModule type="volume" value={volume} onChange={setVolume} />
        <button
          className={"cc-focus " + (focus ? "cc-white" : "")}
          aria-pressed={focus}
          onClick={() => setFocus(!focus)}
        >
          <Moon />
          <span>专注模式</span>
          <ChevronDown size={14} />
        </button>
        <button className="cc-home" onClick={() => setTool("家庭")}>
          <House size={38} />
          <span>未设置家庭</span>
        </button>
        {[Flashlight, Timer, Calculator, Camera].map((Icon, i) => (
          <button
            className={"cc-square cc-tool-" + i}
            aria-label={["手电筒", "计时器", "计算器", "相机"][i]}
            key={i}
            onClick={() =>
              setTool(tool ? "" : ["手电筒", "计时器", "计算器", "相机"][i])
            }
          >
            <Icon />
          </button>
        ))}
        {[ScanLine, Circle, Radio].map((Icon, i) => (
          <button
            key={i}
            className={"cc-square cc-bottom-tool cc-bottom-" + i}
            aria-label={["扫码", "屏幕录制", "声音识别"][i]}
            onClick={() => setTool(["扫码", "屏幕录制", "声音识别"][i])}
          >
            <Icon />
          </button>
        ))}
      </div>
      {tool && (
        <div className="cc-tool">
          <strong>{tool}</strong>
          <p>
            {tool === "屏幕镜像" ? "正在搜索作品中的设备…" : "作品内快捷控制"}
          </p>
          <button onClick={() => setTool("")}>完成</button>
        </div>
      )}
      <button className="cc-dismiss" onClick={close}>
        轻扫以关闭
        <ChevronUp size={16} />
      </button>
    </motion.div>
  );
}
export function DeviceKeyboard({ close }: { close: () => void }) {
  const [value, setValue] = useState(""),
    [shift, setShift] = useState(false),
    [numbers, setNumbers] = useState(false);
  return (
    <div className="device-keyboard" role="dialog" aria-label="屏幕键盘">
      <div className="keyboard-draft">
        <input
          autoFocus
          aria-label="消息草稿"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入消息"
        />
        <button aria-label="收起键盘" onClick={close}>
          <ChevronDown />
        </button>
      </div>
      <div className="keyboard-candidates">
        {(value ? [value, "好的", "知道了"] : ["我", "你", "好的"]).map(
          (v, i) => (
            <button key={i} onClick={() => setValue(value + v)}>
              {v}
            </button>
          ),
        )}
      </div>
      {(numbers
        ? ["1234567890", "-/:;()¥&@", ".,?!'"]
        : ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
      ).map((row, i) => (
        <div className="keyboard-row" key={i}>
          {i === 2 && (
            <button
              className="key-special"
              aria-label="切换大小写"
              onClick={() => setShift(!shift)}
            >
              <ArrowUp size={19} />
            </button>
          )}
          {[...row].map((k) => (
            <button
              key={k}
              onClick={() => setValue(value + (shift ? k.toUpperCase() : k))}
            >
              {shift ? k.toUpperCase() : k}
            </button>
          ))}
          {i === 2 && (
            <button
              className="key-special"
              aria-label="退格"
              onClick={() => setValue(value.slice(0, -1))}
            >
              <Delete size={20} />
            </button>
          )}
        </div>
      ))}
      <div className="keyboard-row keyboard-bottom">
        <button onClick={() => setNumbers(!numbers)}>
          {numbers ? "ABC" : "123"}
        </button>
        <button className="key-space" onClick={() => setValue(value + " ")}>
          空格
        </button>
        <button onClick={close}>完成</button>
      </div>
      <div className="keyboard-accessories">
        <Globe size={24} />
        <small>草稿</small>
        <Mic size={23} />
      </div>
    </div>
  );
}
export { NativeSettings } from "./ios/Settings";
