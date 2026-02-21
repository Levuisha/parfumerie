-- Friends table + RLS policies

create table if not exists public.friends (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  unique (user_id, friend_id)
);

alter table public.friends enable row level security;

drop policy if exists "friends_select_own_or_friend" on public.friends;
create policy "friends_select_own_or_friend"
  on public.friends
  for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "friends_insert_own" on public.friends;
create policy "friends_insert_own"
  on public.friends
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "friends_delete_own" on public.friends;
create policy "friends_delete_own"
  on public.friends
  for delete
  using (auth.uid() = user_id);

-- Public read policies (MVP)
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles
  for select
  using (true);

alter table public.user_fragrance_status enable row level security;
drop policy if exists "user_fragrance_status_select_public" on public.user_fragrance_status;
create policy "user_fragrance_status_select_public"
  on public.user_fragrance_status
  for select
  using (true);
