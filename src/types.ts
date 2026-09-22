export type Status = "todo" | "doing" | "done";


export interface Task {
  id : number;
  title : string;
  status : Status;
  position : number;
}

export const COLUMNS : {status : Status, label : string}[] = [
  {status : "todo", label : "To Do"},
  {status : "doing", label : "In Progress"},
  {status : "done", label : "Done"}
]
