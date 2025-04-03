import React, { useState } from "react";
import Home from "../Home/Home";
import Login from "../../Components/Login/login.jsx";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {isAuthenticated ? (
        <Home />
      ) : (
        <Login onLogin={setIsAuthenticated} />
      )}
    </>
  );
}