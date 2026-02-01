import { startScheduler, stopScheduler } from "../services/api";

export default function SchedulerControls() {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <button onClick={startScheduler}>▶ Start Scheduler</button>

      <button onClick={stopScheduler}>⏹ Stop Scheduler</button>
    </div>
  );
}
