alter table public.job_postings
  add column if not exists job_vector jsonb;

update public.job_postings
set job_vector = coalesce(job_vector, '[70,65,60,65,70,60]'::jsonb)
where job_vector is null;
