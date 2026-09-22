import { useRef, useState } from 'react';
import type { Status, Task } from '../types';

interface ColumnProps {
  status: Status;
  label: string;
  tasks: Task[];
  onAdd: (title: string, status: Status) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, status: Status, index: number) => void;
}

export function Column({ status, label, tasks, onAdd, onDelete, onMove }: ColumnProps) {
  const [title, setTitle] = useState('');
  const cardsRef = useRef<HTMLDivElement>(null);

  function submit() {
    const trimmed = title.trim();
    if (trimmed) {
      onAdd(trimmed, status);
      setTitle('');
    }
  }

  
  function dropIndex(y: number): number {
    const cards = Array.from(
      cardsRef.current?.querySelectorAll<HTMLElement>('.card:not(.dragging)') ?? []
    );
    for (let i = 0; i < cards.length; i++) {
      const { top, height } = cards[i].getBoundingClientRect();
      if (y < top + height / 2) return i;
    }
    return cards.length;
  }

  return (
    <section
      className="column"
      data-status={status}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData('text/plain'));
        if (id) onMove(id, status, dropIndex(e.clientY));
      }}
    >
      <header>
        <h2>{label}</h2>
        <span className="count">{tasks.length}</span>
      </header>

      <div className="cards" ref={cardsRef}>
        {tasks.map((task) => (
          <article
            key={task.id}
            className="card"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(task.id));
              e.dataTransfer.effectAllowed = 'move';
              e.currentTarget.classList.add('dragging');
            }}
            onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
          >
            <span className="title">{task.title}</span>
            <button className="delete" title="Delete" onClick={() => onDelete(task.id)}>
              ✕
            </button>
          </article>
        ))}
      </div>

      <footer className="composer">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="New task…"
        />
        <button className="add-btn" onClick={submit}>+</button>
      </footer>
    </section>
  );
}
