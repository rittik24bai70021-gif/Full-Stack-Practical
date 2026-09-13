import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Save
} from "lucide-react";

import "./App.css";

const API_URL = "http://localhost:8080/api/users";

function App() {

  const [users, setUsers] = useState([]);
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await fetch(API_URL);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.message);
      }

    } catch (err) {

      setError("Unable to connect to Spring Boot backend.");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const clearForm = () => {
    setUid("");
    setName("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    if (!uid.trim() || !name.trim()) {
      setError("UID and Name are required.");
      return;
    }

    try {

      const method = editingId ? "PUT" : "POST";

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid,
          name
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Something went wrong.");
        return;
      }

      setMessage(
        editingId
          ? "User updated successfully."
          : "User added successfully."
      );

      clearForm();
      fetchUsers();

    } catch (err) {

      setError("Unable to connect to Spring Boot backend.");

    }
  };

  const handleEdit = (user) => {

    setEditingId(user.id);
    setUid(user.uid);
    setName(user.name);

    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Unable to delete user.");
        return;
      }

      setMessage("User deleted successfully.");

      if (editingId === id) {
        clearForm();
      }

      fetchUsers();

    } catch (err) {

      setError("Unable to connect to Spring Boot backend.");

    }
  };

  return (
    <div className="app">

      <header className="header">

        <div className="header-content">

          <div className="brand">

            <div className="brand-icon">
              <Users size={30} />
            </div>

            <div>
              <h1>REST API User Management System</h1>
              <p>Spring Boot + React</p>
            </div>

          </div>

          <div className="experiment">
            Experiment 5.1
          </div>

        </div>

      </header>

      <main className="container">

        {message && (
          <div className="alert success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <section className="dashboard">

          {/* ADD USER */}

          <div className="card form-card">

            <div className="card-title">

              <div className="title-icon">
                <UserPlus size={24} />
              </div>

              <div>
                <h2>
                  {editingId ? "Edit User" : "Add User"}
                </h2>

                <p>
                  {editingId
                    ? "Update user information"
                    : "Create a new user record"}
                </p>
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              <label>UID</label>

              <input
                type="text"
                placeholder="Enter UID"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
              />

              <label>Name</label>

              <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="form-buttons">

                <button className="primary-btn" type="submit">

                  {editingId ? (
                    <>
                      <Save size={18} />
                      Update User
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Add User
                    </>
                  )}

                </button>

                {editingId && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={clearForm}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </div>

          {/* USER RECORDS */}

          <div className="card records-card">

            <div className="records-header">

              <div className="card-title">

                <div className="title-icon">
                  <Users size={24} />
                </div>

                <div>
                  <h2>User Records</h2>
                  <p>
                    {users.length} user
                    {users.length !== 1 ? "s" : ""} registered
                  </p>
                </div>

              </div>

              <button
                className="refresh-btn"
                onClick={fetchUsers}
                disabled={loading}
              >
                <RefreshCw
                  size={18}
                  className={loading ? "spin" : ""}
                />
                Refresh
              </button>

            </div>

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {users.length === 0 ? (

                    <tr>
                      <td colSpan="3" className="empty">
                        No users found. Add your first user.
                      </td>
                    </tr>

                  ) : (

                    users.map((user) => (

                      <tr key={user.id}>

                        <td>
                          <span className="uid-badge">
                            {user.uid}
                          </span>
                        </td>

                        <td>{user.name}</td>

                        <td>

                          <div className="actions">

                            <button
                              className="edit-btn"
                              onClick={() => handleEdit(user)}
                            >
                              <Pencil size={16} />
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

            <div className="table-footer">

              <span>
                Showing {users.length} user
                {users.length !== 1 ? "s" : ""}
              </span>

            </div>

          </div>

        </section>

      </main>

      <footer>
        REST API User Management System
        <span>|</span>
        Spring Boot + React
      </footer>

    </div>
  );
}

export default App;