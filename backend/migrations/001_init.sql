-- skema awal mengikuti struktur data starter kit studytrack

create table users (
  id integer generated always as identity primary key,
  nama text not null,
  email text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- email unik tanpa membedakan huruf besar dan kecil
create unique index users_email_lower_key on users (lower(email));

create table courses (
  id integer generated always as identity primary key,
  user_id integer not null references users (id) on delete cascade,
  name text not null,
  kode text not null default '',
  dosen text not null default '',
  -- dibutuhkan sebagai target foreign key komposit dari tabel tasks
  unique (id, user_id)
);

create index courses_user_id_idx on courses (user_id);

create type task_status as enum ('belum', 'selesai');

create table tasks (
  id integer generated always as identity primary key,
  user_id integer not null references users (id) on delete cascade,
  mata_kuliah_id integer not null,
  judul text not null,
  deskripsi text not null default '',
  -- sama seperti starter kit, deadline disimpan sebagai waktu lokal tanpa zona waktu
  deadline timestamp not null,
  status task_status not null default 'belum',
  created_at timestamptz not null default now(),
  -- menjamin tugas hanya bisa menempel ke mata kuliah milik user yang sama
  foreign key (mata_kuliah_id, user_id) references courses (id, user_id) on delete cascade
);

create index tasks_user_id_idx on tasks (user_id);
