export type Letter = { id: string; content: string; created_at: string };
export type LetterSummary = Letter & { comments: { count: number }[] };
export type Comment = { id: string; content: string; created_at: string };

export const LETTER_MAX = 1000;
export const COMMENT_MAX = 500;
export const TIMEOUT = 15000;

export const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul",
});

export const charCount = (text: string) => Array.from(text).length;

// 내가 쓴 고민 id는 이 브라우저에만 기억해 "내 고민" 표시에 씁니다. 로그인이 없으므로 기기를 바꾸면 표시되지 않습니다.
const MINE_KEY = "my-letters";

export function getMyLetters(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(MINE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function rememberMyLetter(id: string) {
  try {
    localStorage.setItem(MINE_KEY, JSON.stringify([id, ...getMyLetters().filter((v) => v !== id)]));
  } catch {
    // 저장소를 못 쓰는 브라우저에서는 링크만으로 다시 찾습니다.
  }
}
