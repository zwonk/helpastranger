import React, { useState } from "react";
import { useSelector } from "react-redux";

import utils from "functions/utils/utils";

export default (props) => {
  const auth = useSelector(state => state.auth); // state.main.data)

  const [signUpPage, setSignUpPage] = useState(auth.signUpPage)

  const [form, setForm] = useState({
    username: process.env.REACT_APP_DEV === "false" ? "" : "tester",
    passw: process.env.REACT_APP_DEV === "false" ? "" : "TesterTester",
    agb: false,
  });
  const [passwValid1, setPasswValid1] = useState(null);
  const [passwValid2, setPasswValid2] = useState(null);

  const formChange = (name, e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    let passwValid1 = null;
    let passwValid2 = null;

    if (name === "passw") {
      passwValid1 = value.length > 7;
      passwValid2 = utils.handlePassw(value) ? true : false;
    }

    if (passwValid1 !== null || passwValid2 !== null) {
      setPasswValid1(passwValid1);
      setPasswValid2(passwValid2);
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    } else {
      setForm(prevForm => ({...prevForm, [name]: value}))
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      signUpPage ? props.signup(form) : props.signin(form)
  }}

  return (
    <div>
      {(auth.users_id && utils.getCachedUsersId()) ? <div className="mb-25">
        Already signed in
        <div><a className="text-btn" href="/signout">Sign out</a></div>
        </div> :
     (<form>
        <div className="form-group">
          <label htmlFor="exampleInputUsername1">Username</label>
          <span className="red">
            <small>
              {!auth.errors.username ? "" : ` ${auth.errors.username}` || ""}
            </small>
          </span>
          <input
            type="username"
            name="username"
            value={form.username}
            onChange={(e) => formChange("username", e)}
            className="form-control"
            id="exampleInputUsername1"
            aria-describedby="usernameHelp"
          />
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputPassword1">Password</label>{" "}
          <span className="red">
            {!auth.errors.passw ? "" : ` ${auth.errors.passw}` || ""}
          </span>
          <input
            type="password"
            name="passw"
            value={form.passw}
            onChange={(e) => formChange("passw", e)}
            className="form-control"
            id="exampleInputPassword1"
            onKeyDown={handleFormKeyDown}
          />
          {auth.errors && auth.errors.passw ? (
            <div>
              <div>
                {passwValid1 ? (
                  <i className="fas fa-check green"></i>
                ) : (
                  <i className="fas fa-times red"></i>
                )}{" "}
                Needs to be 8+ characters long
              </div>
              <div>
                {passwValid2 ? (
                  <i className="fas fa-check green"></i>
                ) : (
                  <i className="fas fa-times red"></i>
                )}{" "}
                Needs to have lower and upper case chars or numbers.
              </div>
            </div>
          ) : (
            ""
          )}
          {!signUpPage ? (
            <div className="form-group sub-text">
              <span className="text-btn" onClick={() => props.startForgotPassw()}>Forgot password?</span>
            </div>
          ) : (
            <div className="form-check sub-text">
              <input
                type="checkbox"
                name="agb"
                checked={form.agb}
                onChange={(e) => formChange("agb", e)}
                className="form-check-input"
                id="exampleCheck1"
              />
              <label className="form-check-label" htmlFor="exampleCheck1">
                I have read and accept the{" "}
              </label>{" "}
              <span className="text-btn" onClick={() => props.showTerms()}>terms</span>
              <span className="red">
                {!auth.errors ? "" : auth.errors.agb || ""}
              </span>
            </div>
          )}
        </div>

        <div className="popup-btn-wrapper mb-25">
          <div
            className={`button ${!signUpPage ? "solid-btn" : "border-btn left"}`}
            onClick={() =>
              signUpPage ? setSignUpPage((s) => !s) : props.signin(form)
            }
          >
            {!signUpPage ? "" : <i className="fas fa-arrow-circle-left"></i>} Sign in
          </div>
          <hr />
          <div
            className={`button ${signUpPage ? "solid-btn" : "border-btn right"}`}
            onClick={() =>
              signUpPage ? props.signup(form) : setSignUpPage((s) => !s)
            }
          >
            Sign up {signUpPage ? "" : <i className="fas fa-arrow-circle-right"></i>}
          </div>
        </div>
      </form>)}
    </div>
  );
};
