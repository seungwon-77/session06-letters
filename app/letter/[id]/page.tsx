"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { configError, getSupabase } from "@/lib/supabase";
import {
  COMMENT_MAX, TIMEOUT, charCount, dateFormat, getMyLetters,
  type Comment, type Letter,
} from "@/lib/letters";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function LetterPage() {
  const { id } = useParams<{ id: string }>();

  const [letter, setLetter] = useState<Letter | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isMine, setIsMine] = useState(false);

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const savingRef = useRef(false);
  const requestId = useRef(0);
  const length = charCount(content);

  const load = useCallback(async () => {
    if (configError) return;
    const current = ++requestId.current;
    setLoading(true);
    setLoadError("");
    try {
      if (!UUID.test(id)) throw new Error("not found");
      const supabase = getSupabase();
      const signal = AbortSignal.timeout(TIMEOUT);
      const [letterRes, commentsRes] = await Promise.all([
        supabase.from("letters").select("id, content, created_at").eq("id", id).abortSignal(signal).maybeSingle(),
        supabase.from("comments").select("id, content, created_at").eq("letter_id", id)
          .order("created_at", { ascending: true }).order("id", { ascending: true }).abortSignal(signal),
      ]);
      if (letterRes.error || commentsRes.error) throw letterRes.error ?? commentsRes.error;
      if (!letterRes.data) throw new Error("not found");
      if (current !== requestId.current) return;
      setLetter(letterRes.data);
      setComments(commentsRes.data ?? []);
    } catch (error) {
      if (current !== requestId.current) return;
      setLetter(null);
      setLoadError(error instanceof Error && error.message === "not found"
        ? "편지를 찾을 수 없어요. 링크가 정확한지 확인해 주세요."
        : "편지를 불러오지 못했습니다. 새로고침해서 다시 시도해 주세요.");
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMine(getMyLetters().includes(id));
    void load();
    return () => { requestId.current += 1; };
  }, [id, load]);

  async function sendComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current || configError || !letter) return;
    const trimmed = content.trim();
    if (!trimmed || length > COMMENT_MAX) {
      setSaveError(`공백을 제외한 내용을 ${COMMENT_MAX}자 이내로 입력해 주세요.`);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    try {
      const { data, error } = await getSupabase().from("comments")
        .insert({ letter_id: letter.id, content: trimmed })
        .select("id, content, created_at")
        .abortSignal(AbortSignal.timeout(TIMEOUT)).single();
      if (error) throw error;
      setComments((prev) => [...prev, data]);
      setContent("");
    } catch {
      setSaveError("답장을 남기지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (configError) return <aside className="setup" role="status"><h2>Supabase 연결을 준비해 주세요</h2><p>{configError}</p></aside>;
  if (loading && !letter) return <p className="empty" role="status">편지를 여는 중…</p>;
  if (loadError || !letter) {
    return <div className="empty"><p>{loadError}</p><div className="actions center"><Link className="button" href="/">처음으로</Link></div></div>;
  }

  return (
    <main>
      <Link className="back" href="/">← 고민 목록</Link>
      <article className="letter letter-paper">
        <div className="post-meta">
          <span>{isMine ? "내가 부친 고민" : "익명의 고민"}</span>
          <time dateTime={letter.created_at}>{dateFormat.format(new Date(letter.created_at))}</time>
        </div>
        <p>{letter.content}</p>
      </article>

      <section className="feed" aria-labelledby="comments-title">
        <div className="section-top">
          <div><h2 id="comments-title">답장 {comments.length}통</h2><p className="feed-caption">작성 시각은 한국 시간</p></div>
          <button className="secondary" onClick={() => void load()} disabled={loading}>새로 불러오기</button>
        </div>
        {comments.length === 0
          ? <div className="empty"><span className="empty-symbol" aria-hidden="true">✎</span><p>아직 답장이 없어요.</p><span>{isMine ? "곧 누군가 답장을 보내 줄 거예요." : "첫 답장을 남겨 주세요."}</span></div>
          : <ul className="post-list">{comments.map((c, i) => (
              <li key={c.id} className="post">
                <div className="post-meta"><span>익명 {i + 1}</span><time dateTime={c.created_at}>{dateFormat.format(new Date(c.created_at))}</time></div>
                <p>{c.content}</p>
              </li>
            ))}</ul>}
      </section>

      <section className="composer reply">
        <form onSubmit={sendComment}>
          <label htmlFor="reply">{isMine ? "덧붙이고 싶은 말" : "이 고민에 답장하기"}</label>
          <textarea id="reply" value={content} onChange={(e) => setContent(e.target.value)} rows={4}
            placeholder="따뜻한 한마디를 건네 주세요." disabled={saving}
            aria-describedby="reply-count" aria-invalid={length > COMMENT_MAX} />
          <div className="form-bottom">
            <span id="reply-count" className={length > COMMENT_MAX ? "over-limit" : "counter"}>{length} / {COMMENT_MAX}자</span>
            <button type="submit" disabled={saving || !content.trim() || length > COMMENT_MAX}>{saving ? "보내는 중…" : "답장 보내기"}</button>
          </div>
          {saveError && <p className="error" role="alert">{saveError}</p>}
        </form>
      </section>

      <div className="actions">
        <Link className="secondary button-link" href="/">← 고민 목록</Link>
        <Link className="secondary button-link" href="/write">나도 고민 부치기</Link>
      </div>
    </main>
  );
}
