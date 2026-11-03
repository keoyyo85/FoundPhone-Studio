import { describe, it, expect } from "vitest";
import { compileStory } from "../../story-engine/compiler";
import { testStory } from "../../story-engine/testStory";
import { dispatch } from "../../engine";
import { initialRuntime } from "../../schema";
import { kakaoCharacterReply } from "./Apps";
import fixture from "../../../tests/fixtures/mymy-ui/story.json";
describe("Mymy adapters preserve shared story engine", () => {
  it("compiles authored KKT and verifies read → call → Instagram unlock", () => {
    const { story, work } = compileStory(fixture);
    expect(testStory(story, work)).toEqual([]);
    let state = dispatch(work, initialRuntime(work), "read", "kkt-last");
    expect(state.incomingCall?.target).toBe("test-call");
    state = dispatch(work, state, "callAnswered", "test-call");
    state = dispatch(work, state, "callEnded", "test-call");
    expect(state.unlocked).toContain("ig-after-call");
  });
});

describe("KakaoTalk character replies", () => {
  it("answers direct messages in Yuna's affectionate older-sister voice", () => {
    expect(kakaoCharacterReply("윤아언니", "언니 보고 싶어", 0)).toMatchObject({
      sender: "윤아언니",
      body: "나도 지우 보고 싶었어. 오늘은 조금 더 같이 있을까? 🥺",
    });
  });
  it("lets the leader remind the group to respect Jiwoo's comfort", () => {
    expect(kakaoCharacterReply("해원언니", "윤아 언니랑 지우 데이트", 0).sender).toBe("해원언니");
  });
  it("lets Lily mix enthusiastic English into her replies", () => {
    expect(kakaoCharacterReply("릴리언니", "지우 언니 보고 싶어", 0).body).toContain("Jiwoo");
  });
  it("keeps manager replies focused on schedules", () => {
    expect(kakaoCharacterReply("매니저님", "내일 일정 알려주세요", 0).body).toContain("10:30");
  });
});
