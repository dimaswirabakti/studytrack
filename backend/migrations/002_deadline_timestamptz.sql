-- deadline diubah menjadi waktu absolut supaya sisa waktu dihitung benar di server mana pun
-- data lama tidak punya zona waktu sehingga diasumsikan wib, zona waktu pengguna starter kit
alter table tasks
  alter column deadline type timestamptz using deadline at time zone 'Asia/Jakarta';

-- daftar tugas selalu difilter per user lalu diurutkan berdasarkan deadline
create index tasks_user_id_deadline_idx on tasks (user_id, deadline);

-- index lama tercakup oleh kolom pertama index komposit di atas
drop index tasks_user_id_idx;
