-- Ahmedify database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

  create extension if not exists "pgcrypto";

create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_id uuid not null references artists(id) on delete cascade,
  cover_url text,
  release_year int,
  created_at timestamptz not null default now()
);

create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_id uuid not null references artists(id) on delete cascade,
  album_id uuid references albums(id) on delete set null,
  cover_url text,
  audio_url text not null,
  duration_seconds int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_url text,
  song_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists songs_artist_id_idx on songs(artist_id);
create index if not exists songs_album_id_idx on songs(album_id);
create index if not exists albums_artist_id_idx on albums(artist_id);

-- Row Level Security: locked down by default. The server accesses these
-- tables exclusively via the Supabase service-role key, which bypasses RLS,
-- so no public policies are needed — the API is the only door in.
alter table artists enable row level security;
alter table albums enable row level security;
alter table songs enable row level security;
alter table playlists enable row level security;

-- Storage bucket for uploaded cover art / audio files (used by POST /api/upload)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
