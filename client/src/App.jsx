import { useState } from "react";

// ======================================
// IMPORT ALL PAGES
// ======================================

import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Students from "./pages/Students";
import IssueBooks from "./pages/IssueBooks";
import ReturnBooks from "./pages/ReturnBooks";
import OverdueBooks from "./pages/OverdueBooks";

function App() {
  // ======================================
  // ACTIVE PAGE
  // ======================================

  const [activePage, setActivePage] = useState("Dashboard");

  // ======================================
  // SIDEBAR MENU ITEMS
  // ======================================

  const menuItems = [
    "Dashboard",
    "Books",
    "Students",
    "Issue Books",
    "Return Books",
    "Overdue Books",
  ];

  // ======================================
  // DISPLAY SELECTED PAGE
  // ======================================

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard onNavigate={setActivePage} />;

      case "Books":
        return <Books />;

      case "Students":
        return <Students />;

      case "Issue Books":
        return <IssueBooks />;

      case "Return Books":
        return <ReturnBooks />;

      case "Overdue Books":
        return <OverdueBooks />;

      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  // ======================================
  // MAIN APPLICATION
  // ======================================

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>
          📚 Library LMS
        </h2>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActivePage(item)}
              style={{
                ...styles.menuButton,

                backgroundColor:
                  activePage === item
                    ? "#2563eb"
                    : "transparent",

                fontWeight:
                  activePage === item
                    ? "bold"
                    : "normal",
              }}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        {/* HEADER */}
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            Library Management System
          </h1>
        </header>

        {/* SELECTED PAGE */}
        <div style={styles.content}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

// ======================================
// APPLICATION STYLES
// ======================================

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f3f4f6",
  },

  sidebar: {
    width: "230px",
    minWidth: "230px",
    backgroundColor: "#111827",
    color: "white",
    padding: "25px 15px",
    boxSizing: "border-box",
  },

  logo: {
    fontSize: "22px",
    marginBottom: "35px",
    textAlign: "center",
  },

  menuButton: {
    display: "block",
    width: "100%",
    padding: "13px 15px",
    marginBottom: "10px",
    textAlign: "left",
    backgroundColor: "transparent",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },

  main: {
    flex: 1,
    minWidth: 0,
  },

  header: {
    backgroundColor: "white",
    padding: "20px 30px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
  },

  headerTitle: {
    margin: 0,
    fontSize: "25px",
    color: "#111827",
  },

  content: {
    padding: "30px",
  },
};

export default App;