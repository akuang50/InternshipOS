-- InternshipOS production schema. User-owned tables use auth.uid() policies.
-- Jobs are global catalog rows written by the service role, not by the browser.
-- Apply this separately to dev, staging, and production Supabase projects.
-- Never point local development at the production project.
-- Auth site URL for production is the Vercel hostname (https://internshipos.vercel.app),
-- not a custom domain. Add localhost:3000 for the dev project. Update redirects only
-- if a custom domain is attached later.

create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  school text not null default '',
  major text not null default '',
  headline text not null default '',
  location text not null default '',
  graduation_year int,
  preferences jsonb not null default '{}'::jsonb,
  privacy jsonb not null default '{"personalizeFromProfile":true,"saveAiHistory":true,"shareAnonymizedProductData":false}'::jsonb,
  onboarding_complete boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  summary text not null default '',
  skills text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid not null references public.resumes (id) on delete cascade,
  company text not null default '',
  title text not null default '',
  start_date text not null default '',
  end_date text not null default '',
  bullets text[] not null default '{}'
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid not null references public.resumes (id) on delete cascade,
  school text not null default '',
  degree text not null default '',
  major text not null default '',
  graduation_year int
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid not null references public.resumes (id) on delete cascade,
  name text not null default '',
  bullets text[] not null default '{}',
  skills text[] not null default '{}'
);

create table public.jobs (
  id text primary key,
  company text not null,
  title text not null,
  location text not null,
  workplace text not null,
  description text not null,
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  application_url text not null,
  source_urls text[] not null default '{}',
  sources jsonb not null default '[]'::jsonb,
  industry text not null default '',
  company_size text not null,
  employee_count int not null default 0,
  company_summary text,
  deadline timestamptz,
  work_auth text not null,
  graduation_years int[] not null default '{}',
  role_family text not null,
  degree_hints text[] not null default '{}',
  description_hash text not null,
  first_seen_at timestamptz not null,
  source_posted_at timestamptz not null,
  last_seen_at timestamptz not null
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null references public.jobs (id),
  status text not null,
  saved boolean not null default true,
  batch_name text,
  tailored jsonb,
  cover_letter jsonb,
  answers jsonb not null default '[]'::jsonb,
  notes text not null default '',
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null default '',
  name text not null default '',
  why text not null default '',
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete cascade,
  channel text not null,
  body text not null default '',
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  scheduled_at timestamptz,
  notes text not null default ''
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  star jsonb not null default '{}'::jsonb
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  application_id uuid,
  status text not null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prep_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_ids uuid[] not null,
  index int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Operational telemetry. Never store resume text, cover letters, answers, or prompts here.
create table public.ai_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  feature text not null,
  model text not null,
  latency_ms int not null,
  success boolean not null,
  accepted boolean,
  created_at timestamptz not null default now()
);

create index jobs_posted_idx on public.jobs (source_posted_at desc);
create index jobs_company_idx on public.jobs (company);
create index applications_user_idx on public.applications (user_id, updated_at desc);
create index tasks_user_idx on public.tasks (user_id, status);
create index experiences_user_idx on public.experiences (user_id);
create index documents_user_idx on public.documents (user_id);

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.projects enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.contacts enable row level security;
alter table public.messages enable row level security;
alter table public.interviews enable row level security;
alter table public.stories enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.tasks enable row level security;
alter table public.prep_sessions enable row level security;
alter table public.ai_events enable row level security;

create policy profiles_own on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy resumes_own on public.resumes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy experiences_own on public.experiences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy education_own on public.education
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy projects_own on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy jobs_read on public.jobs
  for select using (auth.uid() is not null);
create policy applications_own on public.applications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy contacts_own on public.contacts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy messages_own on public.messages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy interviews_own on public.interviews
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy stories_own on public.stories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy documents_own on public.documents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_own on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tasks_own on public.tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sessions_own on public.prep_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ai_events_own on public.ai_events
  for select using (user_id = auth.uid());
