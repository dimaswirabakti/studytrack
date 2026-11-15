import type { StudyPlan } from "../ai/study-plan.js";
import { pool } from "../db/pool.js";

export interface SavedPlan {
  plan: StudyPlan;
  model: string;
  created_at: string;
}

// rencana hanya bisa dibaca pemilik tugasnya
export async function findPlan(userId: number, taskId: number): Promise<SavedPlan | undefined> {
  const { rows } = await pool.query<SavedPlan>(
    `select p.plan, p.model, p.created_at
     from task_plans p
     join tasks t on t.id = p.task_id
     where p.task_id = $1 and t.user_id = $2`,
    [taskId, userId],
  );
  return rows[0];
}

// satu tugas hanya menyimpan rencana terakhir, rencana lama ditimpa
export async function savePlan(taskId: number, plan: StudyPlan, model: string): Promise<SavedPlan> {
  const { rows } = await pool.query<SavedPlan>(
    `insert into task_plans (task_id, plan, model) values ($1, $2, $3)
     on conflict (task_id) do update
       set plan = excluded.plan, model = excluded.model, created_at = now()
     returning plan, model, created_at`,
    [taskId, JSON.stringify(plan), model],
  );
  return rows[0]!;
}
