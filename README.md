# 익명 고민 편지함

고민을 익명으로 부치면 누구나 댓글로 답장을 남길 수 있는 편지함입니다. 로그인 없이 **편지 링크**로 내 고민과 받은 답장을 다시 확인합니다.

## 사용자 흐름

```text
[홈] ─┬─ 고민 부치기 (/write) → 저장 → 편지 링크 발급(복사) → /letter/[id]에서 답장 확인
      └─ 답장해 주기 (/draw) → 댓글 적은 고민을 무작위로 받기 → /letter/[id]에서 댓글 답장
                                                         └→ 다른 고민 받기 / 나도 고민 부치기
```

- 답장(댓글)은 개수 제한 없이 누구나 남길 수 있습니다.
- 무작위 뽑기는 댓글이 적은 고민(0 → 1 → 2 → 3개 이상)을 먼저 보여 줍니다.
- 내가 쓴 고민은 이 브라우저(localStorage)에 기억해서 뽑기에서 빼고, 홈의 "내가 부친 고민"에 보여 줍니다.

## 구조

```text
브라우저 (Next.js App Router, 클라이언트 컴포넌트)
  → Supabase SDK (lib/supabase.ts)
  → Supabase Data API → RLS·제약조건 검사 → PostgreSQL letters / comments
```

```text
app/page.tsx              홈: 두 가지 선택 + 내가 부친 고민
app/write/page.tsx        고민 쓰기 → letters 저장 → 편지 링크로 이동
app/draw/page.tsx         draw_letter RPC로 무작위 고민 받기
app/letter/[id]/page.tsx  고민 + 댓글 목록 + 댓글 쓰기 + 링크 복사 + 다른 고민 받기
lib/letters.ts            타입·상수·localStorage·뽑기 함수
lib/supabase.ts           환경변수 확인과 SDK 연결
supabase/schema.sql       테이블·권한·RLS·draw_letter 함수
```

## DB

| 테이블 | 컬럼 | 권한(anon) |
|---|---|---|
| `letters` | id, content(1~1000자), created_at | 조회, content 입력 |
| `comments` | id, letter_id → letters, content(1~500자), created_at | 조회, letter_id·content 입력 |

수정·삭제 권한은 없습니다. `draw_letter(exclude uuid[])` 함수는 제외 목록을 뺀 편지 중 댓글이 적은 순 → 무작위로 id 하나를 돌려줍니다.

## 실행

1. Supabase SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다.
2. `.env.example`을 `.env.local`로 복사하고 Project URL과 publishable key를 넣습니다.
3. `npm ci && npm run dev` → http://localhost:3000
4. Vercel에 같은 두 환경변수를 등록하고 배포합니다.

## 스택

Next.js 16 · React 19 · Supabase (PostgreSQL, RLS) · Vercel
