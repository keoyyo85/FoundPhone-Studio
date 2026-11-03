# Jiwoo × Yuna — Story Brief

This document consolidates the user's story and implementation instructions from the conversation. The story is fictional, fan-created interactive fiction featuring NMIXX members Kim Jiwoo and Sullyoon (Yuna).

## Product goal
Create a polished, playful, heart-fluttering "found phone" interactive story. Preserve the repository's existing phone UI, app implementations, routing, save system, and interaction framework. Add story content through the repository's established story schema rather than replacing the phone UI.

## Canonical branch
- Work only on `jiwoo-yuna-final` for this story.
- `main` remains the stable upstream/base branch.
- Do not publish, merge to main, or delete other branches without the user's separate confirmation and available GitHub operation.

## Phone identity and visual assets
- Phone owner: 김지우 (Kim Jiwoo).
- Lock-screen passcode: `0413`.
- The story begins on 2026-11-02 at 14:00.
- Preserve the user's supplied assets as-is: P1 is intended for lock-screen and home-screen wallpaper; P2 is intended as Sullyoon/Yuna's KakaoTalk avatar for the contact saved as `윤아언니`; P3 is intended as Yuna's Instagram Story media.
- The currently migrated story JSON contains embedded image data. Do not replace it with generated or unrelated images. If an asset mapping is missing, request the original image again rather than guessing.

## Main relationship and story tone
- Central relationship: Kim Jiwoo × Sullyoon (Yuna), written as fictional romance.
- Characterize dialogue as warm, playful, teasing, caring, and emotionally restrained at first; build tension through small gestures, private messages, jealousy, missed timing, and sincere conversations.
- Keep the NMIXX members' group chat lively and differentiated. Haewon is observant and teasing; Lily is expressive and often playful; Bae is mischievous; Kyujin is energetic and quick to notice things. Avoid making every member sound alike.
- Keep the story respectful and clearly fictional; do not present invented private events as real claims about the artists.

## Opening scene and key beats
- Opening timestamp: November 2, 14:00.
- The opening KakaoTalk exchange begins with Yuna asking what Jiwoo is doing, asks what she wants to eat that evening, and Jiwoo answers that she wants tteokbokki (辣炒年糕).
- Add an Instagram Story interaction: liking Yuna's story triggers an incoming video call.
- Let the player choose to answer or decline. The choice should change subsequent messages and available story paths.
- Include branching outcomes such as a tteokbokki-shop confession, a missed-chance ending, a hidden-surprise ending, a rainy-night walk, and a quiet promise.
- Hide clues across chats, photos, notes, calendar, browser history, social posts, and other phone apps so the player discovers the relationship story by exploring.

## Apps and content
- KakaoTalk: Yuna contact named `윤아언니`; one-to-one romance chat; NMIXX group chat; individual member chats; family/manager conversations as useful supporting context.
- Include meaningful content in Photos, Instagram, Notes, Calendar, Safari, Music, Phone, and X/Twitter. Each app should contribute clues or atmosphere rather than being an empty shell.
- Keep installed-app and contact metadata consistent with the existing schema and phone framework.

## Interaction and implementation requirements
- Use the existing story schema, event/action conventions, stable IDs, and app data structures.
- Every choice must lead to a valid next event or ending; no dead links or unreachable required content.
- Ensure event triggers, unlocks, messages, notifications, and app content are mutually consistent.
- Keep all story content in the canonical story JSON and ensure the app's default/demo entry loads this story in the intended preview flow.
- Do not overwrite unrelated framework files or redesign the phone UI unless required to connect the story to the existing loader.
- Keep the source assets intact; avoid lossy transformations.

## Verification checklist
Run the repository-prescribed checks after the story and loader integration:
`npm run story:validate`, `npm run story:test`, `npm run build`, and `npm run test:e2e` when available.
Manually open the browser preview and verify the lock screen, passcode, wallpaper, home screen, KakaoTalk contact and chats, Instagram Story/call trigger, branch choices, app clues, save/load behavior, and endings.
