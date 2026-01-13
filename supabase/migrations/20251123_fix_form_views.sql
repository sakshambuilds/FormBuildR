alter table form_views
add column if not exists created_at timestamp with time zone default now();
