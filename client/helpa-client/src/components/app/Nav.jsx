import React from "react";

import VIEWS from "constants/Views.constants";
import { withRouter } from "react-router-dom";

const LONG_HEADER_PAGE = [VIEWS.HOME, VIEWS.ACCOUNT, VIEWS.SIGNIN, VIEWS.SIGNOUT];

export default withRouter((props) => {

  const url = props.location.pathname.replace("/", "");
  
  return (
    <div id="Nav">
      <header>
        <div className="container d-flex align-items-center">
          <div className="menu-toggle">
            <span></span>
            <div className="menu-content">
              <ul>
                <a href="/">
                  <li>Home</li>
                </a>
                {props.users_id ? (
                  <a href="/account">
                    <li>Account</li>
                  </a>
                ) : (
                  ""
                )}
                {props.users_id ? (
                  <a href="/signout">
                    <li>Signout</li>
                  </a>
                ) : (
                  <a href="/signin">
                    <li>Signin</li>
                  </a>
                )}
              </ul>
            </div>
          </div>
          <h2 className="page-title">
            <a href="/">Help a Stranger</a>
          </h2>
        </div>
      </header>

      <div
        className={`hero ${LONG_HEADER_PAGE.includes(url) ? "" : "shortened"}`}
      ></div>
    </div>
  );
});
