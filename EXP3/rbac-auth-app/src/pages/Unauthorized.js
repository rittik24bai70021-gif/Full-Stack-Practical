import React from "react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {

  const navigate =
    useNavigate();


  return (

    <div className="page">

      <div className="unauthorized-card">

        <div className="denied-icon">
          🚫
        </div>


        <h1>
          Access Denied
        </h1>


        <p className="denied-title">
          You don't have permission
          to access this page.
        </p>


        <div className="denied-box">

          <strong>
            🔐 Authorization Required
          </strong>

          <p>
            Your current role does not
            have the required permissions
            for this resource.
          </p>

        </div>


        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >

          ← Back to Dashboard

        </button>

      </div>

    </div>
  );
}

export default Unauthorized;