-- ==============================================================================
-- Netflix Web Clone - Database Schema (PostgreSQL)
-- Fully normalized DDL with Constraints, Indexes, and Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ------------------------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------------------------
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  plan_tier text not null default 'standard'
    check (plan_tier in ('basic', 'standard', 'premium')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_email on users (email);
create index idx_users_stripe_customer on users (stripe_customer_id);

-- ------------------------------------------------------------------------------
-- 2. PROFILES (Max 5 per user)
-- ------------------------------------------------------------------------------
create table profiles (
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

create index idx_profiles_user_id on profiles (user_id);

-- Function and trigger to enforce maximum 5 profiles per account
create or replace function check_max_profiles_per_user()
returns trigger as $$
begin
  if (select count(*) from profiles where user_id = new.user_id) >= 5 then
    raise exception 'Account profile limit reached (maximum 5 profiles allowed)';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_enforce_max_profiles
before insert on profiles
for each row
execute function check_max_profiles_per_user();

-- ------------------------------------------------------------------------------
-- 3. GENRES
-- ------------------------------------------------------------------------------
create table genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index idx_genres_slug on genres (slug);

-- ------------------------------------------------------------------------------
-- 4. TITLES (Movies & TV Series)
-- ------------------------------------------------------------------------------
create table titles (
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

create index idx_titles_type on titles (type);
create index idx_titles_is_featured on titles (is_featured);
create index idx_titles_release_year on titles (release_year desc);
create index idx_titles_search_vector on titles using gin (search_vector);
create index idx_titles_trgm on titles using gin (title gin_trgm_ops);

-- ------------------------------------------------------------------------------
-- 5. TITLE_GENRES (Many-to-Many)
-- ------------------------------------------------------------------------------
create table title_genres (
  title_id uuid not null references titles(id) on delete cascade,
  genre_id uuid not null references genres(id) on delete cascade,
  primary key (title_id, genre_id)
);

create index idx_title_genres_genre on title_genres (genre_id, title_id);

-- ------------------------------------------------------------------------------
-- 6. SEASONS (For Series)
-- ------------------------------------------------------------------------------
create table seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references titles(id) on delete cascade,
  season_number integer not null check (season_number > 0),
  title text not null default 'Season 1',
  synopsis text,
  created_at timestamptz not null default now(),
  unique(series_id, season_number)
);

create index idx_seasons_series on seasons (series_id, season_number);

-- ------------------------------------------------------------------------------
-- 7. EPISODES
-- ------------------------------------------------------------------------------
create table episodes (
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

create index idx_episodes_season on episodes (season_id, episode_number);

-- ------------------------------------------------------------------------------
-- 8. WATCH_HISTORIES (Continue Watching)
-- ------------------------------------------------------------------------------
create table watch_histories (
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

-- Ensure a profile has only one history entry per movie, or one per episode for a series
create unique index idx_watch_history_unique
on watch_histories (profile_id, title_id, coalesce(episode_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index idx_watch_history_profile_last_watched
on watch_histories (profile_id, last_watched_at desc);

-- ------------------------------------------------------------------------------
-- 9. WATCHLISTS (My List)
-- ------------------------------------------------------------------------------
create table watchlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (profile_id, title_id)
);

create index idx_watchlists_profile on watchlists (profile_id, added_at desc);

-- ------------------------------------------------------------------------------
-- 10. RATINGS (Thumb Reactions)
-- ------------------------------------------------------------------------------
create table ratings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  rating text not null check (rating in ('dislike', 'like', 'love')),
  updated_at timestamptz not null default now(),
  unique (profile_id, title_id)
);

create index idx_ratings_profile on ratings (profile_id, title_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
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

-- Public read access for catalog items
create policy "Titles are readable by all authenticated users"
  on titles for select to authenticated using (true);

create policy "Genres are readable by all authenticated users"
  on genres for select to authenticated using (true);

create policy "Title genres are readable by all authenticated users"
  on title_genres for select to authenticated using (true);

create policy "Seasons are readable by all authenticated users"
  on seasons for select to authenticated using (true);

create policy "Episodes are readable by all authenticated users"
  on episodes for select to authenticated using (true);

-- Users can only view and update their own account
create policy "Users manage own account"
  on users for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Profiles: Users can only manage profiles belonging to their user_id
create policy "Users manage own profiles"
  on profiles for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Watch Histories: Profile must belong to authenticated user
create policy "Users manage watch histories for their profiles"
  on watch_histories for all to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = watch_histories.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = watch_histories.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- Watchlist: Profile must belong to authenticated user
create policy "Users manage watchlist for their profiles"
  on watchlists for all to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = watchlists.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = watchlists.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- Ratings: Profile must belong to authenticated user
create policy "Users manage ratings for their profiles"
  on ratings for all to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = ratings.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = ratings.profile_id
      and profiles.user_id = auth.uid()
    )
  );
