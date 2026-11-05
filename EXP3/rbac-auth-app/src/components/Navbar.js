import React from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

function Navbar({ setToken }) {

  const navigate =
    useNavigate();

  const token =
    localStorage.getItem("token");

  let user = null;

  if (token) {

    try {

      user = JSON.parse(
        atob(token)
      );

    } catch (error) {

      user = null;

    }
  }


  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    setToken(null);

    navigate("/");

  };


  return (

    <nav className="navbar">

      {/* Logo */}

      <div className="logo">

        🔐 RBAC System

      </div>


      {/* Navigation */}

      <div className="nav-links">

        <Link to="/dashboard">
          Dashboard
        </Link>


        {/* Admin */}

        {user?.role === "Admin" && (

          <Link to="/admin">
            Admin Panel
          </Link>

        )}


        {/* Admin + Editor */}

        {(user?.role === "Admin" ||
          user?.role === "Editor") && (

          <Link to="/editor">
            Editor Panel
          </Link>

        )}


        {/* User Role */}

        {user && (

          <span className="nav-user">

            {user.role === "Admin"
              ? "👑"
              : user.role === "Editor"
              ? "✏️"
              : "👁️"
            }

            {" "}

            {user.username}

          </span>

        )}


        {/* Logout */}

        <button
          className="nav-logout"
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;