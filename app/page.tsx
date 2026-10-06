"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { configError, getSupabase } from "@/lib/supabase";
import { TIMEOUT, dateFormat, getMyLetters, type LetterSummary } from "@/lib/letters";

export default function Home() {
  const [letters, setLetters] = useState<LetterSummary[]>([]);
  const [mine, setMine] = useState<string[]>([]);
  const [loading, setLoading] = useState(!configError);
  const [loadError, setLoadError] = useState("");
  const requestId = useRef(0);

  const loadLetters = useCallback(async () => {
    if (configError) return;
    const current = ++requestId.current;
    setLoading(true);
    setLoadError("");
    try {
      // 최신 고민 50개와 각 고민의 댓글 수를 함께 조회합니다.
      const { data, error } = await getSupabase().from("letters")
        .select("id, content, created_at, comments(count)")
        .order("created_at", { ascending: false }).order("id", { ascending: false })
        .limit(50).abortSignal(AbortSignal.timeout(TIMEOUT));
      if (error) throw error;
      if (current === requestId.current) setLetters(data ?? []);
    } catch {
      if (current === requestId.current) setLoadError("고민을 불러오지 못했습니다. 새로고침해서 다시 시도해 주세요.");
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // localStorage는 브라우저에서만 읽을 수 있어 첫 렌더 이후에 불러옵니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMine(getMyLetters());
    void loadLetters();
    return () => { requestId.current += 1; };
  }, [loadLetters]);

  return (
    <main>
      <section className="intro">
        <p className="eyebrow">말하기 어려운 이야기도, 이름 없이</p>
        <h1>고민을 부치면<br />누군가 답장을 보내요<span className="dot">.</span></h1>
        <p>고민을 익명으로 남기고, 마음이 가는 고민에 한마디를 건네 보세요.</p>
        <div className="actions"><Link className="button" href="/write">고민 부치기 ✎</Link></div>
      </section>

      {configError && <aside className="setup" role="status"><h2>Supabase 연결을 준비해 주세요</h2><p>{configError}</p></aside>}

      <section className="feed" aria-labelledby="feed-title" aria-busy={loading}>
        <div className="section-top">
          <div><h2 id="feed-title">편지함에 도착한 고민</h2><p className="feed-caption">최신 50개 · 눌러서 읽고 답장을 남겨요</p></div>
          <button className="secondary" onClick={() => void loadLetters()} disabled={loading || !!configError}>새로 불러오기</button>
        </div>
        {configError ? null
          : loading && letters.length === 0 ? <p className="empty" role="status">고민을 불러오는 중…</p>
          : loadError ? <p className="error" role="alert">{loadError}</p>
          : letters.length === 0 ? <div className="empty"><span className="empty-symbol" aria-hidden="true">✉</span><p>아직 도착한 고민이 없어요.</p><span>첫 고민을 부쳐 볼까요?</span></div>
          : <ul className="post-list">{letters.map((letter) => {
              const count = letter.comments[0]?.count ?? 0;
              return (
                <li key={letter.id}>
                  <Link href={`/letter/${letter.id}`} className="post post-link">
                    <div className="post-meta">
                      <span>{mine.includes(letter.id) ? "내 고민" : "익명의 고민"}</span>
                      <time dateTime={letter.created_at}>{dateFormat.format(new Date(letter.created_at))}</time>
                    </div>
                    <p className="preview">{letter.content}</p>
                    <span className="reply-count">{count > 0 ? `답장 ${count}통` : "첫 답장을 기다려요"} →</span>
                  </Link>
                </li>
              );
            })}</ul>}
      </section>
    </main>
  );
}
