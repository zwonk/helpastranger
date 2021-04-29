import React, { useState } from "react";

export default (props) => {

  const fusedData = props.fusedData;

  //TODO check loader if !fields in render
  const [fields, setFields] = useState(fusedData.accountViewData.ACCOUNT_SETTINGS || {});

  const onChange = (value, field) => 
    setFields(fields => ({ ...fields, [field]: value }));

  const onSubmit = (fields) => {
    if(fields.motivation)
        props.membershipApply(fields)
  };

  const allFilled = fields.motivation

  return (
    <div>
      <div className="popup-content">
        <div>
          <div>Email: {fields.email}</div>
          <div>Legal name: {fields.real_name}</div>
          <div>Address: {fields.address}</div>
          <div>Phone: {fields.phone}</div>
        </div>
        <hr />

        <div className="popup-apply-meme mb-25">
          <img src="/img/reason-meme.jpg" alt="reason-meme"></img>
        </div>

        <div>
          <textarea
            type="text"
            placeholder={"Motivation"}
            onChange={(e) => onChange(e.target.value, "motivation")}
            value={fields.motivation || ""}
            className="form-control"
          />
        </div>

        <div>
          <small>
            By applying you are agreeing to grant us access to the previously
            filled out user information as well as current transaction
            statistics in order to make a decision on membership.
          </small>
        </div>
        <div className="popup-btn-wrapper mb-25">
          <div
            className={`button solid-btn ${allFilled ? "" : "inactive"}`}
            onClick={() => (allFilled ? onSubmit(fields) : "")}
          >
            <i className="fas fa-donate"></i>Apply
          </div>
        </div>
      </div>
    </div>
  );
};
