alter table public.assessment_attempts
  add column if not exists irt_theta numeric(6,4) not null default 0,
  add column if not exists irt_score int not null default 50;

create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  theta numeric(6,4) not null default 0,
  asked_question_ids int[] not null default '{}',
  response_history jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessment_responses
  add column if not exists theta_before numeric(6,4),
  add column if not exists theta_after numeric(6,4),
  add column if not exists expected_probability numeric(8,6),
  add column if not exists information_value numeric(10,6);

alter table public.assessment_sessions enable row level security;

drop policy if exists sessions_student_read on public.assessment_sessions;
create policy sessions_student_read
on public.assessment_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists sessions_student_insert on public.assessment_sessions;
create policy sessions_student_insert
on public.assessment_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists sessions_student_update on public.assessment_sessions;
create policy sessions_student_update
on public.assessment_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
