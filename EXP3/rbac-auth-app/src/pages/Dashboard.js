import React from "react";

function Dashboard() {

  const token =
    localStorage.getItem("token");

  const user =
    JSON.parse(atob(token));


  const getRoleIcon = () => {

    if (user.role === "Admin") {
      return "👑";
    }

    if (user.role === "Editor") {
      return "✏️";
    }

    return "👁️";
  };


  const getRoleDescription = () => {

    if (user.role === "Admin") {

      return "Full system administrator";

    }

    if (user.role === "Editor") {

      return "Content management access";

    }

    return "Read-only application access";

  };


  const permissionCount =
    user.role === "Admin"
      ? 3
      : user.role === "Editor"
      ? 2
      : 1;


  const accessLevel =
    user.role === "Admin"
      ? "100%"
      : user.role === "Editor"
      ? "70%"
      : "30%";


  return (

    <div className="page">

      <div className="dashboard-container">


        {/* Welcome */}

        <div className="welcome-card">

          <div className="profile-icon">

            {getRoleIcon()}

          </div>


          <div>

            <p className="welcome-small">
              Welcome back
            </p>

            <h1>
              {user.username}
            </h1>

            <p className="role-description">
              {getRoleDescription()}
            </p>

          </div>


          <div className="role-badge">

            {user.role}

          </div>

        </div>


        {/* Statistics */}

        <div className="stats-grid">


          <div className="stat-card">

            <div className="stat-icon">
              👤
            </div>

            <div>

              <h2>
                1
              </h2>

              <p>
                Active User
              </p>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              🛡️
            </div>

            <div>

              <h2>
                {accessLevel}
              </h2>

              <p>
                Access Level
              </p>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              🔐
            </div>

            <div>

              <h2>
                {permissionCount}
              </h2>

              <p>
                Permissions
              </p>

            </div>

          </div>

        </div>


        {/* Dashboard Grid */}

        <div className="dashboard-grid">


          {/* User Information */}

          <div className="dashboard-section">

            <div className="section-header">

              <h3>
                👤 User Information
              </h3>

            </div>


            <div className="information-list">


              <div className="information-row">

                <span>
                  Username
                </span>

                <strong>
                  {user.username}
                </strong>

              </div>


              <div className="information-row">

                <span>
                  Role
                </span>

                <strong className="role-text">

                  {user.role}

                </strong>

              </div>


              <div className="information-row">

                <span>
                  Login Time
                </span>

                <strong>
                  {user.loginTime}
                </strong>

              </div>


              <div className="information-row">

                <span>
                  Authentication
                </span>

                <strong className="authenticated">

                  ✓ Verified

                </strong>

              </div>

            </div>

          </div>


          {/* Permissions */}

          <div className="dashboard-section">

            <div className="section-header">

              <h3>
                🔐 Your Permissions
              </h3>

            </div>


            <div className="permission-list">


              {/* Dashboard */}

              <div className="permission-item">

                <div>

                  <span className="permission-icon">
                    📊
                  </span>

                  <span>
                    Dashboard Access
                  </span>

                </div>

                <span className="allowed">
                  ✓ Allowed
                </span>

              </div>


              {/* Content */}

              <div className="permission-item">

                <div>

                  <span className="permission-icon">
                    ✏️
                  </span>

                  <span>
                    Content Management
                  </span>

                </div>

                <span
                  className={
                    user.role === "Viewer"
                      ? "denied"
                      : "allowed"
                  }
                >

                  {user.role === "Viewer"
                    ? "✕ Restricted"
                    : "✓ Allowed"
                  }

                </span>

              </div>


              {/* User Management */}

              <div className="permission-item">

                <div>

                  <span className="permission-icon">
                    👥
                  </span>

                  <span>
                    User Management
                  </span>

                </div>

                <span
                  className={
                    user.role === "Admin"
                      ? "allowed"
                      : "denied"
                  }
                >

                  {user.role === "Admin"
                    ? "✓ Allowed"
                    : "✕ Restricted"
                  }

                </span>

              </div>

            </div>

          </div>

        </div>


        {/* Security Status */}

        <div className="security-card">

          <div className="security-icon">
            🛡️
          </div>

          <div>

            <h3>
              Security Status
            </h3>

            <p>
              Your session is active and
              role-based permissions are
              being enforced.
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

export default Dashboard;