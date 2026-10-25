import { useEffect, useState } from "react";
import axios from "axios";

// Backend API
 const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/books`;

// Empty book form
const emptyBook = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  quantity: 1,
};

function Books() {
  // ======================================
  // 1. STATE VARIABLES
  // ======================================

  // Store all books
  const [books, setBooks] = useState([]);

  // Store book form details
  const [book, setBook] = useState({ ...emptyBook });

  // Store selected book ID for editing
  const [editingId, setEditingId] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Search text
  const [searchTerm, setSearchTerm] = useState("");

  // Error message
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================
  // 2. FETCH ALL BOOKS
  // ======================================

  const fetchBooks = async () => {
    try {
      setErrorMessage("");

      const response = await axios.get(API_URL);

      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch books"
      );
    }
  };

  // Fetch books when the page loads
  useEffect(() => {
    fetchBooks();
  }, []);

  // ======================================
  // 3. HANDLE INPUT CHANGES
  // ======================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBook((previousBook) => ({
      ...previousBook,
      [name]: value,
    }));
  };

  // ======================================
  // 4. ADD OR UPDATE BOOK
  // ======================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const bookData = {
        ...book,
        quantity: Number(book.quantity),
      };

      if (editingId) {
        // UPDATE EXISTING BOOK
        await axios.put(
          `${API_URL}/${editingId}`,
          bookData
        );

        alert("Book Updated Successfully!");
      } else {
        // ADD NEW BOOK
        await axios.post(API_URL, bookData);

        alert("Book Added Successfully!");
      }

      // Clear the form
      setBook({ ...emptyBook });

      // Exit editing mode
      setEditingId(null);

      // Refresh book list
      await fetchBooks();
    } catch (error) {
      console.error("Save Book Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save book"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // 5. EDIT BOOK
  // ======================================

  const handleEdit = (item) => {
    // Store selected book ID
    setEditingId(item._id);

    // Fill form with existing details
    setBook({
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      category: item.category,
      quantity: item.quantity,
    });

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================
  // 6. CANCEL EDIT
  // ======================================

  const handleCancelEdit = () => {
    setEditingId(null);

    setBook({ ...emptyBook });
  };

  // ======================================
  // 7. DELETE BOOK
  // ======================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      // Delete book from MongoDB
      await axios.delete(`${API_URL}/${id}`);

      alert("Book Deleted Successfully!");

      // Clear form if currently editing deleted book
      if (editingId === id) {
        handleCancelEdit();
      }

      // Refresh table
      await fetchBooks();
    } catch (error) {
      console.error("Delete Book Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete book"
      );
    }
  };

  // ======================================
  // 8. SEARCH BOOKS
  // ======================================

  const filteredBooks = books.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      String(item.title || "")
        .toLowerCase()
        .includes(search) ||
      String(item.author || "")
        .toLowerCase()
        .includes(search) ||
      String(item.isbn || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // ======================================
  // 9. USER INTERFACE
  // ======================================

  return (
    <div className="page-content">
      {/* MAIN HEADING */}
      <h2>Book Management</h2>

      {/* ======================================
          ADD / EDIT BOOK FORM
      ====================================== */}

      <h3>
        {editingId ? "Edit Book" : "Add New Book"}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* BOOK TITLE */}
        <input
          type="text"
          name="title"
          placeholder="Book Title"
          value={book.title}
          onChange={handleChange}
          required
        />

        {/* AUTHOR */}
        <input
          type="text"
          name="author"
          placeholder="Author Name"
          value={book.author}
          onChange={handleChange}
          required
        />

        {/* ISBN */}
        <input
          type="text"
          name="isbn"
          placeholder="ISBN Number"
          value={book.isbn}
          onChange={handleChange}
          required
        />

        {/* CATEGORY */}
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={book.category}
          onChange={handleChange}
          required
        />

        {/* QUANTITY */}
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          min="0"
          step="1"
          value={book.quantity}
          onChange={handleChange}
          required
        />

        {/* ADD / UPDATE BUTTON */}
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
            ? "Update Book"
            : "Add Book"}
        </button>

        {/* CANCEL EDIT BUTTON */}
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

      {/* ======================================
          ALL BOOKS SECTION
      ====================================== */}

      <h3>All Books</h3>

      {/* SEARCH BOX */}
      <input
        type="text"
        placeholder="Search by Title, Author, or ISBN"
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

      {/* BOOK COUNT */}
      <p>
        Showing {filteredBooks.length} of {books.length} books
      </p>

      {/* FETCH ERROR */}
      {errorMessage && (
        <p style={{ color: "red" }}>
          {errorMessage}
        </p>
      )}

      {/* ======================================
          BOOKS TABLE
      ====================================== */}

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
          {/* TABLE HEADINGS */}
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>
            {filteredBooks.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  {errorMessage
                    ? "Unable to load books"
                    : books.length === 0
                    ? "No books available"
                    : "No matching books found"}
                </td>
              </tr>
            ) : (
              filteredBooks.map((item) => (
                <tr key={item._id}>
                  {/* TITLE */}
                  <td>{item.title}</td>

                  {/* AUTHOR */}
                  <td>{item.author}</td>

                  {/* ISBN */}
                  <td>{item.isbn}</td>

                  {/* CATEGORY */}
                  <td>{item.category}</td>

                  {/* QUANTITY */}
                  <td>{item.quantity}</td>

                  {/* ACTION BUTTONS */}
                  <td>
                    {/* EDIT BUTTON */}
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

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
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

export default Books;