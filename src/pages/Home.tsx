import React, { useState } from "react";
import { Redirect } from "react-router-dom";

const Home = () => {
  const [auth, setAuth] = useState(true);

  function handleLogout() {
    console.log("logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (localStorage.getItem("token") === null) {
      setAuth(false);
    }
  }

  return auth ? (
    <div className="container">
      <header className="content">
        <h3>Welcome to letsproxy {localStorage.getItem("user")}</h3>
        <button onClick={handleLogout}>Logout</button>
      </header>
    </div>
  ) : (
    <Redirect to="/login" />
  );
};

export default Home;
