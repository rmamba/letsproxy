import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ReactComponent as User } from "../assets/icons/user.svg";
import { ReactComponent as Lock } from "../assets/icons/lock.svg";
import Pattern from "../assets/images/pattern.png";
import { Redirect } from "react-router-dom";
import { API_URL } from '../config/settings';

const USER_API_URL = API_URL + '/api/user/login';

const Login = (props: any) => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [auth, setAuth] = useState(false);

  function handleLogin(e: any) {
    e.preventDefault();

    setLoginLoading(true);

    if (user.length <= 0) {
      toast.warn("Username is required", {
        position: "top-right",
      });
    } else if (password.length <= 0) {
      toast.warn("Password is required", {
        position: "top-right",
      });
    } else if (password.length < 5) {
      toast.warn("Password must at least 6 characters", {
        position: "top-right",
      });
    } else if (user.length > 0 && password.length > 5) {
      axios
        .post(USER_API_URL, {
          user: user,
          password: password,
        })
        .then((res) => {
          localStorage.setItem("token", JSON.stringify(res.data.token));
          if (res.data.token != null) {
            setAuth(true);
            localStorage.setItem("user", user);
          }
          toast.success("You have sucessfully logged in", {
            position: "top-right",
          });
        })
        .catch((err) => {
          // toast.error(err.message, {
          //   position: "top-right",
          // });
          toast.error("Invalid username or password", {
            position: "top-right",
          });
          setLoginLoading(false);
        });
    }
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
        <div className="login-pic">
          <img src={Pattern} className="login-pat" alt="" />
        </div>
      </div>
    </div>
  );
};

export default Login;
