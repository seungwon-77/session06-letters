import { getSupabase } from "@/lib/supabase";

export type Letter = { id: string; content: string; created_at: string };
export type Comment = { id: string; content: string; created_at: string };

export const LETTER_MAX = 1000;
export const COMMENT_MAX = 500;
export const TIMEOUT = 15000;

export const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul",
});

export const charCount = (text: string) => Array.from(text).length;

// 내가 쓴 편지 id는 이 브라우저에만 기억합니다. 로그인이 없으므로 기기를 바꾸면 링크로 찾아야 합니다.
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

// 내가 쓴 편지와 방금 본 편지를 빼고, 댓글이 적은 편지부터 무작위로 하나 고릅니다.
export async function drawLetterId(exclude: string[]) {
  const { data, error } = await getSupabase()
    .rpc("draw_letter", { exclude })
    .abortSignal(AbortSignal.timeout(TIMEOUT));
  if (error) throw error;
  return (data as string | null) ?? null;
}
