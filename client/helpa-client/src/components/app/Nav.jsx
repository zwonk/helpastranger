import React from "react";

import VIEWS from "constants/Views.constants";
import { withRouter } from "react-router-dom";

const LONG_HEADER_PAGE = [
  VIEWS.HOME,
  VIEWS.Q,
  VIEWS.ACCOUNT,
  VIEWS.SIGNIN,
  VIEWS.SIGNOUT,
];

export default withRouter((props) => {
  let url = props.location.pathname.split("/");
  if (url.length > 1) {
    url = url[1];
  }

  const TopBannerStyle = {
    backgroundColor: "rgb(170,250,200)" /*rgb(142,142,189)*/,
    width: "100%",
    height: "30px",
    textAlign: "center",
    display: "block",
    lineHeight: "30px",
    position: "relative",
    fontSize: "75%",
    fontWeight: "bold",
  };

  return (
    <div id="Nav">
      {/*We launched in beta on abc de, 2021. Thanks for joining!*/}
      <a href="/nfthome"><div id="TopBanner" style={TopBannerStyle}>
        Let us know your questions and feedback in the blue chatbox!
      </div></a>
      <div id="NavInner">
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
          <div className="page-title-sub center">Donate contactless from anywhere to anyone.</div>            
        </header>

        <div
          className={`hero ${
            LONG_HEADER_PAGE.includes(url) ? "" : "shortened"
          }`}
        ></div>
      </div>
    </div>
  );
});
