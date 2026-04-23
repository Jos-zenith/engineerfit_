create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('student', 'recruiter')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cognitive_score int not null,
  behavioral_score int not null,
  domain_score int not null,
  role_alignment_score int not null,
  career_hygiene_score int not null,
  retention_prediction int not null,
  overall_score int not null,
  irt_theta numeric(6,4) not null default 0,
  irt_score int not null default 50,
  explanation jsonb,
  anomaly_flags jsonb,
  created_at timestamptz not null default now()
);

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

create table if not exists public.assessment_responses (
  id bigserial primary key,
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id int not null,
  selected_index int not null,
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  time_spent_seconds numeric(8,2) not null,
  is_correct boolean not null,
  theta_before numeric(6,4),
  theta_after numeric(6,4),
  expected_probability numeric(8,6),
  information_value numeric(10,6),
  anomaly_score numeric(6,4),
  created_at timestamptz not null default now()
);

create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text not null,
  location text not null,
  employment_type text not null,
  salary_range text not null,
  min_fit_score int not null default 70,
  min_career_hygiene_score int not null default 60,
  requirements jsonb not null,
  job_vector jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.job_postings enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_self_upsert on public.profiles;
create policy profiles_self_upsert
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists attempts_student_read on public.assessment_attempts;
create policy attempts_student_read
on public.assessment_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists attempts_student_insert on public.assessment_attempts;
create policy attempts_student_insert
on public.assessment_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

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

drop policy if exists responses_student_read on public.assessment_responses;
create policy responses_student_read
on public.assessment_responses
for select
to authenticated
using (
  exists (
    select 1 from public.assessment_attempts a
    where a.id = assessment_responses.attempt_id
      and a.user_id = auth.uid()
  )
);

drop policy if exists responses_student_insert on public.assessment_responses;
create policy responses_student_insert
on public.assessment_responses
for insert
to authenticated
with check (
  exists (
    select 1 from public.assessment_attempts a
    where a.id = assessment_responses.attempt_id
      and a.user_id = auth.uid()
  )
);

drop policy if exists job_postings_recruiter_crud on public.job_postings;
create policy job_postings_recruiter_crud
on public.job_postings
for all
to authenticated
using (auth.uid() = recruiter_id)
with check (auth.uid() = recruiter_id);

insert into public.job_postings (
  recruiter_id,
  title,
  company,
  location,
  employment_type,
  salary_range,
  requirements,
  job_vector,
  min_fit_score,
  min_career_hygiene_score
)
select
  id,
  'Junior Software Developer',
  'TechCorp Solutions',
  'Chennai, Tamil Nadu',
  'Full-Time, On-site',
  '4.5 - 6.0 LPA',
  '{"cognitive":{"logicalReasoning":70,"problemSolving":65,"analyticalThinking":60},"behavioral":{"conscientiousness":65,"grit":70,"teamwork":60},"domain":{"dataStructures":75,"webDevelopment":70,"databases":65}}'::jsonb,
  '[70,65,60,65,70,60]'::jsonb,
  70,
  60
from public.profiles
where role = 'recruiter'
on conflict do nothing;
