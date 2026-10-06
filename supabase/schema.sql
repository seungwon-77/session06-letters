-- 익명 고민 편지함 — Supabase PostgreSQL 스키마
-- SQL Editor에 이 파일 전체를 붙여 넣고 한 번 실행하세요.
-- 같은 이름의 테이블이 있으면 중단됩니다. 기존 테이블(posts 등)은 건드리지 않습니다.
begin;

create table public.letters (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_at timestamptz not null default now(),
  constraint letters_content_length check (char_length(content) between 1 and 1000),
  constraint letters_content_not_blank check (content ~ '[^[:space:]]')
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint comments_content_length check (char_length(content) between 1 and 500),
  constraint comments_content_not_blank check (content ~ '[^[:space:]]')
);

-- 편지 화면의 댓글 조회: WHERE letter_id = ? ORDER BY created_at
create index comments_letter_id_created_at_idx
  on public.comments (letter_id, created_at);

alter table public.letters enable row level security;
alter table public.comments enable row level security;

-- 조회와 내용 입력만 허용합니다. 수정·삭제는 막습니다.
revoke all on table public.letters, public.comments from public, anon, authenticated;
grant usage on schema public to anon;
grant select on table public.letters, public.comments to anon;
grant insert (content) on table public.letters to anon;
grant insert (letter_id, content) on table public.comments to anon;

create policy "Public can read letters" on public.letters
  for select to anon using (true);
create policy "Public can write letters" on public.letters
  for insert to anon with check (true);
create policy "Public can read comments" on public.comments
  for select to anon using (true);
create policy "Public can write comments" on public.comments
  for insert to anon with check (true);

-- 무작위 고민 뽑기: 내가 쓴 편지·방금 본 편지(exclude)는 빼고,
-- 댓글이 적은 편지(0개 → 1개 → 2개 → 3개 이상)를 먼저 무작위로 고릅니다.
create function public.draw_letter(exclude uuid[] default '{}')
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select l.id
  from public.letters l
  left join public.comments c on c.letter_id = l.id
  where not (l.id = any (coalesce(exclude, '{}')))
  group by l.id
  order by least(count(c.id), 3), random()
  limit 1;
$$;

revoke all on function public.draw_letter(uuid[]) from public;
grant execute on function public.draw_letter(uuid[]) to anon;

commit;
