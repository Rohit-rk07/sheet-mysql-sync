import SchedulerControls from "./components/SchedulerControls";
import SyncStatus from "./components/SyncStatus";
import ManualSync from "./components/ManualSync";

export default function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>🔄 Sheet ↔ MySQL Sync</h1>

      <SyncStatus />
      <SchedulerControls />
      <ManualSync />
    </div>
  );
}
