create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  fecha date not null,
  hora time not null,
  estado text not null check (estado in ('próximo', 'agotado', 'finalizado', 'cancelado')),
  imagen_fondo text,
  link_registro text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.eventos enable row level security;

-- El sitio público puede leer eventos; solo administradores pueden mutarlos.
create policy "Public can read events"
  on public.eventos for select
  using (true);

create policy "Authenticated users can create events"
  on public.eventos for insert
  to authenticated
  with check (auth.uid() = created_by and (auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Authenticated users can update events"
  on public.eventos for update
  to authenticated
  using (auth.uid() = created_by and (auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check (auth.uid() = created_by and (auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Authenticated users can delete events"
  on public.eventos for delete
  to authenticated
  using (auth.uid() = created_by and (auth.jwt()->'app_metadata'->>'role') = 'admin');

insert into storage.buckets (id, name, public)
values ('eventos', 'eventos', true)
on conflict (id) do update set public = true;

create policy "Authenticated users can upload event images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'eventos' and (auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Authenticated users can delete event images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'eventos' and (auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Public can read event images"
  on storage.objects for select
  using (bucket_id = 'eventos');
