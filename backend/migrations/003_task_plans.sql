-- rencana kerja hasil ai disimpan supaya tidak perlu memanggil model setiap kali halaman dibuka
create table task_plans (
  task_id integer primary key references tasks (id) on delete cascade,
  plan jsonb not null,
  model text not null,
  created_at timestamptz not null default now()
);
