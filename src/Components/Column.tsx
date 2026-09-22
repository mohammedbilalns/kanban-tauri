import { Fragment, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
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
  const [composerOpen, setComposerOpen] = useState(false);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);

  // A drag cancelled with Esc (or dropped outside any column) still fires
  // dragend on the source card, which bubbles to window — clear the indicator.
  useEffect(() => {
    const clear = () => setDropIdx(null);
    window.addEventListener('dragend', clear);
    return () => window.removeEventListener('dragend', clear);
  }, []);

  function submit() {
    const trimmed = title.trim();
    if (trimmed) {
      onAdd(trimmed, status);
      setTitle('');
    }
    inputRef.current?.focus(); // keep composer open for quick multi-entry
  }

  function closeComposer() {
    setComposerOpen(false);
    setTitle('');
  }

  // Which slot is the cursor over? (before the card whose midpoint is below
  // the cursor, else at the end.)
  function targetIndex(y: number): number {
    const cards = Array.from(
      cardsRef.current?.querySelectorAll<HTMLElement>('.card:not(.dragging)') ?? []
    );
    for (let i = 0; i < cards.length; i++) {
      const { top, height } = cards[i].getBoundingClientRect();
      if (y < top + height / 2) return i;
    }
    return cards.length;
  }

  function handleDragEnter(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    dragDepth.current += 1;
  }

  function handleDragOver(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const idx = targetIndex(e.clientY);
    setDropIdx((prev) => (prev === idx ? prev : idx)); // skip redundant renders
  }

  function handleDragLeave() {
    // dragenter/leave fire for every child element too, so we count depth
    // and only clear when the pointer actually left the column
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDropIdx(null);
    }
  }

  function handleDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    dragDepth.current = 0;
    const id = Number(e.dataTransfer.getData('text/plain'));
    const idx = dropIdx ?? targetIndex(e.clientY);
    setDropIdx(null);
    if (id) onMove(id, status, idx);
  }

  return (
    <section
      className={`column${dropIdx !== null ? ' drag-over' : ''}`}
      data-status={status}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="column-header">
        <span className="dot" aria-hidden />
        <h2>{label}</h2>
        <span className="count">{tasks.length}</span>
      </header>

      <div className="cards" ref={cardsRef}>
        {tasks.length === 0 && dropIdx === null && <p className="empty">Nothing here yet</p>}

        {tasks.map((task, i) => (
          <Fragment key={task.id}>
            {dropIdx === i && <div className="drop-indicator" aria-hidden />}
            <article
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
              <button
                className="delete"
                aria-label={`Delete ${task.title}`}
                onClick={() => onDelete(task.id)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </article>
          </Fragment>
        ))}

        {dropIdx === tasks.length && <div className="drop-indicator" aria-hidden />}
      </div>

      <footer className="composer">
        {composerOpen ? (
          <div className="composer-form">
            <input
              ref={inputRef}
              autoFocus
              value={title}
              spellCheck={false}
              placeholder="Task title, then hit Enter…"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') closeComposer();
              }}
            />
            <div className="composer-actions">
              <button className="add-btn" onMouseDown={(e) => e.preventDefault()} onClick={submit}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add
              </button>
              <button className="close-btn" aria-label="Close" onClick={closeComposer}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button className="add-card-btn" onClick={() => setComposerOpen(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add a card
          </button>
        )}
      </footer>
    </section>
  );
}
