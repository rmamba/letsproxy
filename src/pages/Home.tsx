import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [auth, setAuth] = useState(true);

  function handleLogout() {
    console.log("logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (localStorage.getItem("token") === null) {
      setAuth(false);
    }
    toast("You have sucessfully logged out", {
      position: "top-right",
    });
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
