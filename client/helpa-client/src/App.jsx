import React, { useEffect } from "react";
import "./css/App.scss";
import "./css/App.responsive.scss";
import "./css/FlippingCounter.scss";

import { useSelector } from "react-redux";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { withRouter } from "react-router-dom";
import { Redirect } from "react-router";

import axios from "axios";

import Nav from "components/app/Nav";
import Footer from "components/app/Footer";
import ModalDispatcher from "components/app/ModalDispatcher";
import PopupDispatcher from "components/app/PopupDispatcher";
import SignIn from "components/app/SignIn";
import Home from "components/views/Home";
import Account from "components/views/Account";
import About from "components/views/About";
import Imprint from "components/views/Imprint";
import Faq from "components/views/Faq";
import Contact from "components/views/Contact";
import Terms from "components/views/Terms";
import Admin from "components/views/Admin";


import Functions from "functions/FunctionsMain";
import utils from "functions/utils/utils";

import { addHomeViewData } from "reducers/slices/homeViewDataSlice";
import store from "reducers/store";

//TODO implement custom console logger
if (process.env.NODE_ENV === "production") {
  console.log = function () {};
}

export default () => {
  const popup = useSelector((state) => state.popup.popup);
  const redirect = useSelector(state => state.popup.redirect);
  const bottomPopupState = useSelector(state => state.popup.bottomPopupState);
  const users_id = useSelector((state) => state.auth.users_id);

  /* block body scroll on popup */
  if (popup.size > 0 && popup.last() !== null) {
    document.body.classList.add("non-scrolling");
  } else {
    document.body.classList.remove("non-scrolling");
  }

  useEffect(() => {
      axios.get('https://ipapi.co/json/').then((response) => {
          let data = response.data;
          const {latitude, longitude} = data
          store.dispatch(addHomeViewData({userLocation: [latitude, longitude]}));
          if(!localStorage.getItem("crncy")){
            utils.setCrncy(data.currency);
          }
      }).catch((error) => {
      });
  }, [])

  return (
    <div>
      <Router>
        {redirect != null ? <Redirect to={redirect || "/"} /> : ""}
        <div>
          <Nav users_id={users_id} />
          <ModalDispatcher />
          <PopupDispatcher />
          <Switch>
            <Route path="/administratorview">
              <Admin />
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/imprint">
              <Imprint />
            </Route>
            <Route path="/faq">
              <Faq />
            </Route>
            <Route path="/contact">
              <Contact />
            </Route>
            <Route path="/terms">
              <Terms />
            </Route>
            <Route path="/signout">
              <SignOut />
            </Route>
            <Route path="/signin">
              <SignIn />
              <Home />
            </Route>
            <Route path="/account">
              <Account />
            </Route>
            <Route path="/location_spammer/:q">
              <LocationSpammer />
            </Route>
            <Route path="/q/:q">
              <Home />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
            <Route component={NotFound} />
          </Switch>
          <BottomPopup bottomPopupState={bottomPopupState} />
          <Footer />
        </div>
      </Router>
    </div>
  );
};

const  NotFound = () => {
  return <div id="NotFoundPage">
  <br />
  <div className="mb-25">
    <p className="center">404 - Page Not Found. Sorry.</p>
  </div>
  </div>
}

const SignOut = () => {
  if(window.location !== "/"){
    Functions.signOut();
    window.location = "/"
  }
  console.log("Signout")
  return null;
}

const linkTerms = Functions.generateHref({
  text: "terms",
  link: "/terms",
});

const BottomPopup = (props) => {
  return <div id="BottomPopup" className={props.bottomPopupState ? "hide" : ""}>
    <div className="container">
    <small>We do not track you nor use cookies. However, we use third-party services that might do it. By using our platform you agree to their {linkTerms}.</small>
    <div className="bottomPopupButtonWrapper">
      <div className="button solid-btn blackwhite"
            onClick={() => Functions.setBottomPopupState(1)}
        >
        Okay.
      </div>
    <div className="bottomPopupCloser first small button"
          onClick={() => Functions.setBottomPopupState(1)}
      >
       <i className="fas fa-times"></i>
    </div>
    
      </div>
    </div>
  </div>
}


const LocationSpammer = withRouter((props) => {
  const amount = props.match.params.q;
  Functions.location_spammer(amount)
  return null;
})