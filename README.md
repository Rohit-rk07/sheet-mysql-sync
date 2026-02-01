# 📄 README.md — Sheet ↔ MySQL Sync Engine

## 🔁 Overview

This project is a **bi-directional synchronization engine** that keeps a **Google Sheet** and a **MySQL database** in sync.

It supports:

- Sheet → DB sync
- DB → Sheet sync
- Automatic schema evolution
- Infinite loop prevention
- Conflict handling
- Near real-time updates via scheduler

The backend acts as the **single source of orchestration**, ensuring consistency and safety.

---

## 🎯 Core Goals

- Sync rows and schema between Google Sheets and MySQL
- Prevent infinite update loops
- Handle schema drift safely

---

## 🧠 High-Level Architecture

```
Google Sheet
    ↕ (Google Sheets API)
Backend Sync Engine (Node.js)
    ↕
MySQL Database
```

The backend:

- Detects changes
- Decides direction
- Applies updates
- Maintains metadata for safety

---

## 🛠 Tech Stack

### Backend

- Node.js
- Express
- Google Sheets API v4
- MySQL (mysql2)
- node-cron
- UUID
- dotenv

### Database

- MySQL
- Metadata-driven design

---

## 📁 Project Structure

```
backend/
  src/
    config/
    db/
    jobs/
    routes/
    services/
    utils/
    app.js
```

---

## 🧩 Core Concepts

### 1️⃣ Sync Direction

The system supports **bi-directional sync**:

- **Sheet → DB**
- **DB → Sheet**

Only the **changed side** propagates updates.

---

### 2️⃣ Metadata Tables (Critical)

#### `row_mapping`

Tracks row identity and prevents loops.

| Column            | Purpose             |
| ----------------- | ------------------- |
| sync_table_id     | Table mapping       |
| sheet_row_id      | Row number in Sheet |
| mysql_pk          | `_sync_id` in DB    |
| row_hash          | Change detection    |
| last_updated_from | `SHEET` or `DB`     |
| updated_at        | Timestamp           |

This table is the **heart of loop prevention**.

---

### 3️⃣ Row Identity

- Each row has a stable `_sync_id`
- `_sync_id` is the **primary key**
- Row position changes in Sheet do NOT break sync

---

### 4️⃣ Change Detection

- Every row is hashed using SHA-256
- Hash comparison avoids unnecessary writes
- Only real changes are synced

---

## 🧱 Schema Evolution Rules (IMPORTANT)

### ✅ What IS supported

| Action                 | Result                |
| ---------------------- | --------------------- |
| Add column in Sheet    | Column added to DB    |
| Add column in DB       | Column added to Sheet |
| Rename column          | Treated as new column |
| Extra spaces / symbols | Normalized            |

---

### ❌ What is NOT supported (by design)

| Action                 | Behavior                 |
| ---------------------- | ------------------------ |
| Delete column in Sheet | DB column NOT dropped    |
| Delete column in DB    | Sheet column NOT removed |
| Auto-drop columns      | ❌ Disabled              |

📌 **Reason**: Auto-dropping columns is dangerous and can cause irreversible data loss.

---

### 🔐 Column Normalization

To prevent schema pollution, all column names are normalized:

```
"User Name" → user_name
" user-name " → user_name
"User@Name!" → user_name
```

This prevents:

- Duplicate columns
- Schema explosion
- Accidental drift

---

## 🔄 Scheduler

- Runs every N seconds (default: 5s)
- Executes full sync cycle:
  1. Read Sheet header
  2. Sync schema
  3. Sync Sheet → DB
  4. Sync DB → Sheet

Scheduler is **idempotent** and safe to rerun.

---

## 🔁 Infinite Loop Prevention

Each row tracks:

- `row_hash`
- `last_updated_from`

Rules:

- If last update came from DB → skip DB re-sync
- If hash unchanged → skip
- Ensures no ping-pong updates

---

## ⚔️ Conflict Resolution

**Strategy: Last Write Wins**

- Latest update (timestamp-based) is applied
- Conflicts are resolved deterministically
- Can be extended to versioning in future

---

## 🚨 Edge Cases Handled

### Data & Sync

- Duplicate rows
- Empty cells
- Partial rows
- Row reorder in Sheet
- Concurrent edits
- API rate limits
- Network failures
- Restart recovery
- Idempotent scheduler runs

### Schema

- Column name variations
- Case sensitivity
- Extra spaces
- Symbol differences
- Schema drift
- Append-only safety

---

## 🔒 Safety Guarantees

- No automatic destructive DB operations
- No silent data loss
- Explicit schema evolution
- Deterministic sync behavior
- Full logging for traceability

---

## 🧪 How to Run

```bash
npm install
npm run dev
```

Environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=****
DB_NAME=sheet_mysql_sync
GOOGLE_SERVICE_ACCOUNT_KEY=service-account.json
SHEET_ID=xxxxxxxx
SHEET_NAME=Sheet1
```

---

🖥️ Simple Testing UI

To validate and operate the sync engine, the project includes a minimal React-based dashboard.

The UI is intentionally kept simple and functional, focusing on control and observability rather than complex visuals.

React UI (Vite)
↓ (REST API)
Backend Sync Engine (Express)
↓
Google Sheets / MySQL

The UI communicates with the backend exclusively via REST endpoints:

POST /scheduler/start
POST /scheduler/stop
GET /scheduler/status
POST /sync/run

## 🏁 Final Notes

This system is designed with a **production mindset**:

- Safe by default
- Extensible
- Observable
- Deterministic

It demonstrates:

- Backend system design
- Data synchronization principles
- Schema evolution handling
- Real-world SaaS architecture patterns

---

## 👤 Author

**Rohit**

---
