create extension if not exists "pgcrypto";

create type public.user_role as enum ('minister', 'member', 'user');
create type public.case_status as enum ('pending', 'in_progress', 'closed', 'rejected');
create type public.message_author_type as enum ('student', 'member', 'minister', 'system');
create type public.review_decision as enum ('accepted', 'rejected');
create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  status public.case_status not null default 'pending',
  student_email text not null,
  student_department text not null,
  student_name text not null,
  category text not null,
  subject text not null,
  desired_outcome text not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_student_message_at timestamptz,
  last_staff_message_at timestamptz,
  closed_at timestamptz
);

create table public.case_tokens (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  token_hash text unique not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_type public.message_author_type not null,
  body_text text,
  body_html text,
  created_at timestamptz not null default now()
);

create table public.case_attachments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  message_id uuid references public.case_messages(id) on delete set null,
  storage_path text not null unique,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_by_type public.message_author_type not null default 'student',
  created_at timestamptz not null default now()
);

create table public.draft_replies (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body_html text not null default '',
  body_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, author_id)
);

create table public.review_requests (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  reviewed_by uuid references public.profiles(id) on delete set null,
  decision public.review_decision not null,
  status public.review_status not null default 'pending',
  body_html text not null,
  body_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.email_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete cascade,
  event_key text unique not null,
  provider_id text,
  recipient text not null,
  subject text not null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  case_id uuid references public.cases(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index cases_status_created_idx on public.cases(status, created_at desc);
create index cases_assigned_to_idx on public.cases(assigned_to);
create index case_messages_case_created_idx on public.case_messages(case_id, created_at);
create index case_attachments_case_idx on public.case_attachments(case_id);
create index review_requests_case_status_idx on public.review_requests(case_id, status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger touch_cases_updated_at
before update on public.cases
for each row execute function public.touch_updated_at();

create trigger touch_draft_replies_updated_at
before update on public.draft_replies
for each row execute function public.touch_updated_at();

create or replace function public.is_staff()
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.profiles
    where email = lower(auth.jwt() ->> 'email')
      and role in ('minister', 'member')
  );
$$;

create or replace function public.is_minister()
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.profiles
    where email = lower(auth.jwt() ->> 'email')
      and role = 'minister'
  );
$$;

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_tokens enable row level security;
alter table public.case_messages enable row level security;
alter table public.case_attachments enable row level security;
alter table public.draft_replies enable row level security;
alter table public.review_requests enable row level security;
alter table public.email_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "staff can read profiles"
on public.profiles for select
to authenticated
using (public.is_staff());

create policy "ministers can manage profiles"
on public.profiles for all
to authenticated
using (public.is_minister())
with check (public.is_minister());

create policy "staff can read cases"
on public.cases for select
to authenticated
using (public.is_staff());

create policy "staff can update cases"
on public.cases for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "staff can read messages"
on public.case_messages for select
to authenticated
using (public.is_staff());

create policy "staff can insert messages"
on public.case_messages for insert
to authenticated
with check (public.is_staff());

create policy "staff can read attachments"
on public.case_attachments for select
to authenticated
using (public.is_staff());

create policy "staff can manage drafts"
on public.draft_replies for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "staff can read review requests"
on public.review_requests for select
to authenticated
using (public.is_staff());

create policy "members can create review requests"
on public.review_requests for insert
to authenticated
with check (public.is_staff());

create policy "ministers can update review requests"
on public.review_requests for update
to authenticated
using (public.is_minister())
with check (public.is_minister());

create policy "ministers can read email events"
on public.email_events for select
to authenticated
using (public.is_minister());

create policy "staff can read audit logs"
on public.audit_logs for select
to authenticated
using (public.is_staff());

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.profiles to authenticated, service_role;
grant select, insert, update, delete on public.cases to authenticated, service_role;
grant select, insert, update, delete on public.case_tokens to service_role;
grant select, insert, update, delete on public.case_messages to authenticated, service_role;
grant select, insert, update, delete on public.case_attachments to authenticated, service_role;
grant select, insert, update, delete on public.draft_replies to authenticated, service_role;
grant select, insert, update, delete on public.review_requests to authenticated, service_role;
grant select, insert, update, delete on public.email_events to authenticated, service_role;
grant select, insert, update, delete on public.audit_logs to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-attachments',
  'case-attachments',
  false,
  12582912,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "staff can read attachment objects"
on storage.objects for select
to authenticated
using (bucket_id = 'case-attachments' and public.is_staff());

create policy "staff can upload attachment objects"
on storage.objects for insert
to authenticated
with check (bucket_id = 'case-attachments' and public.is_staff());
