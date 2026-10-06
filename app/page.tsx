"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyLetters } from "@/lib/letters";

export default function Home() {
  const [mine, setMine] = useState<string[]>([]);

  useEffect(() => {
    // localStorage는 브라우저에서만 읽을 수 있어 첫 렌더 이후에 불러옵니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMine(getMyLetters());
  }, []);

  return (
    <main>
      <section className="intro">
        <p className="eyebrow">말하기 어려운 이야기도, 이름 없이</p>
        <h1>고민을 부치면<br />누군가 답장을 보내요<span className="dot">.</span></h1>
        <p>고민을 익명으로 남기고, 낯선 누군가의 고민에 한마디를 건네 보세요.</p>
      </section>

      <section className="choices">
        <Link href="/write" className="choice">
          <span className="choice-icon" aria-hidden="true">✎</span>
          <h2>고민 부치기</h2>
          <p>고민을 쓰면 나만의 편지 링크가 생겨요. 그 링크로 답장을 확인해요.</p>
          <span className="choice-cta">편지 쓰기 →</span>
        </Link>
        <Link href="/draw" className="choice">
          <span className="choice-icon" aria-hidden="true">✉</span>
          <h2>답장해 주기</h2>
          <p>아직 답장이 적은 고민 하나를 무작위로 받아 댓글을 남겨요.</p>
          <span className="choice-cta">편지 받기 →</span>
        </Link>
      </section>

      {mine.length > 0 && (
        <section className="feed" aria-labelledby="mine-title">
          <div className="section-top">
            <div><h2 id="mine-title">내가 부친 고민</h2><p className="feed-caption">이 브라우저에서 쓴 편지만 보여요</p></div>
          </div>
          <ul className="mine-list">
            {mine.map((id, index) => (
              <li key={id}><Link href={`/letter/${id}`}>{mine.length - index}번째 편지 · 답장 보러 가기 →</Link></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
