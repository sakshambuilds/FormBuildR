create table form_views (
  id uuid default uuid_generate_v4() primary key,
  form_id uuid references forms(id) not null,
  created_at timestamp with time zone default now()
);

-- form_submissions table already exists with a created_at timestamp column
