import React, { useState } from "react";

function EditorPanel() {

  const [message, setMessage] =
    useState("");

  const handleAction = (action) => {

    setMessage(
      `✓ ${action} action selected`
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);

  };


  return (

    <div className="page">

      <div className="dashboard-card editor-card">


        <div className="profile-icon">
          ✏️
        </div>


        <h1>
          Editor Panel
        </h1>


        <p className="success">
          ✓ Editor Access Granted
        </p>


        {message && (

          <div className="action-message">

            {message}

          </div>

        )}


        <div className="info-box">

          <h3>
            ✏️ Editor Controls
          </h3>


          <button
            className="panel-action"
            onClick={() =>
              handleAction(
                "Create Content"
              )
            }
          >

            📝 Create Content

          </button>


          <button
            className="panel-action"
            onClick={() =>
              handleAction(
                "Edit Content"
              )
            }
          >

            ✏️ Edit Content

          </button>


          <button
            className="panel-action"
            onClick={() =>
              handleAction(
                "Publish Content"
              )
            }
          >

            📤 Publish Content

          </button>

        </div>

      </div>

    </div>
  );
}

export default EditorPanel;