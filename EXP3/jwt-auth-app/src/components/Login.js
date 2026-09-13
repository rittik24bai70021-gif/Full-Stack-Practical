import React, { useState } from "react";

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {

  const users = [
    {
      username: "admin",
      password: "password123",
      role: "Administrator"
    },
    {
      username: "Rittik",
      password: "Rittik12",
      role: "Student"
    }
  ];

  const user = users.find(
    u =>
      u.username === username &&
      u.password === password
  );

  if (user) {

    const payload = {
      username: user.username,
      role: user.role,
      loginTime: new Date().toLocaleString()
    };

    const token = btoa(JSON.stringify(payload));

    localStorage.setItem("token", token);

    setToken(token);

    setError("");

  } else {

    setError("❌ Invalid Username or Password");

  }

};

  return (
    <div className="container">
      <div className="card">

        <h1>🔐 JWT Authentication</h1>

        <p className="subtitle">
          Secure Login System
        </p>

        <input
          type="text"
          placeholder="👤 Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="checkbox">
          <input
            type="checkbox"
            onChange={() => setShowPassword(!showPassword)}
          />
          Show Password
        </label>

        <button onClick={handleLogin}>
          Login →
        </button>

        <p className="error">{error}</p>

        <hr />

        <div className="demo">
  <h3>Demo Credentials</h3>

  <div className="demo-user">
    <h4>👤 User 1</h4>

    <p>
      Username : <b>admin</b>
    </p>

    <p>
      Password : <b>password123</b>
    </p>
  </div>

  <div className="demo-user">
    <h4>👨‍🎓 User 2</h4>

    <p>
      Username : <b>Rittik</b>
    </p>

    <p>
      Password : <b>Rittik12</b>
    </p>
  </div>
</div>

      </div>
    </div>
  );
}

export default Login;