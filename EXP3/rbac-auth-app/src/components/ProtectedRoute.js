import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles
}) {

  const token =
    localStorage.getItem("token");

  // User is not logged in
  if (!token) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  let user;

  try {

    user = JSON.parse(
      atob(token)
    );

  } catch (error) {

    localStorage.removeItem(
      "token"
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  // Check role permission

  if (
    allowedRoles &&
    !allowedRoles.includes(
      user.role
    )
  ) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }


  return children;
}

export default ProtectedRoute;