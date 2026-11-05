import React, { useState } from "react";

function AdminPanel() {
  const [activeSection, setActiveSection] = useState(null);
  const [message, setMessage] = useState("");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const users = [
    {
      name: "Rittik Basak",
      username: "Rittik Basak",
      role: "Admin",
      status: "Active",
    },
    {
      name: "Rittik",
      username: "editor",
      role: "Editor",
      status: "Active",
    },
    {
      name: "Viewer User",
      username: "viewer",
      role: "Viewer",
      status: "Active",
    },
  ];

  const permissions = [
    {
      role: "Admin",
      dashboard: true,
      users: true,
      content: true,
      settings: true,
    },
    {
      role: "Editor",
      dashboard: true,
      users: false,
      content: true,
      settings: false,
    },
    {
      role: "Viewer",
      dashboard: true,
      users: false,
      content: false,
      settings: false,
    },
  ];

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleSection = (section) => {
    setActiveSection(section);
    setMessage("");
  };

  return (
    <div className="page">

      <div className="admin-container">

        {/* ================= HEADER ================= */}

        <div className="admin-header">

          <div>

            <div className="panel-icon">
              👑
            </div>

            <div>
              <h1>Admin Panel</h1>

              <p>
                System administration and management
              </p>
            </div>

          </div>

          <span className="admin-badge">
            ADMIN ACCESS
          </span>

        </div>


        {/* ================= ACCESS STATUS ================= */}

        <div className="access-success">
          ✓ Admin Access Granted — Welcome, Rittik Basak
        </div>


        {/* ================= STATISTICS ================= */}

        <div className="admin-stats">

          <div>
            <span>👥</span>
            <strong>3</strong>
            <p>Total Users</p>
          </div>

          <div>
            <span>🔐</span>
            <strong>3</strong>
            <p>Roles Defined</p>
          </div>

          <div>
            <span>🛡️</span>
            <strong>100%</strong>
            <p>System Security</p>
          </div>

        </div>


        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="action-message">
            ✓ {message}
          </div>
        )}


        {/* ================= ADMIN CONTROLS ================= */}

        <div className="admin-section">

          <h2>Administrative Controls</h2>

          <p className="section-description">
            Select an administrative function to manage
            the RBAC system.
          </p>


          <div className="admin-controls">

            {/* MANAGE USERS */}

            <button
              onClick={() => handleSection("users")}
            >

              <span>👥</span>

              <div>
                <strong>Manage Users</strong>

                <small>
                  View and manage registered users
                </small>
              </div>

              <b>→</b>

            </button>


            {/* MANAGE PERMISSIONS */}

            <button
              onClick={() => handleSection("permissions")}
            >

              <span>🔐</span>

              <div>
                <strong>Manage Permissions</strong>

                <small>
                  Control role-based permissions
                </small>
              </div>

              <b>→</b>

            </button>


            {/* SYSTEM SETTINGS */}

            <button
              onClick={() => handleSection("settings")}
            >

              <span>⚙️</span>

              <div>
                <strong>System Settings</strong>

                <small>
                  Configure application settings
                </small>
              </div>

              <b>→</b>

            </button>


            {/* REPORTS */}

            <button
              onClick={() => handleSection("reports")}
            >

              <span>📊</span>

              <div>
                <strong>View Reports</strong>

                <small>
                  Monitor system activity
                </small>
              </div>

              <b>→</b>

            </button>

          </div>

        </div>


        {/* =================================================
            MANAGE USERS
        ================================================= */}

        {activeSection === "users" && (

          <div className="admin-section interactive-panel">

            <div className="panel-title-row">

              <div>
                <h2>👥 User Management</h2>

                <p className="section-description">
                  View users and their assigned roles.
                </p>
              </div>

              <button
                className="close-button"
                onClick={() => setActiveSection(null)}
              >
                ✕
              </button>

            </div>


            <div className="user-table">

              <div className="table-header">

                <span>Name</span>
                <span>Username</span>
                <span>Role</span>
                <span>Status</span>

              </div>


              {users.map((user, index) => (

                <div
                  className="table-row"
                  key={index}
                >

                  <strong>
                    {user.name}
                  </strong>

                  <span>
                    {user.username}
                  </span>

                  <span
                    className={`role-${user.role.toLowerCase()}`}
                  >
                    {user.role}
                  </span>

                  <span className="status-active">
                    ● {user.status}
                  </span>

                </div>

              ))}

            </div>

          </div>

        )}


        {/* =================================================
            PERMISSIONS
        ================================================= */}

        {activeSection === "permissions" && (

          <div className="admin-section interactive-panel">

            <div className="panel-title-row">

              <div>

                <h2>🔐 Role Permissions</h2>

                <p className="section-description">
                  RBAC permissions assigned to each role.
                </p>

              </div>

              <button
                className="close-button"
                onClick={() => setActiveSection(null)}
              >
                ✕
              </button>

            </div>


            <div className="permission-table">

              <div className="permission-header">

                <span>Role</span>
                <span>Dashboard</span>
                <span>Users</span>
                <span>Content</span>
                <span>Settings</span>

              </div>


              {permissions.map((item, index) => (

                <div
                  className="permission-row"
                  key={index}
                >

                  <strong>
                    {item.role}
                  </strong>

                  <span>
                    {item.dashboard ? "✓" : "✕"}
                  </span>

                  <span>
                    {item.users ? "✓" : "✕"}
                  </span>

                  <span>
                    {item.content ? "✓" : "✕"}
                  </span>

                  <span>
                    {item.settings ? "✓" : "✕"}
                  </span>

                </div>

              ))}

            </div>

          </div>

        )}


        {/* =================================================
            SYSTEM SETTINGS
        ================================================= */}

        {activeSection === "settings" && (

          <div className="admin-section interactive-panel">

            <div className="panel-title-row">

              <div>

                <h2>⚙️ System Settings</h2>

                <p className="section-description">
                  Configure security and application settings.
                </p>

              </div>

              <button
                className="close-button"
                onClick={() => setActiveSection(null)}
              >
                ✕
              </button>

            </div>


            {/* Maintenance */}

            <div className="setting-row">

              <div>

                <strong>
                  Maintenance Mode
                </strong>

                <p>
                  Temporarily restrict application access.
                </p>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => {

                    setMaintenanceMode(
                      e.target.checked
                    );

                    showMessage(
                      e.target.checked
                        ? "Maintenance mode enabled."
                        : "Maintenance mode disabled."
                    );

                  }}
                />

                <span className="slider"></span>

              </label>

            </div>


            {/* Notifications */}

            <div className="setting-row">

              <div>

                <strong>
                  Security Notifications
                </strong>

                <p>
                  Receive alerts for authentication events.
                </p>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => {

                    setNotifications(
                      e.target.checked
                    );

                    showMessage(
                      e.target.checked
                        ? "Security notifications enabled."
                        : "Security notifications disabled."
                    );

                  }}
                />

                <span className="slider"></span>

              </label>

            </div>


            <div className="settings-status">

              <span>🛡️</span>

              <div>

                <strong>
                  Current Security Status
                </strong>

                <p>
                  {maintenanceMode
                    ? "Maintenance mode is currently active."
                    : "System is operating normally."
                  }
                </p>

              </div>

              <span className="secure-badge">
                {maintenanceMode
                  ? "MAINTENANCE"
                  : "SECURE"
                }
              </span>

            </div>

          </div>

        )}


        {/* =================================================
            REPORTS
        ================================================= */}

        {activeSection === "reports" && (

          <div className="admin-section interactive-panel">

            <div className="panel-title-row">

              <div>

                <h2>📊 System Reports</h2>

                <p className="section-description">
                  Overview of authentication and authorization
                  activity.
                </p>

              </div>

              <button
                className="close-button"
                onClick={() => setActiveSection(null)}
              >
                ✕
              </button>

            </div>


            <div className="report-grid">

              <div className="report-card">

                <span>🔑</span>

                <strong>
                  Successful Logins
                </strong>

                <b>
                  1
                </b>

              </div>


              <div className="report-card">

                <span>🚫</span>

                <strong>
                  Failed Attempts
                </strong>

                <b>
                  0
                </b>

              </div>


              <div className="report-card">

                <span>👥</span>

                <strong>
                  Active Users
                </strong>

                <b>
                  3
                </b>

              </div>


              <div className="report-card">

                <span>🛡️</span>

                <strong>
                  Protected Routes
                </strong>

                <b>
                  3
                </b>

              </div>

            </div>


            <div className="report-summary">

              <strong>
                Security Summary
              </strong>

              <p>
                ✓ Authentication is enabled
              </p>

              <p>
                ✓ Role-based authorization is enabled
              </p>

              <p>
                ✓ Protected routes are active
              </p>

              <p>
                ✓ Unauthorized access is restricted
              </p>

            </div>

          </div>

        )}


        {/* ================= SECURITY FOOTER ================= */}

        <div className="admin-security">

          <span>🛡️</span>

          <div>

            <strong>
              Admin Security Status
            </strong>

            <p>
              All administrative routes are protected
              by role-based access control.
            </p>

          </div>

          <span className="secure-badge">
            SECURE
          </span>

        </div>

      </div>

    </div>
  );
}

export default AdminPanel;