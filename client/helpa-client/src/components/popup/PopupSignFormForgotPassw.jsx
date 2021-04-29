import React, { useState } from "react";
import { useSelector } from "react-redux";

import Functions from "functions/FunctionsMain";
import PS from "constants/PopupStatus.constants";

export default (props) => {
  const popup = useSelector(state => state.popup);

  const [form, setForm] = useState({});
  
  const formChange = (name, value) => {
    setForm({[name]: value})
  };
   
  const allFilled = form.username && form.username.includes("@");

  const link1 = Functions.generateHref({
    text: "FAQ",
    link: "/faq#faq-question-6EE554A0-8BBF",
  });

  return (
    <div>
      <form>
        <div className="form-group">
          <label htmlFor="exampleInputUsername1">User Email</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={(e) => formChange("username", e.target.value)}
            className="form-control"
            id="exampleInputUsername1"
            aria-describedby="usernameHelp"
            placeholder="example@mail.com"
          />
        </div>
        <div className="small">
          If you had provided your e-mail in your account, we'll send you a new
          password to that address which you will use for your next login.
          Otherwise check the {link1}.
        </div>

        <div className="popup-btn-wrapper mb-25">
          <hr />
          <div
            className={`button solid-btn ${
              allFilled && !popup.pending ? "" : "inactive"
            }`}
            onClick={
              allFilled
                ? () => props.sendPassw(form.username)
                : () => props.modal(["Fill out the required field.", PS.RED])
            }
          >
            {!popup.pending ? (
              <span>
                Recover password <i className="fas fa-arrow-circle-right"></i>
              </span>
            ) : (
              <span className="spinner-fix">
                Processing... <i className="fas fa-spinner fa-spin"></i>
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
