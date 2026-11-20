

import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const menuItems = [
    "Dashboard",
    "Server Monitoring",
    "Incidents",
    "Cost Monitoring",
    "Settings",
  ];

  const openIncidentCount = incidents.filter(
    (incident) => incident.status === "Open"
  ).length;

  async function loadIncidents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/incidents");

      if (!response.ok) {
        throw new Error("Unable to load incidents");
      }

      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activePage === "Dashboard" || activePage === "Incidents") {
      loadIncidents();
    }
  }, [activePage]);

  async function createIncident(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Unable to create incident");
      }

      setTitle("");
      setDescription("");
      setMessage("Incident created successfully!");

      await loadIncidents();
    } catch (err) {
      setError(err.message);
    }
  }

  function renderPage() {
    switch (activePage) {
      case "Dashboard":
        return (
          <>
            <section className="welcome">
              <h2>Welcome to CloudOps Intelligence Platform</h2>
              <p>
                Monitor infrastructure, track incidents, and manage cloud costs.
              </p>
            </section>

            <section className="cards">
              {["CPU Usage", "Memory Usage", "Disk Usage", "Open Incidents"].map(
                (item) => (
                  <div className="card" key={item}>
                    <p>{item}</p>

                    <h2>
                      {item === "Open Incidents"
                        ? openIncidentCount
                        : "--"}
                    </h2>

                    <span>
                      {item === "Open Incidents"
                        ? "Currently open incidents"
                        : "Waiting for AWS integration"}
                    </span>
                  </div>
                )
              )}
            </section>

            {loading && <p>Updating dashboard...</p>}
            {error && <p>Error: {error}</p>}
          </>
        );

      case "Server Monitoring":
        return (
          <section className="panel">
            <h2>Server Monitoring</h2>
            <p>Monitoring will be connected to AWS CloudWatch.</p>
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
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                }}
              />

              <textarea
                placeholder="Enter incident description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                required
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                }}
              />

              <button type="submit">Create Incident</button>
            </form>

            {message && <p>{message}</p>}
            {error && <p>Error: {error}</p>}
            {loading && <p>Loading incidents...</p>}

            <h3>Existing Incidents</h3>

            {!loading && !error && incidents.length === 0 && (
              <p>No incidents found.</p>
            )}

            {incidents.map((incident) => (
              <div className="card" key={incident.id}>
                <h3>{incident.title}</h3>
                <p>{incident.description}</p>
                <p>Status: {incident.status}</p>
                <p>
                  Created: {new Date(incident.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </section>
        );

      case "Cost Monitoring":
        return (
          <section className="panel">
            <h2>AWS Cost Monitoring</h2>
            <p>Cost information will appear after AWS integration.</p>
          </section>
        );

      case "Settings":
        return (
          <section className="panel">
            <h2>Settings</h2>
            <p>Platform settings will be available here.</p>
          </section>
        );

      default:
        return null;
    }
  }

  return (
    <div className={`dashboard ${darkMode ? "dark-theme" : ""}`}>
      <aside className="sidebar">
        <h2>CloudOps</h2>
        <p className="subtitle">INTELLIGENCE PLATFORM</p>

        <nav>
          {menuItems.map((item) => (
            <div
              key={item}
              className={`nav-item ${activePage === item ? "active" : ""}`}
              onClick={() => setActivePage(item)}
            >
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
            <p>CloudOps Intelligence Platform</p>
          </div>

          <div className="topbar-actions">
            <button
              className="theme-button"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <span className="status">Platform UI running</span>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}

export default App;
