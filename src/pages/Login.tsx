import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

import { ReactComponent as User } from "../assets/icons/user.svg";
import { ReactComponent as Lock } from "../assets/icons/lock.svg";
import { Redirect } from "react-router-dom";

const API_URL =
  process.env.LEPSPTOXY_API || "http://localhost:3000/api/user/login";

const Login = (props: any) => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [auth, setAuth] = useState(false);

  function handleLogin(e: any) {
    e.preventDefault();

    setLoginLoading(true);

    axios
      .post(API_URL, {
        user: user,
        password: password,
      })
      .then((res) => {
        localStorage.setItem("token", JSON.stringify(res.data.token));
        if (res.data.token != null) {
          setAuth(true);
          localStorage.setItem("user", JSON.stringify(user));
          // return <Redirect to="/" />;
        }
        console.log(user);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message, {
          position: "top-right",
        });
        setLoginLoading(false);
      });
  }

  return auth ? (
    <Redirect to="/"></Redirect>
  ) : (
    <div className="page-container">
      <div className="login-container">
        <div className="login-wrapper">
          <form className="login-form">
            <div className="login-field">
              <h1 className="login-title">Hello there!</h1>
              <h2 className="login-subtitle">Welcome to LetsProxy</h2>
            </div>

            <div className="login-field">
              <div className="username-field">
                <label htmlFor="username" className="form-title">
                  Username
                </label>
                <div>
                  <label htmlFor="remember" className="form-text">
                    Remember
                  </label>
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    value="remember"
                  ></input>
                </div>
              </div>

              <div className="login-input">
                <User />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className="text-input"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password" className="form-title">
                Password
              </label>
              <div className="login-input">
                <Lock />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  className="text-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <a href="/" className="forgot">
                Forgot Password?
              </a>
            </div>

            <button className="btn-primary btn-login" onClick={handleLogin}>
              Sign In
            </button>
          </form>
          <div
            className={`absolute top-1 -right-14 ${
              loginLoading ? "block" : "hidden"
            }`}
          ></div>
        </div>
        <div className="login-pic"></div>
      </div>
    </div>
  );
};

export default Login;
