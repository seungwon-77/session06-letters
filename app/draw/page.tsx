"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { configError } from "@/lib/supabase";
import { drawLetterId, getMyLetters } from "@/lib/letters";

type State = "loading" | "empty" | "error";

export default function DrawPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (configError) return;
    let cancelled = false;
    drawLetterId(getMyLetters())
      .then((id) => {
        if (cancelled) return;
        if (id) router.replace(`/letter/${id}`);
        else setState("empty");
      })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, [router]);

  return (
    <main>
      <section className="intro small">
        <p className="eyebrow">STEP 2 · 답장해 주기</p>
        <h1>편지를 꺼내는 중<span className="dot">…</span></h1>
      </section>
      {configError ? <aside className="setup" role="status"><h2>Supabase 연결을 준비해 주세요</h2><p>{configError}</p></aside>
        : state === "loading" ? <div className="empty" role="status"><span className="empty-symbol" aria-hidden="true">✉</span><p>편지함에서 고민 하나를 고르고 있어요.</p></div>
        : state === "empty" ? <div className="empty"><span className="empty-symbol" aria-hidden="true">✉</span><p>아직 답장할 고민이 없어요.</p><span>첫 고민을 부쳐 볼까요?</span><div className="actions center"><Link className="button" href="/write">고민 부치기</Link></div></div>
        : <p className="error" role="alert">편지를 꺼내지 못했습니다. 새로고침해서 다시 시도해 주세요.</p>}
    </main>
  );
}
