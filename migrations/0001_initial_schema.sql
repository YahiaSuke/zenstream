-- Migration: 0001_initial_schema.sql
-- Created: 2026-11-20
-- Description: Initial schema for ZenStream VOD Platform

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  plan_tier text not null default 'standard' check (plan_tier in ('basic', 'standard', 'premium')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on users (email);
create index if not exists idx_users_stripe_customer on users (stripe_customer_id);

-- PROFILES
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 30),
  avatar_url text not null default '/avatars/default-red.png',
  is_kid boolean not null default false,
  language text not null default 'en',
  autoplay_next boolean not null default true,
  autoplay_previews boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_user_id on profiles (user_id);

-- GENRES
create table if not exists genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_genres_slug on genres (slug);

-- TITLES
create table if not exists titles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  type text not null check (type in ('movie', 'series')),
  synopsis text not null,
  release_year integer not null check (release_year between 1900 and 2100),
  maturity_rating text not null default 'TV-14'
    check (maturity_rating in ('G', 'PG', 'PG-13', 'TV-Y', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA', 'R', 'NC-17')),
  duration_minutes integer check (type = 'series' or duration_minutes > 0),
  total_seasons integer check (type = 'movie' or total_seasons > 0),
  thumbnail_url text not null,
  backdrop_url text not null,
  trailer_url text,
  video_url text check (type = 'series' or video_url is not null),
  match_score integer not null default 95 check (match_score between 50 and 100),
  is_featured boolean not null default false,
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(synopsis, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_titles_type on titles (type);
create index if not exists idx_titles_is_featured on titles (is_featured);
create index if not exists idx_titles_release_year on titles (release_year desc);
create index if not exists idx_titles_search_vector on titles using gin (search_vector);
create index if not exists idx_titles_trgm on titles using gin (title gin_trgm_ops);

-- TITLE_GENRES
create table if not exists title_genres (
  title_id uuid not null references titles(id) on delete cascade,
  genre_id uuid not null references genres(id) on delete cascade,
  primary key (title_id, genre_id)
);

-- SEASONS
create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references titles(id) on delete cascade,
  season_number integer not null check (season_number > 0),
  title text not null default 'Season 1',
  synopsis text,
  created_at timestamptz not null default now(),
  unique(series_id, season_number)
);

-- EPISODES
create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  title text not null,
  synopsis text not null default '',
  duration_minutes integer not null check (duration_minutes > 0),
  thumbnail_url text not null,
  video_url text not null,
  intro_start_seconds integer check (intro_start_seconds >= 0),
  intro_end_seconds integer check (intro_end_seconds > intro_start_seconds),
  credits_start_seconds integer check (credits_start_seconds > coalesce(intro_end_seconds, 0)),
  created_at timestamptz not null default now(),
  unique (season_id, episode_number)
);

-- WATCH_HISTORIES
create table if not exists watch_histories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  episode_id uuid references episodes(id) on delete cascade,
  progress_seconds integer not null default 0 check (progress_seconds >= 0),
  duration_seconds integer not null check (duration_seconds > 0),
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_watch_history_unique
on watch_histories (profile_id, title_id, coalesce(episode_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index if not exists idx_watch_history_profile_last_watched
on watch_histories (profile_id, last_watched_at desc);

-- WATCHLISTS
create table if not exists watchlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (profile_id, title_id)
);

create index if not exists idx_watchlists_profile on watchlists (profile_id, added_at desc);

-- RATINGS
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  rating text not null check (rating in ('dislike', 'like', 'love')),
  updated_at timestamptz not null default now(),
  unique (profile_id, title_id)
);

-- RLS ACTIVATION
alter table users enable row level security;
alter table profiles enable row level security;
alter table titles enable row level security;
alter table genres enable row level security;
alter table title_genres enable row level security;
alter table seasons enable row level security;
alter table episodes enable row level security;
alter table watch_histories enable row level security;
alter table watchlists enable row level security;
alter table ratings enable row level security;
