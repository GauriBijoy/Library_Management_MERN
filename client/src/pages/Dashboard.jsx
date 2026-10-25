import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/dashboard";

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableCopies: 0,
    totalStudents: 0,
    currentlyIssued: 0,
    returnedBooks: 0,
    overdueBooks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // FETCH DASHBOARD STATISTICS
  // ======================================

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      setStats(response.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ======================================
  // STATISTICS CARDS
  // ======================================

  const cards = [
    {
      title: "Total Book Titles",
      value: stats.totalBooks,
      icon: "📚",
      color: "#2563eb",
    },
    {
      title: "Available Copies",
      value: stats.availableCopies,
      icon: "📗",
      color: "#16a34a",
    },
    {
      title: "Registered Students",
      value: stats.totalStudents,
      icon: "🎓",
      color: "#7c3aed",
    },
    {
      title: "Currently Issued",
      value: stats.currentlyIssued,
      icon: "📖",
      color: "#ea580c",
    },
    {
      title: "Returned Books",
      value: stats.returnedBooks,
      icon: "↩️",
      color: "#0891b2",
    },
    {
      title: "Overdue Books",
      value: stats.overdueBooks,
      icon: "⏰",
      color: "#dc2626",
    },
  ];

  // ======================================
  // USER INTERFACE
  // ======================================

  return (
    <div>
      <div style={styles.titleRow}>
        <div>
          <h2>Dashboard</h2>

          <p>Library statistics and management overview</p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? "Loading..." : "Refresh Statistics"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* STATISTICS CARDS */}
      <div style={styles.cardContainer}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              ...styles.card,
              borderTop: `5px solid ${card.color}`,
            }}
          >
            <div style={styles.cardIcon}>
              {card.icon}
            </div>

            <h3 style={styles.cardTitle}>
              {card.title}
            </h3>

            <p style={styles.cardValue}>
              {loading ? "..." : error ? "—" : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <h3 style={{ marginTop: "35px" }}>
        Quick Actions
      </h3>

      <div style={styles.actionContainer}>
        <button
          type="button"
          style={styles.actionButton}
          onClick={() => onNavigate("Books")}
        >
          📚 Manage Books
        </button>

        <button
          type="button"
          style={styles.actionButton}
          onClick={() => onNavigate("Students")}
        >
          🎓 Manage Students
        </button>

        <button
          type="button"
          style={styles.actionButton}
          onClick={() => onNavigate("Issue Books")}
        >
          📖 Issue Book
        </button>

        <button
          type="button"
          style={styles.actionButton}
          onClick={() => onNavigate("Return Books")}
        >
          ↩️ Return Book
        </button>
      </div>
    </div>
  );
}

const styles = {
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  refreshButton: {
    padding: "11px 18px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "25px",
  },

  card: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  cardIcon: {
    fontSize: "32px",
  },

  cardTitle: {
    color: "#4b5563",
    fontSize: "16px",
    marginTop: "15px",
  },

  cardValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "5px",
  },

  actionContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "20px",
  },

  actionButton: {
    padding: "12px 18px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Dashboard;