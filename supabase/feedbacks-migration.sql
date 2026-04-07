-- Feedbacks table: stores user feedback from the in-app widget
-- Run this in Supabase SQL Editor

create table if not exists public.feedbacks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  category text not null default 'other' check (category in ('bug', 'suggestion', 'question', 'other')),
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'resolved', 'archived')),
  admin_note text,
  created_at timestamptz default now() not null
);

-- RLS: users can insert their own feedback, admins read all
alter table public.feedbacks enable row level security;

create policy "Users can insert own feedback"
  on public.feedbacks for insert
  with check (auth.uid() = user_id);

create policy "Service role full access"
  on public.feedbacks for all
  using (true)
  with check (true);

-- Index for admin queries
create index if not exists idx_feedbacks_created_at on public.feedbacks(created_at desc);
create index if not exists idx_feedbacks_status on public.feedbacks(status);
