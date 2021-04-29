import React, { useState } from "react";
import VIEWS from "constants/Views.constants";

export default (props) => {
  
  const fusedData = props.fusedData;

  const [fields, setFields] = useState({username: ""});

  const onChange = (value, field) =>
    setFields((data) => ({ ...data, [field]: value }));

  const deleteUser = () => {
    if (
      fusedData.accountViewData[VIEWS.ACCOUNT_SETTINGS]
      && fields["username"] ===
      fusedData.accountViewData[VIEWS.ACCOUNT_SETTINGS].username
    )
      props.deleteUser();
  };

  return (
    <div>
      <div className="popup-content mb-25">
        <div>Type your username to confirm your account deletion.</div>
        <input
          type="text"
          placeholder={"Username"}
          onChange={(e) => onChange(e.target.value, "username")}
          value={fields.username}
          className="form-control"
        />
        <div className="popup-btn-wrapper">
          <div
            href="#"
            className="button border-btn"
            onClick={() => deleteUser()}
          >
            Delete
          </div>
        </div>
      </div>
    </div>
  );
};
