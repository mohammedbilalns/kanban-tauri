import { Column } from './Components/Column';
import { useTasks } from './hooks/useTask';
import { COLUMNS } from './types';
import './App.css';

export default function App() {
  const { loading, byStatus, add, remove, move } = useTasks();

  if (loading) return <main id="board">Loading…</main>;

  return (
    <main id="board">
      {COLUMNS.map(({ status, label }) => (
        <Column
          key={status}
          status={status}
          label={label}
          tasks={byStatus(status)}
          onAdd={add}
          onDelete={remove}
          onMove={move}
        />
      ))}
    </main>
  );
}
