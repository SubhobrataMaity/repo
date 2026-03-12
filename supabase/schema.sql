-- ============================================================
--  Animatrips CMS — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
--  TABLE: projects
-- ────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  description          text not null default '',
  slug                 text not null unique,
  folder_name          text not null default '',
  cover_image          text not null default '',
  show_in_work_page    boolean not null default true,
  show_in_selected_work boolean not null default false,
  display_order        integer not null default 0,
  created_at           timestamptz not null default now()
);

create index if not exists projects_display_order_idx on public.projects (display_order);
create index if not exists projects_show_in_selected_work_idx on public.projects (show_in_selected_work);
create index if not exists projects_show_in_work_page_idx on public.projects (show_in_work_page);

-- ────────────────────────────────────────────────────────────
--  TABLE: project_images
-- ────────────────────────────────────────────────────────────
create table if not exists public.project_images (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  image_path   text not null,
  image_order  integer not null default 0
);

create index if not exists project_images_project_id_idx on public.project_images (project_id);

-- ────────────────────────────────────────────────────────────
--  TABLE: faq
-- ────────────────────────────────────────────────────────────
create table if not exists public.faq (
  id            uuid primary key default gen_random_uuid(),
  question      text not null,
  answer        text not null,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists faq_display_order_idx on public.faq (display_order);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists faq_updated_at on public.faq;
create trigger faq_updated_at
  before update on public.faq
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
--  TABLE: journals
-- ────────────────────────────────────────────────────────────
create table if not exists public.journals (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text not null default '',
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
--  TABLE: admin_users
--  Stores a single admin record with a bcrypt password hash.
--  Password: "password"  →  bcrypt hash below (cost 12)
-- ────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  password_hash text not null
);

-- Seed the admin user (password = "password", bcrypt cost 12)
-- Hash generated with: bcrypt.hashSync("password", 12)
insert into public.admin_users (password_hash)
select '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/oBGx8BRWy'
where not exists (select 1 from public.admin_users);

-- ────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
--  - Public tables (projects, faq) are readable by everyone (anon).
--  - Write operations go through the service-role key (server-side API).
--  - admin_users is completely private (no public access).
-- ────────────────────────────────────────────────────────────

-- projects: public READ, no public WRITE
alter table public.projects enable row level security;

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects for select
  using (true);

-- project_images: public READ
alter table public.project_images enable row level security;

drop policy if exists "Public can read project images" on public.project_images;
create policy "Public can read project images"
  on public.project_images for select
  using (true);

-- faq: public READ
alter table public.faq enable row level security;

drop policy if exists "Public can read faq" on public.faq;
create policy "Public can read faq"
  on public.faq for select
  using (true);

-- journals: NO public access (backend only)
alter table public.journals enable row level security;
-- No public policies — service role key bypasses RLS

-- admin_users: NO public access
alter table public.admin_users enable row level security;
-- No public policies — service role key bypasses RLS

-- ────────────────────────────────────────────────────────────
--  DONE
--  After running this script:
--  1. Copy your Project URL + Anon Key + Service Role Key from
--     Supabase Dashboard → Settings → API
--  2. Paste them into your .env file
--  3. Restart both the Vite dev server and the Express API server
-- ────────────────────────────────────────────────────────────
