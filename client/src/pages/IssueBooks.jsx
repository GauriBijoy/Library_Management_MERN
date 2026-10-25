import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

function getLocalDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function IssueBooks() {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);

  const [form, setForm] = useState({
    studentId: "",
    bookId: "",
    issueDate: getLocalDate(),
    dueDate: getLocalDate(14),
  });

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // ===================================
  // FETCH STUDENTS, BOOKS AND ISSUES
  // ===================================

  const fetchData = async () => {
    try {
      setFetchError("");

      const [studentsResponse, booksResponse, issuesResponse] =
        await Promise.all([
          axios.get(`${API_BASE}/students`),
          axios.get(`${API_BASE}/books`),
          axios.get(`${API_BASE}/issues`),
        ]);

      setStudents(studentsResponse.data);
      setBooks(booksResponse.data);
      setIssues(issuesResponse.data);
    } catch (error) {
      console.error("Fetch Issue Data Error:", error);

      setFetchError(
        error.response?.data?.message ||
          "Failed to load issue book data"
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===================================
  // HANDLE INPUT CHANGE
  // ===================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ===================================
  // ISSUE BOOK
  // ===================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!form.studentId || !form.bookId) {
      alert("Please select a student and a book");
      return;
    }

    if (form.dueDate < form.issueDate) {
      alert("Due date cannot be before issue date");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE}/issues`, form);

      alert("Book Issued Successfully!");

      setForm({
        studentId: "",
        bookId: "",
        issueDate: getLocalDate(),
        dueDate: getLocalDate(14),
      });

      await fetchData();
    } catch (error) {
      console.error("Issue Book Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to issue book"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // USER INTERFACE
  // ===================================

  return (
    <div className="page-content">
      <h2>Issue Books</h2>

      <h3>Issue a Book to Student</h3>

      {/* ISSUE BOOK FORM */}
      <form onSubmit={handleSubmit}>
        {/* SELECT STUDENT */}
        <select
          name="studentId"
          value={form.studentId}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Student</option>

          {students.map((student) => (
            <option
              key={student._id}
              value={student._id}
            >
              {student.name} - {student.admissionNumber}
            </option>
          ))}
        </select>

        {/* SELECT BOOK */}
        <select
          name="bookId"
          value={form.bookId}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Available Book</option>

          {books
            .filter((book) => Number(book.quantity) > 0)
            .map((book) => (
              <option
                key={book._id}
                value={book._id}
              >
                {book.title} - Available: {book.quantity}
              </option>
            ))}
        </select>

        {/* ISSUE DATE */}
        <label style={styles.label}>
          Issue Date
        </label>

        <input
          type="date"
          name="issueDate"
          value={form.issueDate}
          onChange={handleChange}
          required
          style={styles.input}
        />

        {/* DUE DATE */}
        <label style={styles.label}>
          Due Date
        </label>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          min={form.issueDate}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button
          type="submit"
          disabled={loading}
          style={styles.submitButton}
        >
          {loading ? "Issuing..." : "Issue Book"}
        </button>
      </form>

      <hr style={{ margin: "25px 0" }} />

      {/* ISSUED BOOKS TABLE */}
      <h3>Issued Books Records</h3>

      <p>Total Records: {issues.length}</p>

      {fetchError && (
        <p style={{ color: "red" }}>
          {fetchError}
        </p>
      )}

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
              <th>Book</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center" }}
                >
                  No issued books found
                </td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    {issue.student?.name ||
                      "Student unavailable"}
                  </td>

                  <td>
                    {issue.student?.admissionNumber ||
                      "-"}
                  </td>

                  <td>
                    {issue.book?.title ||
                      "Book unavailable"}
                  </td>

                  <td>
                    {issue.issueDate
                      ? new Date(
                          issue.issueDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {issue.dueDate
                      ? new Date(
                          issue.dueDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <span
                      style={{
                        color:
                          issue.status === "Returned"
                            ? "green"
                            : "#d97706",
                        fontWeight: "bold",
                      }}
                    >
                      {issue.status}
                    </span>
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
  input: {
    display: "block",
    width: "100%",
    maxWidth: "450px",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
  },

  submitButton: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    backgroundColor: "white",
  },
};

export default IssueBooks;