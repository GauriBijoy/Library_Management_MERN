import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/issues`;

function ReturnBooks() {
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ===================================
  // 1. FETCH ALL ISSUE RECORDS
  // ===================================

  const fetchIssues = async () => {
    try {
      setErrorMessage("");

      const response = await axios.get(API_URL);

      setIssues(response.data);
    } catch (error) {
      console.error("Fetch Issues Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch issue records"
      );
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // ===================================
  // 2. RETURN BOOK
  // ===================================

  const handleReturn = async (issueId) => {
    if (loadingId !== null) return;

    const confirmReturn = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmReturn) return;

    setLoadingId(issueId);

    try {
      await axios.put(`${API_URL}/${issueId}/return`);

      alert("Book Returned Successfully!");

      await fetchIssues();
    } catch (error) {
      console.error("Return Book Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to return book"
      );
    } finally {
      setLoadingId(null);
    }
  };

  // ===================================
  // 3. FILTER ACTIVE ISSUES
  // ===================================

  const activeIssues = issues.filter(
    (issue) => issue.status === "Issued"
  );

  const filteredIssues = activeIssues.filter((issue) => {
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
        .includes(search)
    );
  });

  // ===================================
  // 4. RETURN HISTORY
  // ===================================

  const returnedIssues = issues.filter(
    (issue) => issue.status === "Returned"
  );

  // ===================================
  // 5. FORMAT DATE
  // ===================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  // ===================================
  // 6. USER INTERFACE
  // ===================================

  return (
    <div className="page-content">
      <h2>Return Books</h2>

      <h3>Books Waiting for Return</h3>

      <p>Total Issued Books: {activeIssues.length}</p>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by Student, Admission Number, or Book"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      {errorMessage && (
        <p style={{ color: "red" }}>{errorMessage}</p>
      )}

      {/* ACTIVE ISSUES TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="10" style={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Admission No.</th>
              <th>Book</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyCell}>
                  {errorMessage
                    ? "Unable to load issued books"
                    : "No issued books found"}
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    {issue.student?.name ||
                      "Student unavailable"}
                  </td>

                  <td>
                    {issue.student?.admissionNumber || "-"}
                  </td>

                  <td>
                    {issue.book?.title || "Book unavailable"}
                  </td>

                  <td>{formatDate(issue.issueDate)}</td>

                  <td>{formatDate(issue.dueDate)}</td>

                  <td style={{ color: "#d97706" }}>
                    {issue.status}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleReturn(issue._id)}
                      disabled={loadingId !== null}
                      style={{
                        ...styles.returnButton,
                        cursor:
                          loadingId !== null
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {loadingId === issue._id
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

      {/* RETURN HISTORY */}
      <hr style={{ margin: "30px 0" }} />

      <h3>Return History</h3>

      <p>Total Returned Books: {returnedIssues.length}</p>

      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="10" style={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Book</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {returnedIssues.length === 0 ? (
              <tr>
                <td colSpan="5" style={styles.emptyCell}>
                  No returned books yet
                </td>
              </tr>
            ) : (
              returnedIssues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    {issue.student?.name ||
                      "Student unavailable"}
                  </td>

                  <td>
                    {issue.book?.title || "Book unavailable"}
                  </td>

                  <td>{formatDate(issue.issueDate)}</td>

                  <td>{formatDate(issue.returnDate)}</td>

                  <td
                    style={{
                      color: "#16a34a",
                      fontWeight: "bold",
                    }}
                  >
                    Returned
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

const styles = {
  searchInput: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    marginTop: "15px",
  },

  emptyCell: {
    textAlign: "center",
    padding: "20px",
  },

  returnButton: {
    backgroundColor: "#16a34a",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
  },
};

export default ReturnBooks;