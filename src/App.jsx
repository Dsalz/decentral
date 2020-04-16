import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

// Views
import AuthPage from "./views/AuthPage";

// CSS
import "./css/App.css";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="*" component={AuthPage} />
      </Switch>
    </BrowserRouter>
  );
};

const appDiv = document.getElementById("app");

render(<App />, appDiv);
