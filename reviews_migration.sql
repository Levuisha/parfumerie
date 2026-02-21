-- Reviews table + RLS policies

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fragrance_id bigint not null references public.fragrances(id) on delete cascade,
  text text not null,
  unique (user_id, fragrance_id)
);

create index if not exists reviews_fragrance_created_at_idx
  on public.reviews (fragrance_id, created_at desc);

create index if not exists reviews_user_id_idx
  on public.reviews (user_id);

create or replace function public.set_review_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_review_updated_at on public.reviews;
create trigger set_review_updated_at
before update on public.reviews
for each row
execute function public.set_review_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all"
  on public.reviews
  for select
  using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own"
  on public.reviews
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own"
  on public.reviews
  for delete
  using (auth.uid() = user_id);
