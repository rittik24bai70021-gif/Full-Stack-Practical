import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setToken }) {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  // Demo users
  const users = [
    {
      username: "Rittik Basak",
      password: "Rittik33",
      role: "Admin"
    },
    {
      username: "editor",
      password: "editor123",
      role: "Editor"
    },
    {
      username: "viewer",
      password: "viewer123",
      role: "Viewer"
    }
  ];

  const handleLogin = () => {

    const user = users.find(
      (u) =>
        u.username === username &&
        u.password === password
    );

    if (!user) {

      setError(
        "❌ Invalid Username or Password"
      );

      return;
    }

    const payload = {

      username: user.username,

      role: user.role,

      loginTime:
        new Date().toLocaleString()
    };

    /*
      Demo token generation.

      This encodes the user information
      so that the application can maintain
      a client-side authentication state.
    */

    const token = btoa(
      JSON.stringify(payload)
    );

    localStorage.setItem(
      "token",
      token
    );

    setToken(token);

    setError("");

    navigate("/dashboard");
  };


  return (

    <div className="container">

      <div className="card">

        {/* Login Icon */}

        <div className="login-icon">
          🔐
        </div>


        {/* Heading */}

        <h1>
          RBAC Authentication
        </h1>

        <p className="subtitle">
          Role-Based Access Control
        </p>


        {/* Username */}

        <label>
          Username
        </label>

        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />


        {/* Password */}

        <label>
          Password
        </label>

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          placeholder="Enter your password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />


        {/* Show Password */}

        <label className="checkbox">

          <input
            type="checkbox"
            checked={showPassword}
            onChange={() =>
              setShowPassword(
                !showPassword
              )
            }
          />

          Show Password

        </label>


        {/* Login Button */}

        <button
          className="login-button"
          onClick={handleLogin}
        >
          Login →
        </button>


        {/* Error */}

        {error && (

          <p className="error">
            {error}
          </p>

        )}


        <hr />


        {/* Demo Credentials */}

        <div className="demo">

          <h3>
            Demo Credentials
          </h3>


          {/* Admin */}

          <div className="demo-user">

            <h4>
              👑 Admin
            </h4>

            <p>
              Username:
              <b> Rittik Basak</b>
            </p>

            <p>
              Password:
              <b> Rittik33</b>
            </p>

          </div>


          {/* Editor */}

          <div className="demo-user">

            <h4>
              ✏️ Editor
            </h4>

            <p>
              Username:
              <b> editor</b>
            </p>

            <p>
              Password:
              <b> editor123</b>
            </p>

          </div>


          {/* Viewer */}

          <div className="demo-user">

            <h4>
              👁️ Viewer
            </h4>

            <p>
              Username:
              <b> viewer</b>
            </p>

            <p>
              Password:
              <b> viewer123</b>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;