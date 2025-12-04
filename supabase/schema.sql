-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- HELPER FUNCTIONS
-- Function to securely check if the current user is an admin
-- Used in RLS policies to avoid recursion and enhance security
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Table
-- Managed via Triggers from auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for Profiles
create policy "Users can see own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Admins can view all profiles"
  on profiles for select
  using ( is_admin() );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Admins can update any profile"
  on profiles for update
  using ( is_admin() );

create policy "Admins can delete any profile"
  on profiles for delete
  using ( is_admin() );

-- 2. Organizations Table
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  allow_join boolean default false, -- If true, users can see it in 'availableOrgs'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.organizations enable row level security;

-- RLS for Organizations
create policy "Organizations are viewable by everyone if allow_join is true"
  on organizations for select
  using ( allow_join = true );

create policy "Members can view their organizations"
  on organizations for select
  using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
    )
  );
  
create policy "Admins can view all organizations"
  on organizations for select
  using ( is_admin() );

create policy "Admins can insert organizations"
  on organizations for insert
  with check ( is_admin() );

create policy "Admins can update organizations"
  on organizations for update
  using ( is_admin() );

create policy "Admins can delete organizations"
  on organizations for delete
  using ( is_admin() );

-- 3. Organization Members Table
create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  organization_id uuid references public.organizations(id) not null,
  role text default 'member' check (role in ('member', 'admin')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, organization_id)
);

alter table public.organization_members enable row level security;

create policy "Users can view their own memberships"
  on organization_members for select
  using ( auth.uid() = user_id );

create policy "Users can join open organizations"
  on organization_members for insert
  with check (
    auth.uid() = user_id 
    and exists (
      select 1 from organizations 
      where id = organization_id 
      and allow_join = true
    )
  );

create policy "Users can leave organizations"
  on organization_members for delete
  using ( auth.uid() = user_id );

create policy "Admins can view all memberships"
  on organization_members for select
  using ( is_admin() );

create policy "Admins can insert memberships"
  on organization_members for insert
  with check ( is_admin() );

create policy "Admins can delete memberships"
  on organization_members for delete
  using ( is_admin() );

-- 4. Question Banks Table
create table public.question_banks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  is_public boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.question_banks enable row level security;

-- RLS for Banks
create policy "Users view banks assigned to their orgs"
  on question_banks for select
  using (
    exists (
      select 1 from organization_banks ob
      join organization_members om on ob.organization_id = om.organization_id
      where ob.bank_id = question_banks.id
      and om.user_id = auth.uid()
    )
  );

create policy "Admins can view all banks"
  on question_banks for select
  using ( is_admin() );

create policy "Admins can insert question banks"
  on question_banks for insert
  with check ( is_admin() );

create policy "Admins can update question banks"
  on question_banks for update
  using ( is_admin() );

create policy "Admins can delete question banks"
  on question_banks for delete
  using ( is_admin() );

-- 5. Organization Banks (Many-to-Many Link)
create table public.organization_banks (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  bank_id uuid references public.question_banks(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, bank_id)
);

alter table public.organization_banks enable row level security;

create policy "Users view org-bank links for their orgs"
  on organization_banks for select
  using (
      exists (
      select 1 from organization_members om
      where om.organization_id = organization_banks.organization_id
      and om.user_id = auth.uid()
    )
  );

create policy "Admins can manage org banks"
  on organization_banks for all
  using ( is_admin() );

-- 6. Questions Table
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  bank_id uuid references public.question_banks(id) not null,
  type text not null check (type in ('single', 'multi', 'judge')),
  title text not null,
  options jsonb, -- Stores array of {label, value} objects
  answer jsonb, -- Stores string (single/judge) or array of strings (multi)
  parse text, -- Explanation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.questions enable row level security;

-- RLS for Questions
create policy "Users view questions in accessible banks"
  on questions for select
  using (
    exists (
      select 1 from question_banks qb
      where qb.id = questions.bank_id
      and (
          exists (
              select 1 from organization_banks ob
              join organization_members om on ob.organization_id = om.organization_id
              where ob.bank_id = qb.id
              and om.user_id = auth.uid()
          )
      )
    )
  );

create policy "Admins can view all questions"
  on questions for select
  using ( is_admin() );

create policy "Admins can insert questions"
  on questions for insert
  with check ( is_admin() );

create policy "Admins can update questions"
  on questions for update
  using ( is_admin() );

create policy "Admins can delete questions"
  on questions for delete
  using ( is_admin() );


-- TRIGGERS

-- Handle New User -> Create Profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    'user', -- default role
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Ensure trigger exists (idempotent in SQL usually requires drop/create or IF NOT EXISTS logic, 
-- but for schema file we just define it)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();