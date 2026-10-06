"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { configError, getSupabase } from "@/lib/supabase";
import { LETTER_MAX, TIMEOUT, charCount, rememberMyLetter } from "@/lib/letters";

export default function WritePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const savingRef = useRef(false);
  const length = charCount(content);

  async function sendLetter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current || configError) return;
    const trimmed = content.trim();
    if (!trimmed || length > LETTER_MAX) {
      setError(`공백을 제외한 내용을 ${LETTER_MAX}자 이내로 입력해 주세요.`);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      // 저장과 동시에 새 고민의 id를 돌려받아 그 게시글로 이동합니다.
      const { data, error } = await getSupabase().from("letters")
        .insert({ content: trimmed }).select("id")
        .abortSignal(AbortSignal.timeout(TIMEOUT)).single();
      if (error) throw error;
      rememberMyLetter(data.id);
      router.push(`/letter/${data.id}`);
    } catch {
      setError("편지를 부치지 못했습니다. 잠시 후 다시 시도해 주세요.");
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <main>
      <section className="intro small">
        <p className="eyebrow">고민 부치기</p>
        <h1>어떤 고민이 있나요<span className="dot">?</span></h1>
        <p>이름은 남지 않아요. 부친 고민은 편지함 목록에 올라가고, 누구나 댓글로 답장할 수 있어요.</p>
      </section>

      {configError && <aside className="setup" role="status"><h2>Supabase 연결을 준비해 주세요</h2><p>{configError}</p></aside>}

      <section className="composer letter-paper">
        <form onSubmit={sendLetter}>
          <label htmlFor="content">고민 편지</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={9}
            placeholder="요즘 마음에 걸리는 일을 편하게 적어 보세요." disabled={saving || !!configError}
            aria-describedby="privacy count" aria-invalid={length > LETTER_MAX} />
          <div className="form-bottom">
            <span id="count" className={length > LETTER_MAX ? "over-limit" : "counter"}>{length} / {LETTER_MAX}자</span>
            <button type="submit" disabled={saving || !!configError || !content.trim() || length > LETTER_MAX}>
              {saving ? "부치는 중…" : "편지 부치기"}<span aria-hidden="true"> ✉</span>
            </button>
          </div>
          <p id="privacy" className="privacy">이름·연락처·학번 같은 개인정보는 적지 마세요. 부친 편지는 누구나 읽을 수 있어요.</p>
          {error && <p className="error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
