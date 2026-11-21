import { useState, useEffect } from "react";
import "./App.css";

const API = "/api";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const menuItems = ["Dashboard", "Server Monitoring", "Incidents", "Cost Monitoring", "Settings"];
  const openIncidentCount = incidents.filter((incident) => incident.status === "Open").length;

  async function loadIncidents() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/incidents`);
      if (!response.ok) throw new Error("Unable to load incidents");
      setIncidents(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMonitoring() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/monitoring`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Unable to load CloudWatch metrics");
      }
      setMetrics(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activePage === "Dashboard" || activePage === "Incidents") loadIncidents();
    if (activePage === "Dashboard" || activePage === "Server Monitoring") loadMonitoring();
  }, [activePage]);

  async function createIncident(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${API}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!response.ok) throw new Error("Unable to create incident");
      setTitle("");
      setDescription("");
      setMessage("Incident created successfully!");
      await loadIncidents();
    } catch (err) {
      setError(err.message);
    }
  }

  function metricValue(metric) {
    return metric?.value == null ? "No data" : `${metric.value}%`;
  }

  function renderPage() {
    switch (activePage) {
      case "Dashboard":
        return (
          <>
            <section className="welcome">
              <h2>Welcome to CloudOps Nexus</h2>
              <p>Monitor infrastructure and manage cloud incidents.</p>
            </section>
            <section className="cards">
              {[
                ["CPU Usage", metricValue(metrics?.cpu)],
                ["Memory Usage", metricValue(metrics?.memory)],
                ["Disk Usage", metricValue(metrics?.disk)],
                ["Open Incidents", openIncidentCount],
              ].map(([label, value]) => (
                <div className="card" key={label}>
                  <p>{label}</p>
                  <h2>{value}</h2>
                  <span>{label === "Open Incidents" ? "Currently open incidents" : "CloudWatch metric"}</span>
                </div>
              ))}
            </section>
            {loading && <p>Refreshing dashboard...</p>}
            {error && <p>Error: {error}</p>}
          </>
        );

      case "Server Monitoring":
        return (
          <section className="panel">
            <h2>Server Monitoring</h2>
            <p>EC2 instance: {metrics?.instance_id || "Not available"}</p>
            <p>Region: {metrics?.region || "Not available"}</p>
            <div className="cards">
              {[
                ["CPU Usage", metrics?.cpu],
                ["Memory Usage", metrics?.memory],
                ["Disk Usage", metrics?.disk],
              ].map(([label, metric]) => (
                <div className="card" key={label}>
                  <p>{label}</p>
                  <h2>{metricValue(metric)}</h2>
                  <span>{metric?.timestamp ? new Date(metric.timestamp).toLocaleString() : "No recent datapoint"}</span>
                </div>
              ))}
            </div>
            <button onClick={loadMonitoring}>Refresh metrics</button>
            {loading && <p>Loading metrics...</p>}
            {error && <p>Error: {error}</p>}
          </section>
        );

      case "Incidents":
        return (
          <section className="panel">
            <h2>Incident Management</h2>
            <form onSubmit={createIncident}>
              <h3>Create New Incident</h3>
              <input
                type="text"
                placeholder="Enter incident title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                style={{ display: "block", width: "100%", padding: "12px", marginBottom: "12px", boxSizing: "border-box" }}
              />
              <textarea
                placeholder="Enter incident description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows="4"
                required
                style={{ display: "block", width: "100%", padding: "12px", marginBottom: "12px", boxSizing: "border-box" }}
              />
              <button type="submit">Create Incident</button>
            </form>
            {message && <p>{message}</p>}
            {error && <p>Error: {error}</p>}
            {loading && <p>Loading incidents...</p>}
            <h3>Existing Incidents</h3>
            {!loading && !error && incidents.length === 0 && <p>No incidents found.</p>}
            {incidents.map((incident) => (
              <div className="card" key={incident.id}>
                <h3>{incident.title}</h3>
                <p>{incident.description}</p>
                <p>Status: {incident.status}</p>
                <p>Created: {new Date(incident.created_at).toLocaleString()}</p>
              </div>
            ))}
          </section>
        );

      case "Cost Monitoring":
        return <section className="panel"><h2>AWS Cost Monitoring</h2><p>Cost reporting is not connected in this version.</p></section>;
      case "Settings":
        return <section className="panel"><h2>Settings</h2><p>Platform settings.</p></section>;
      default:
        return null;
    }
  }

  return (
    <div className={`dashboard ${darkMode ? "dark-theme" : ""}`}>
      <aside className="sidebar">
        <h2>CloudOps</h2>
        <p className="subtitle">NEXUS</p>
        <nav>
          {menuItems.map((item) => (
            <div key={item} className={`nav-item ${activePage === item ? "active" : ""}`} onClick={() => setActivePage(item)}>
              {item}
            </div>
          ))}
        </nav>
        <p className="sidebar-footer">AWS Cloud Operations</p>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>CloudOps Nexus</p>
          </div>
          <div className="topbar-actions">
            <button className="theme-button" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <span className="status">Application running</span>
          </div>
        </header>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
