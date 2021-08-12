import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
// import AuthService from "./services/auth.service";

import "./styles/global.scss";
import "./styles/login.scss";

import Login from "./pages/Login";
import Home from "./pages/Home";

const App: React.FC = (): JSX.Element => {
  return (
    <Router>
      <Route exact path="/login" component={Login} />
      <ProtectedRoute exact path="/" component={Home} />
    </Router>
  );
};

export default App;
