import { useEffect, useState } from "react";
import { getSchedulerStatus } from "../services/api";

export default function SyncStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await getSchedulerStatus();
      setStatus(res.data.running);
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <strong>Status:</strong> {status ? "🟢 Running" : "🔴 Stopped"}
    </div>
  );
}
