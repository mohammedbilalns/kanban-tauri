import { useCallback, useEffect, useState } from "react";
import { Status, Task } from "../types";
import { addTask, deleteTasks, getTasks, initDb, saveColumn } from "../db";


export function useTasks(){
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let cancelled = false;

    async function loadTasks(){
      try{
        await initDb()
        const rows = await getTasks()

        if(!cancelled){
          setTasks(rows)
          setLoading(false)
        }

      }catch(error){
        console.error(error)
      }
    }

    loadTasks()

    return () => {
      cancelled = true 
    }

  }, [])

  const byStatus = useCallback(
    (status: Status) => tasks
      .filter((t) => t.status === status)
      .sort((a,b) => a.position - b.position),[tasks]
  )


  const add = useCallback(async (title: string,status : Status) => {
    await addTask(title, status)
    setTasks(await getTasks())

  }, [])

  const remove = useCallback(async (id : number) => {
    await deleteTasks(id)
    setTasks(await getTasks())
  }, [] )


  const move = useCallback(
    async (id : number, status: Status, index: number) => {
      const task = tasks.find(t => t.id == id)
      if(!task) return 


      const dest = tasks
      .filter((t) => t.status == status && t.id !== id )
      .sort((a,b) => a.position - b.position)

      dest.splice(index, 0 , task);


      const positions = new Map(dest.map((t, i) => [t.id, i ]))

    setTasks((prev) => prev.map((t) => {
        const position = positions.get(t.id)
        return position === undefined ? t : {...t , status, position}
      })
      )

      await saveColumn(status, dest.map((t) => t.id))
    }, [tasks]
  )

  return {loading, byStatus, add, remove, move}


}
