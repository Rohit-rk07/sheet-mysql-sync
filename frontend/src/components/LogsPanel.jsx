export default function LogsPanel({ logs }) {
  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Logs</h3>
      <pre>{logs.join("\n")}</pre>
    </div>
  );
}
