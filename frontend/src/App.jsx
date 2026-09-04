import React, { useEffect, useState } from "react";
import {
  getHealth,
  getSchedulerStatus,
  startScheduler,
  stopScheduler,
  runManualSync,
  getSyncLogs,
  getSheetPreview
} from "./services/api";

export default function App() {
  const [health, setHealth] = useState({ status: "checking", db: "checking" });
  const [scheduler, setScheduler] = useState({ running: false, syncing: false });
  const [logs, setLogs] = useState([]);
  const [sheetPreview, setSheetPreview] = useState({ header: [], rows: [] });
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchStatus = async () => {
    try {
      const h = await getHealth();
      setHealth(h.data);
    } catch {
      setHealth({ status: "disconnected", db: "unreachable" });
    }

    try {
      const s = await getSchedulerStatus();
      setScheduler(s.data);
    } catch {
      // ignore
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await getSyncLogs(8);
      setLogs(res.data.logs || []);
    } catch {
      // ignore
    }
  };

  const fetchSheet = async () => {
    try {
      const res = await getSheetPreview();
      setSheetPreview({
        header: res.data.header || [],
        rows: res.data.processedSample || []
      });
    } catch {
      // ignore
    }
  };

  const refreshAll = () => {
    fetchStatus();
    fetchLogs();
    fetchSheet();
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await runManualSync();
      showToast(res.data?.status || "Synchronization completed successfully!", "success");
      refreshAll();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || "Sync failed", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleScheduler = async () => {
    try {
      if (scheduler.running) {
        await stopScheduler();
        showToast("Background scheduler stopped", "success");
      } else {
        await startScheduler();
        showToast("Background scheduler started (ticking every 5s)", "success");
      }
      fetchStatus();
    } catch (err) {
      showToast(err.response?.data?.error || "Scheduler toggle failed", "error");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <h1>🔄 Sheet ↔ MySQL Sync</h1>
          <p>Bi-directional sync engine with change detection and schema evolution</p>
        </div>

        <div className="header-badges">
          <div className={`status-badge ${health.db === "connected" ? "connected" : "disconnected"}`}>
            <span className="status-dot"></span>
            MySQL: {health.db === "connected" ? "Online" : "Offline"}
          </div>

          <div className={`status-badge ${scheduler.running ? "running" : ""}`}>
            <span className="status-dot"></span>
            Scheduler: {scheduler.running ? "Active (5s)" : "Idle"}
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", color: "inherit", padding: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="action-card">
        <div className="action-info">
          <h3>Sync Controls</h3>
          <p>Trigger an on-demand bi-directional sync or toggle continuous background replication.</p>
        </div>

        <div className="button-group">
          <button
            className="btn-primary"
            onClick={handleManualSync}
            disabled={isSyncing}
          >
            {isSyncing ? <span className="spinner"></span> : "⚡"}
            {isSyncing ? "Syncing..." : "Run Sync Now"}
          </button>

          <button
            className={scheduler.running ? "btn-danger" : "btn-secondary"}
            onClick={handleToggleScheduler}
          >
            {scheduler.running ? "⏹ Stop Scheduler" : "▶ Start Scheduler"}
          </button>

          <button className="btn-secondary" onClick={refreshAll}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Live Sheet Data Preview */}
        <div className="card">
          <div className="card-header">
            <h2>📄 Live Sheet Data</h2>
            <span className="card-badge">Tab: Sheet1</span>
          </div>
          <div className="card-body">
            {sheetPreview.header.length === 0 ? (
              <div className="empty-state">No sheet data loaded. Check backend connection.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {sheetPreview.header.map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheetPreview.rows.map((row, idx) => (
                      <tr key={idx}>
                        {sheetPreview.header.map((col, cIdx) => (
                          <td key={cIdx}>
                            {row.data[col] !== null && row.data[col] !== undefined
                              ? String(row.data[col])
                              : <span style={{ color: "var(--text-muted)" }}>—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sync Audit History */}
        <div className="card">
          <div className="card-header">
            <h2>📜 Sync Audit History</h2>
            <span className="card-badge">Recent Runs</span>
          </div>
          <div className="card-body">
            {logs.length === 0 ? (
              <div className="empty-state">No sync logs recorded yet. Trigger a sync to view history.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Direction</th>
                      <th>Rows</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="table-code">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                        <td>{log.direction}</td>
                        <td>{log.rows_processed}</td>
                        <td>
                          <span className={log.status === "SUCCESS" ? "tag-success" : "tag-failed"}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
