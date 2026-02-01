import { runManualSync } from "../services/api";

export default function ManualSync() {
  return <button onClick={runManualSync}>🔁 Run Sync Now</button>;
}
