import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/issues";

function OverdueBooks() {
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState("");
  const [refreshTime, setRefreshTime] = useState(Date.now());

  // ======================================
  // FETCH ISSUE RECORDS
  // ======================================

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      setIssues(response.data);
      setRefreshTime(Date.now());
    } catch (err) {
      console.error("Fetch Overdue Books Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch overdue books"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // ======================================
  // CALCULATE DAYS OVERDUE
  // ======================================

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;

    const due = new Date(dueDate);

    if (Number.isNaN(due.getTime())) return 0;

    const today = new Date(refreshTime);

    const dueDay = Date.UTC(
      due.getFullYear(),
      due.getMonth(),
      due.getDate()
    );

    const todayDay = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const difference = todayDay - dueDay;

    return Math.max(
      0,
      Math.floor(difference / (1000 * 60 * 60 * 24))
    );
  };

  // ======================================
  // FILTER OVERDUE BOOKS
  // ======================================

  const overdueIssues = issues.filter((issue) => {
    if (issue.status !== "Issued" || !issue.dueDate) {
      return false;
    }

    return getDaysOverdue(issue.dueDate) > 0;
  });

  const filteredIssues = overdueIssues.filter((issue) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      String(issue.student?.name || "")
        .toLowerCase()
        .includes(search) ||
      String(issue.student?.admissionNumber || "")
        .toLowerCase()
        .includes(search) ||
      String(issue.book?.title || "")
        .toLowerCase()
        .includes(search) ||
      String(issue.book?.isbn || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // ======================================
  // RETURN OVERDUE BOOK
  // ======================================

  const handleReturn = async (issueId) => {
    if (returningId !== null) return;

    const confirmed = window.confirm(
      "Are you sure you want to return this overdue book?"
    );

    if (!confirmed) return;

    setReturningId(issueId);

    try {
      await axios.put(`${API_URL}/${issueId}/return`);

      alert("Overdue Book Returned Successfully!");

      await fetchIssues();
    } catch (err) {
      console.error("Return Overdue Book Error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to return overdue book"
      );
    } finally {
      setReturningId(null);
    }
  };

  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString();
  };

  // ======================================
  // USER INTERFACE
  // ======================================

  return (
    <div>
      <h2>Overdue Books Management</h2>

      <p>
        View and manage books that have not been returned
        by their due dates.
      </p>

      {/* OVERDUE SUMMARY */}
      <div style={styles.summaryCard}>
        <h3>Total Overdue Books</h3>

        <p style={styles.summaryValue}>
          {loading ? "..." : error ? "—" : overdueIssues.length}
        </p>
      </div>

      {/* SEARCH AND REFRESH */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search by student, admission number, book or ISBN"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <button
          type="button"
          onClick={fetchIssues}
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {/* OVERDUE BOOKS TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table
          border="1"
          cellPadding="10"
          style={styles.table}
        >
          <thead>
            <tr>
              <th>Student</th>
              <th>Admission No.</th>
              <th>Class</th>
              <th>Division</th>
              <th>Book</th>
              <th>ISBN</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Days Overdue</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={styles.emptyCell}>
                  Loading overdue books...
                </td>
              </tr>
            ) : filteredIssues.length === 0 ? (
              <tr>
                <td colSpan="10" style={styles.emptyCell}>
                  {error
                    ? "Unable to load overdue records"
                    : "No overdue books found"}
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    {issue.student?.name || "Unavailable"}
                  </td>

                  <td>
                    {issue.student?.admissionNumber || "-"}
                  </td>

                  <td>
                    {issue.student?.className || "-"}
                  </td>

                  <td>
                    {issue.student?.division || "-"}
                  </td>

                  <td>
                    {issue.book?.title || "Unavailable"}
                  </td>

                  <td>
                    {issue.book?.isbn || "-"}
                  </td>

                  <td>
                    {formatDate(issue.issueDate)}
                  </td>

                  <td>
                    {formatDate(issue.dueDate)}
                  </td>

                  <td style={styles.overdueCell}>
                    {getDaysOverdue(issue.dueDate)} days
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleReturn(issue._id)}
                      disabled={returningId !== null}
                      style={styles.returnButton}
                    >
                      {returningId === issue._id
                        ? "Returning..."
                        : "Return Book"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======================================
// STYLES
// ======================================

const styles = {
  summaryCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    borderTop: "5px solid #dc2626",
    marginTop: "20px",
    marginBottom: "25px",
    maxWidth: "250px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  summaryValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#dc2626",
    margin: "10px 0",
  },

  toolbar: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  searchInput: {
    flex: 1,
    minWidth: "250px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },

  refreshButton: {
    padding: "12px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
  },

  emptyCell: {
    textAlign: "center",
    padding: "20px",
  },

  overdueCell: {
    color: "#dc2626",
    fontWeight: "bold",
  },

  returnButton: {
    backgroundColor: "#16a34a",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default OverdueBooks;