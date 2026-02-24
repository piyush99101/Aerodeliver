-- Create Orders table
create table orders (
  id uuid primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references auth.users(id),
  status text check (status in ('pending', 'in-transit', 'delivered')),
  pickup text,
  delivery text,
  eta text,
  price numeric,
  item text,
  date text,
  fragile BOOLEAN DEFAULT false
);

-- Contact Messages Table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id TEXT,
  recipient_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Drones table
create table drones (
  id text primary key, -- Using text ID to match current frontend mocking
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references auth.users(id),
  model text,
  status text check (status in ('active', 'charging', 'maintenance', 'offline')),
  battery numeric,
  flights numeric,
  hours numeric,
  last_maintenance text,
  image text
);

-- Enable Row Level Security (RLS)
alter table orders enable row level security;
alter table drones enable row level security;

-- Create Policies
-- Allow authenticated users to view all orders (or filter by customer_id if you prefer strict privacy)
create policy "Enable read access for authenticated users" on orders
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on orders
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on orders
  for update using (auth.role() = 'authenticated');

-- Policies for Drones
create policy "Enable read access for all users" on drones
  for select using (true);

create policy "Enable insert for authenticated users" on drones
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on drones
  for update using (auth.role() = 'authenticated');
