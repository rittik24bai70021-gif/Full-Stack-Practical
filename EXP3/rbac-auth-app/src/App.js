import React, { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login
  from "./components/Login";

import Navbar
  from "./components/Navbar";

import ProtectedRoute
  from "./components/ProtectedRoute";

import Dashboard
  from "./pages/Dashboard";

import AdminPanel
  from "./pages/AdminPanel";

import EditorPanel
  from "./pages/EditorPanel";

import Unauthorized
  from "./pages/Unauthorized";

import "./App.css";


function App() {

  const [token, setToken] =
    useState(
      localStorage.getItem(
        "token"
      )
    );


  return (

    <BrowserRouter>

      {token && (

        <Navbar
          setToken={setToken}
        />

      )}


      <Routes>


        {/* Login */}

        <Route
          path="/"
          element={

            token ? (

              <Navigate
                to="/dashboard"
                replace
              />

            ) : (

              <Login
                setToken={setToken}
              />

            )

          }
        />


        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={

            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "Editor",
                "Viewer"
              ]}
            >

              <Dashboard />

            </ProtectedRoute>

          }
        />


        {/* Admin */}

        <Route
          path="/admin"
          element={

            <ProtectedRoute
              allowedRoles={[
                "Admin"
              ]}
            >

              <AdminPanel />

            </ProtectedRoute>

          }
        />


        {/* Editor */}

        <Route
          path="/editor"
          element={

            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "Editor"
              ]}
            >

              <EditorPanel />

            </ProtectedRoute>

          }
        />


        {/* Unauthorized */}

        <Route
          path="/unauthorized"
          element={
            <Unauthorized />
          }
        />


        {/* Unknown */}

        <Route
          path="*"
          element={

            <Navigate
              to="/dashboard"
              replace
            />

          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;