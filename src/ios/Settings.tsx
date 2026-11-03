import { useState, type ComponentType } from "react";
import {
  Plane,
  Wifi,
  Bluetooth,
  Signal,
  Battery,
  Settings,
  Accessibility,
  Image,
  Bell,
  Volume2,
  Moon,
  Shield,
  ChevronRight,
  Search,
  Check,
  Link,
  Globe,
  Mic,
} from "lucide-react";
import type { Work, Item } from "../schema";
import { IOSToggle } from "../vendor/konsta/Toggle";
import { NavigationPage, useNavigation } from "./Navigation";
type Row = [ComponentType<{ size?: number }>, string, string];
const groups: Row[][] = [
  [
    [Plane, "비행기 모드", "#ff9500"],
    [Wifi, "Wi-Fi", "#007aff"],
    [Bluetooth, "블루투스", "#007aff"],
    [Signal, "셀룰러", "#34c759"],
    [Link, "개인용 핫스팟", "#65ce88"],
    [Battery, "배터리", "#34c759"],
    [Globe, "VPN", "#007aff"],
  ],
  [
    [Settings, "일반", "#8e8e93"],
    [Accessibility, "손쉬운 사용", "#007aff"],
    [Image, "배경화면", "#32ade6"],
  ],
  [
    [Bell, "알림", "#ff3b30"],
    [Volume2, "사운드 및 햅틱", "#ff2d55"],
    [Moon, "집중 모드", "#5856d6"],
    [Shield, "Face ID 및 암호", "#34c759"],
  ],
];
export function NativeSettings({
  work,
  items,
  creator,
  onItem,
  onSettings,
}: {
  work: Work;
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onSettings?: () => void;
}) {
  const nav = useNavigation(),
    [query, setQuery] = useState(""),
    [airplane, setAirplane] = useState(false),
    [wifi, setWifi] = useState(true),
    [bluetooth, setBluetooth] = useState(true),
    [lowPower, setLowPower] = useState(false);
  const row = (label: string, value?: string, click?: () => void) => (
    <button key={label} className="settings-native-row" onClick={click}>
      <span>{label}</span>
      <span className="settings-detail-value">{value}</span>
      {click && <ChevronRight size={16} />}
    </button>
  );
  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => (
    <div className="settings-native-row">
      <span>{label}</span>
      <IOSToggle label={label} checked={value} onChange={set} />
    </div>
  );
  const sub = () => {
    switch (nav.page) {
      case "일반":
        return (
          <div className="settings-group">
            {row("정보", "", () => nav.push("정보"))}
            {row("소프트웨어 업데이트", "iOS 18.0", () => nav.push("소프트웨어 업데이트"))}
            {row("iPhone 저장 공간", "", () => nav.push("iPhone 저장 공간"))}
            {row("날짜 및 시간", "", () => nav.push("날짜 및 시간"))}
            {row("언어 및 지역", "한국어", () => nav.push("언어 및 지역"))}
          </div>
        );
      case "정보":
        return (
          <div className="settings-group">
            {row("이름", work.phone.owner + "의 iPhone")}
            {row("iOS 버전", "18.0")}
            {row("모델명", "iPhone 15 Pro")}
            {row("사진", String(work.data.photos?.length || 0))}
            {row(
              "앱",
              String(work.apps.filter((a) => a.installed).length),
            )}
          </div>
        );
      case "Wi-Fi":
        return (
          <>
            <div className="settings-group">
              {toggle("Wi-Fi", wifi, setWifi)}
            </div>
            {wifi && (
              <>
                <p className="settings-section-label">나의 네트워크</p>
                <div className="settings-group">
                  <div className="settings-native-row">
                    <Check size={18} color="#007aff" />
                    <span>{work.phone.network}</span>
                    <Wifi size={18} />
                  </div>
                </div>
                <p className="settings-page-caption">
                  연결 상태는 이 가상 휴대폰에서만 사용됩니다.
                </p>
              </>
            )}
          </>
        );
      case "블루투스":
        return (
          <>
            <div className="settings-group">
              {toggle("블루투스", bluetooth, setBluetooth)}
            </div>
            <p className="settings-page-caption">
              {bluetooth ? "나의 기기" : "블루투스가 꺼져 있음"}
            </p>
          </>
        );
      case "배터리":
        return (
          <>
            <div className="settings-group">
              {row("배터리 잔량", work.phone.battery + "%")}
              {toggle("저전력 모드", lowPower, setLowPower)}
            </div>
            <p className="settings-page-caption">
              저전력 모드는 가상 기기의 상태만 변경합니다.
            </p>
          </>
        );
      case "날짜 및 시간":
        return (
          <div className="settings-group">
            {row("날짜", work.phone.date || "2026-09-01")}
            {row("시간", work.phone.time)}
            {row("시간대", "한국 표준시")}
          </div>
        );
      case "iPhone 저장 공간":
        return (
          <div className="settings-group">
            {work.apps
              .filter((a) => a.installed)
              .map((a) => row(a.name, `${work.data[a.id]?.length || 0} 개`))}
          </div>
        );
      case "소프트웨어 업데이트":
        return (
          <p className="settings-page-caption">
            iOS 18.0 · 이 시스템은 스토리 속 가상 기기이며 실제 업데이트를 다운로드하지 않습니다.
          </p>
        );
      default:
        return (
          <>
            <div className="settings-group">
              {row(
                nav.page,
                nav.page === "Face ID 및 암호"
                  ? work.phone.passcode
                    ? "암호 설정됨"
                    : "암호 설정 안 됨"
                  : "",
              )}
            </div>
            {!items.some((i) => i.folder === nav.page) && (
              <p className="settings-page-caption">이 스토리에는 추가 옵션이 설정되어 있지 않습니다.</p>
            )}
          </>
        );
    }
  };
  return (
    <div className="native-settings" data-root={!nav.page}>
      <NavigationPage
        page={nav.page}
        back={nav.pop}
        title={nav.depth > 1 ? "일반" : "설정"}
      >
        {nav.page ? (
          sub()
        ) : (
          <>
            <h1>설정</h1>
            {!query && (
              <button
                className="settings-account"
                onClick={() => nav.push(work.phone.owner)}
              >
                <span>{work.phone.owner.slice(0, 1)}</span>
                <div>
                  <strong>{work.phone.owner}</strong>
                  <small>Apple 계정, iCloud 및 기타</small>
                </div>
                <ChevronRight size={17} />
              </button>
            )}
            {groups.map((group, n) => (
              <div className="settings-group" key={n}>
                {group
                  .filter(([, name]) => name.includes(query))
                  .map(([Icon, name, color]) => (
                    <div
                      key={name}
                      className="settings-native-row"
                      role={name === "비행기 모드" ? undefined : "button"}
                      tabIndex={name === "비행기 모드" ? undefined : 0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") nav.push(name);
                      }}
                      onClick={() => {
                        if (name !== "비행기 모드") nav.push(name);
                      }}
                    >
                      <span
                        className="settings-glyph"
                        style={{ background: color }}
                      >
                        <Icon size={21} />
                      </span>
                      <span>{name}</span>
                      {name === "비행기 모드" ? (
                        <IOSToggle
                          label="비행기 모드"
                          checked={airplane}
                          onChange={setAirplane}
                        />
                      ) : (
                        <>
                          <small>
                            {name === "Wi-Fi"
                              ? wifi
                                ? "연결 안 됨"
                                : "끔"
                              : name === "블루투스"
                                ? bluetooth
                                  ? "켬"
                                  : "끔"
                                : name === "VPN"
                                  ? "연결 안 됨"
                                  : name === "셀룰러" || name === "개인용 핫스팟"
                                    ? "끔"
                                    : ""}
                          </small>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </>
        )}
        {items
          .filter(
            (i) =>
              !nav.page || i.folder === nav.page || i.title.includes(nav.page),
          )
          .map((i) => (
            <button className="record-row" key={i.id} onClick={() => onItem(i)}>
              {i.title}
              <ChevronRight size={16} />
            </button>
          ))}
        {creator && (
          <button className="phone-add" onClick={onSettings}>
            시스템 설정 편집
          </button>
        )}
      </NavigationPage>
      {!nav.page && (
        <label className="settings-search">
          <Search size={23} />
          <input
            aria-label="검색설정"
            placeholder="검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Mic size={22} aria-hidden="true" />
        </label>
      )}
    </div>
  );
}
