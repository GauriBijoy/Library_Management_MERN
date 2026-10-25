import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/students`;

const emptyStudent = {
  name: "",
  admissionNumber: "",
  className: "",
  division: "",
  email: "",
  phone: "",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState({ ...emptyStudent });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // FETCH ALL STUDENTS
  const fetchStudents = async () => {
    try {
      setErrorMessage("");

      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      console.error("Fetch Students Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch students"
      );
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // HANDLE FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setStudent((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ADD OR UPDATE STUDENT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/${editingId}`,
          student
        );

        alert("Student Updated Successfully!");
      } else {
        await axios.post(API_URL, student);

        alert("Student Added Successfully!");
      }

      setStudent({ ...emptyStudent });
      setEditingId(null);

      await fetchStudents();
    } catch (error) {
      console.error("Save Student Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save student"
      );
    } finally {
      setLoading(false);
    }
  };

  // EDIT STUDENT
  const handleEdit = (item) => {
    setEditingId(item._id);

    setStudent({
      name: item.name || "",
      admissionNumber: item.admissionNumber || "",
      className: item.className || "",
      division: item.division || "",
      email: item.email || "",
      phone: item.phone || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // CANCEL EDIT
  const handleCancelEdit = () => {
    setEditingId(null);
    setStudent({ ...emptyStudent });
  };

  // DELETE STUDENT
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);

      alert("Student Deleted Successfully!");

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchStudents();
    } catch (error) {
      console.error("Delete Student Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete student"
      );
    }
  };

  // SEARCH STUDENTS
  const filteredStudents = students.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      String(item.name || "")
        .toLowerCase()
        .includes(search) ||
      String(item.admissionNumber || "")
        .toLowerCase()
        .includes(search) ||
      String(item.className || "")
        .toLowerCase()
        .includes(search) ||
      String(item.division || "")
        .toLowerCase()
        .includes(search)
    );
  });

  return (
    <div className="page-content">
      <h2>Student Management</h2>

      <h3>
        {editingId ? "Edit Student" : "Add New Student"}
      </h3>

      {/* STUDENT FORM */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={student.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="admissionNumber"
          placeholder="Admission Number"
          value={student.admissionNumber}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="className"
          placeholder="Class (Example: 10)"
          value={student.className}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="division"
          placeholder="Division (Example: A)"
          value={student.division}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email (Optional)"
          value={student.email}
          onChange={handleChange}
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number (Optional)"
          value={student.phone}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: editingId
              ? "#16a34a"
              : "#2563eb",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Saving..."
            : editingId
            ? "Update Student"
            : "Add Student"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              padding: "10px 15px",
              marginLeft: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <hr style={{ margin: "25px 0" }} />

      {/* STUDENT LIST */}
      <h3>All Students</h3>

      <input
        type="text"
        placeholder="Search by Name, Admission Number, Class, or Division"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          boxSizing: "border-box",
        }}
      />

      <p>
        Showing {filteredStudents.length} of{" "}
        {students.length} students
      </p>

      {errorMessage && (
        <p style={{ color: "red" }}>
          {errorMessage}
        </p>
      )}

      {/* STUDENTS TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Admission No.</th>
              <th>Class</th>
              <th>Division</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  {errorMessage
                    ? "Unable to load students"
                    : students.length === 0
                    ? "No students available"
                    : "No matching students found"}
                </td>
              </tr>
            ) : (
              filteredStudents.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.admissionNumber}</td>
                  <td>{item.className}</td>
                  <td>{item.division}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.phone || "-"}</td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      style={{
                        backgroundColor: "#2563eb",
                        color: "white",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(item._id)
                      }
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
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

export default Students;