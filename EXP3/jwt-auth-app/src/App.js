import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <>
      {token ? (
        <Dashboard setToken={setToken} />
      ) : (
        <Login setToken={setToken} />
      )}
    </>
  );
}

export default App;