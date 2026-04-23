alter table if exists public.assessment_attempts
  add column if not exists explanation jsonb,
  add column if not exists anomaly_flags jsonb;

alter table if exists public.assessment_responses
  add column if not exists anomaly_score numeric(6,4);
