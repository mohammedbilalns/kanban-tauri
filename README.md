# Tauri + SQLite Example Project

> **This is an example project demonstrating how to set up a Tauri application with SQLite using the official `@tauri-apps/plugin-sql` plugin.**

A minimal Kanban-style task manager built with **Tauri 2**, **React 19**, **TypeScript**, and **SQLite** — showcasing best practices for local database integration in Tauri desktop apps.

---

## 🎯 Purpose

This repository serves as a **reference implementation** for developers who want to:

- ✅ Add SQLite to a Tauri 2 application using the official SQL plugin
- ✅ Understand the Rust-side and TypeScript-side setup
- ✅ See a working example of database initialization, migrations, and CRUD operations
- ✅ Learn proper database connection management (singleton pattern)
- ✅ Reference capability permissions for file system and SQL access

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Desktop Framework** | Tauri 2 |
| **Database** | SQLite (via `@tauri-apps/plugin-sql`) |
| **Rust Plugins** | `tauri-plugin-sql` (with `sqlite` feature), `tauri-plugin-fs` |

---

## 📁 Project Structure

```
├── src/
│   ├── db.ts              # Database connection & queries (singleton pattern)
│   ├── types.ts           # TypeScript types (Task, Status)
│   ├── hooks/useTask.ts   # React hook for task operations
│   ├── Components/        # UI components
│   └── App.tsx            # Main app component
├── src-tauri/
│   ├── Cargo.toml         # Rust dependencies (tauri-plugin-sql with sqlite feature)
│   ├── tauri.conf.json    # Tauri configuration
│   ├── capabilities/      # Capability permissions (default.json)
│   └── src/
│       ├── lib.rs         # Tauri plugin registration
│       └── main.rs        # Entry point
└── package.json           # npm dependencies (@tauri-apps/plugin-sql)
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.75+
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd todo

# Install frontend dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

### Build for Production

```bash
pnpm tauri build
```

---



