import React from "react";

function Dashboard({ setToken }) {

  const token = localStorage.getItem("token");

  const user = JSON.parse(atob(token));

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert("JWT Token Copied Successfully!");
  };

  return (
    <div className="container">

      <div className="card">

        <h1>🎉 Welcome {user.username}</h1>

        <p className="success">
          ✔ Login Successful
        </p>

        <hr />

        <h2>User Information</h2>

        <table>

          <tbody>

            <tr>
              <td><b>Username</b></td>
              <td>{user.username}</td>
            </tr>

            <tr>
              <td><b>Role</b></td>
              <td>{user.role}</td>
            </tr>

            <tr>
              <td><b>Login Time</b></td>
              <td>{user.loginTime}</td>
            </tr>

          </tbody>

        </table>

        <h2>Generated JWT Token</h2>

        <textarea
          rows="7"
          value={token}
          readOnly
        />

        <button onClick={copyToken}>
          📋 Copy Token
        </button>

        <button
          className="logout"
          onClick={logout}
        >
          🚪 Logout
        </button>

      </div>

    </div>
  );
}

export default Dashboard;