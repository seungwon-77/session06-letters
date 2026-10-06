# 익명 고민 편지함

고민을 익명으로 부치면 누구나 댓글로 답장을 남길 수 있는 편지함입니다. 로그인 없이 **편지 링크**로 내 고민과 받은 답장을 다시 확인합니다.

## 사용자 흐름

```text
[홈 /] 고민 목록(최신 50개, 답장 수 표시)
   ├─ 고민 부치기 (/write) → 저장 → 내 고민 게시글(/letter/[id])로 이동
   └─ 마음 가는 고민 클릭 → /letter/[id] 고민 + 답장 댓글 목록 → 댓글로 답장 남기기
```

- 고민은 게시글처럼 목록에 올라가고, 누구나 원하는 고민에 개수 제한 없이 댓글로 답장할 수 있습니다.
- 로그인은 없습니다. 내가 쓴 고민은 이 브라우저(localStorage)에 기억해 "내 고민"으로 표시합니다.

## 구조

```text
브라우저 (Next.js App Router, 클라이언트 컴포넌트)
  → Supabase SDK (lib/supabase.ts)
  → Supabase Data API → RLS·제약조건 검사 → PostgreSQL letters / comments
```

```text
app/page.tsx              홈: 고민 목록(답장 수 포함) + 고민 부치기 버튼
app/write/page.tsx        고민 쓰기 → letters 저장 → 편지 링크로 이동
app/letter/[id]/page.tsx  고민 + 답장 댓글 목록 + 댓글 쓰기
lib/letters.ts            타입·상수·localStorage
lib/supabase.ts           환경변수 확인과 SDK 연결
supabase/schema.sql       테이블·인덱스·권한·RLS
```

## DB

| 테이블 | 컬럼 | 권한(anon) |
|---|---|---|
| `letters` | id, content(1~1000자), created_at | 조회, content 입력 |
| `comments` | id, letter_id → letters, content(1~500자), created_at | 조회, letter_id·content 입력 |

수정·삭제 권한은 없습니다. 목록의 답장 수는 `comments(count)` 임베드로 함께 조회합니다.

## 실행

1. Supabase SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다.
2. `.env.example`을 `.env.local`로 복사하고 Project URL과 publishable key를 넣습니다.
3. `npm ci && npm run dev` → http://localhost:3000
4. Vercel에 같은 두 환경변수를 등록하고 배포합니다.

## 스택

Next.js 16 · React 19 · Supabase (PostgreSQL, RLS) · Vercel
