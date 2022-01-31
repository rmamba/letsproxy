import type React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
// import AuthService from "./services/auth.service";

import "./styles/global.scss";
import "./styles/login.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Home from "./pages/Home";

const App: React.FC = (): JSX.Element => {
  return (
    <Router>
      <Route path="/login" element={Login} />
      <ProtectedRoute path="/" element={Home} />
      <ToastContainer />
    </Router>
  );
};

export default App;
