import { useEffect, useRef, useState } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import type { Task } from '../types';

interface CardProps {
  task: Task;
  onDelete: (id: number) => void;
  onRename: (id: number, title: string) => void;
}

// 1×1 transparent GIF — used as a zero-size drag image to hide the
// native ghost 
const hiddenGhost = new Image();
hiddenGhost.src =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export function Card({ task, onDelete, onRename }: CardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);       
  const copyTimer = useRef<number>();  

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // --- inline editing ---
  function startEdit() {
    doneRef.current = false;
    setDraft(task.title);
    setEditing(true);
  }

  function commit() {
    if (doneRef.current) return;
    doneRef.current = true;
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.title) onRename(task.id, trimmed);
  }

  function cancel() {
    doneRef.current = true;
    setEditing(false);
  }

  // --- clipboard ---
  async function copy() {
    try {
      await writeText(task.title);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  return (
    <article
      className={`card${editing ? ' editing' : ''}`}
      draggable={!editing} // text selection inside a draggable element misbehaves
      onDragStart={(e) => {
        e.dataTransfer.setDragImage(hiddenGhost, 0, 0);  
        e.dataTransfer.setData('text/plain', String(task.id));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="title-input"
          value={draft}
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
        />
      ) : (
        <span className="title" title="Click to edit" onClick={startEdit}>
          {task.title}
        </span>
      )}

      {!editing && (
        <div className="card-actions">
          <button
            className={`icon-btn copy${copied ? ' copied' : ''}`}
            aria-label={copied ? 'Copied' : `Copy ${task.title}`}
            onClick={copy}
          >
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
          <button className="icon-btn delete" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task.id)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </article>
  );
}
