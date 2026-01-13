-- Add publishing fields to forms table
alter table forms 
add column if not exists is_published boolean default false,
add column if not exists published_at timestamp with time zone,
add column if not exists description text,
add column if not exists category text default 'Other',
add column if not exists thumbnail_url text;

-- Enable RLS on forms (should be already enabled, but good to ensure)
alter table forms enable row level security;

-- Policy: Users can update their own forms (existing policies might cover this, but ensuring specific update access)
create policy "Users can update their own forms"
on forms for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Public can view published forms
create policy "Public can view published forms"
on forms for select
using (is_published = true);
