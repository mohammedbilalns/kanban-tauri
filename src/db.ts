import Database from "@tauri-apps/plugin-sql";
import { Status, Task } from "./types";


let db : Database | null = null; 

async function getDb(): Promise<Database> {
  if(!db){
    db = await Database.load("sqlite:todo.db")
  }
  return db 
}

export async function initDb(): Promise<void>{
  const db = await getDb()
  await db.execute(
    `CREATE TABLE IF NOT EXISTS  tasks (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
status TEXT NOT NULL DEFAULT 'todo'
CHECK (status IN ('todo', 'doing', 'done')),
position INTEGER NOT NULL DEFAULT 0,
created_at TEXT NOT NULL DEFAULT (datetime('now'))
)

`
  );
}

// type of task row returned from sqlite 
interface TaskRow {
  id : number;
  title : string;
  status : string; 
  position: number; 
}

export async function getTasks(): Promise<Task[]>{
  const db = await getDb()
  const rows = await db.select<TaskRow[]>(
    `SELECT id, title, status, position FROM tasks ORDER BY position, id`
  )
  // Convert the db status string to the application's Status type
  return rows.map(({status, ...rest}) => ({...rest, status : status as Status}))
}


export async function addTask(title : string, status : Status): Promise<void>{
  const db = await getDb()
  // find the next position on the column
  const [{next}] = await db.select<{next: number}[]>(
    `SELECT COALESCE(MAX(position) + 1 , 0) AS next FROM tasks WHERE status = $1`,
    [status]
  )

  await db.execute(
    `INSERT INTO tasks (title, status,position) VALUES ($1, $2, $3)`,
    [title, status, next]
  )
}

export async function deleteTasks(id : number): Promise<void>{
  const db = await getDb()
  await db.execute(`DELETE FROM tasks WHERE id = $1 `, [id])
}

export async function saveColumn(status: Status , orderIds: number[]): Promise<void>{
  const db = await getDb()
  for (let i=0 ; i< orderIds.length; i++){
    await db.execute(
      `UPDATE tasks SET status = $1, position = $2 WHERE  id= $3`,
      [status, i , orderIds[i]]
    )
  }
}
