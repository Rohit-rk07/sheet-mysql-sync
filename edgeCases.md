# Nuances & Edge Cases Handled

This system is designed to reliably synchronize data between **Google Sheets** and **MySQL** while handling real-world inconsistencies, conflicts, and schema drift.

---

## 1. Schema Drift (Column Mismatch)

### Case

- Column added in Google Sheet
- Column added directly in MySQL

### Handling

- On every sync cycle:
  - Sheet header and DB schema are compared
  - Missing columns are automatically added on the other side

- Internal columns (`_sync_id`, `updated_at`) are excluded from comparison

✅ Prevents schema mismatch errors
✅ No manual migration needed

---

## 2. Stable Row Identity Across Systems

### Case

- Google Sheets does not have a native primary key
- Row positions may change

### Handling

- Each row is assigned a **UUID-based `_sync_id`**
- Mapping table stores:
  - `_sync_id`
  - `sheet_row_id`
  - `row_hash`
  - `last_updated_from`

✅ Row identity survives reordering
✅ Prevents duplicate inserts

---

## 3. Change Detection Using Hashing

### Case

- Unchanged rows should not be rewritten
- Avoid unnecessary DB and API calls

### Handling

- Row content is hashed (`generateRowHash`)
- Sync occurs **only if hash changes**

✅ Improves performance
✅ Prevents infinite update loops

---

## 4. Directional Conflict Prevention

### Case

- Same row edited in both Sheet and DB

### Handling

- `last_updated_from` flag determines update direction
- Prevents ping-pong overwrites between systems

```text
SHEET → DB or DB → SHEET (never both in same cycle)
```

✅ Deterministic conflict resolution
✅ Predictable behavior

---

## 5. Source-of-Truth Strategy (Explicit Design Choice)

### Case

- Conflicting edits during a full sync

### Handling

- **Google Sheet is treated as the source of truth during full sync**
- Database-only changes may be overwritten
- A dedicated **DB → Sheet endpoint** is provided for controlled updates

✅ Avoids accidental spreadsheet overwrites
✅ Behavior is clearly documented

---

## 6. Empty Cells & NULL Handling

### Case

- Cell cleared in Google Sheet
- DB column allows NULL

### Handling

- Empty sheet cells are mapped to `NULL` in DB
- DB NULL values are safely written back to Sheet as empty cells

✅ No crashes
✅ Consistent representation

---

## 7. Header Normalization

### Case

- Extra spaces or empty headers in Sheet

### Handling

- Header values are:
  - Trimmed
  - Empty strings filtered out

✅ Prevents accidental column creation
✅ Cleaner schema sync

---

## 8. Row Deletion Safety

### Case

- Row deleted in Sheet
- Mapping still exists

### Handling

- System does **not auto-delete DB rows**
- Prevents accidental data loss
- Deletion can be handled as a future enhancement

✅ Safer default behavior
✅ Data preservation-first approach

---

## 9. API Failure & Partial Sync Protection

### Case

- Google Sheets API error mid-sync

### Handling

- Each sync step is wrapped in `try/catch`
- Errors are logged without crashing the server
- Next scheduler cycle retries automatically

✅ Fault-tolerant
✅ No manual restart needed

---

## 10. Scheduler Re-entrancy Protection

### Case

- Scheduler triggered multiple times
- Manual and auto sync overlap

### Handling

- Single scheduler instance maintained
- Prevents duplicate cron jobs

✅ No double execution
✅ Stable background processing

---

## 11. Case-Sensitive Sheet Name Handling

### Case

- `Sheet1` vs `sheet1` mismatch

### Handling

- Exact sheet name used consistently
- Logged clearly for debugging

✅ Avoids silent failures
✅ Faster troubleshooting

---

## 12. Environment Validation

### Case

- Missing `.env` values

### Handling

- Explicit checks for:
  - `SHEET_ID`
  - `SHEET_NAME`

- Sync aborts with clear error message

✅ Early failure
✅ Clear diagnostics

---

## 13. Idempotent Sync Operations

### Case

- Same sync runs multiple times

### Handling

- Hash comparison + `_sync_id` ensure:
  - No duplicate inserts
  - No redundant updates

✅ Safe to rerun
✅ Production-grade behavior

---
