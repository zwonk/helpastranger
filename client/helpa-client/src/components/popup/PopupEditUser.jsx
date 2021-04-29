import React, { useEffect, useState } from "react";

import PS from "constants/PopupStatus.constants";
import utils from "functions/utils/utils";

export default (props) => {

  const fusedData = props.fusedData;

  const join = (x) => (x.email || "") + (x.real_name || "") + (x.address || "") + (x.phone || "")
   + (x.username || "") + (x.passw || "") + (x.new_passw || "") + (x.new_passw2 || "")  ;
   
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState({}); //TODO check
  const [fieldsInit, setFieldsInit] = useState({}); //TODO check
  const [passwValid1, setPasswValid1] = useState(null);
  const [passwValid2, setPasswValid2] = useState(null);

  //fields hook

  const onChange = (value, field) => 
    setFields(fields => ({ ...fields, [field]: value }));

  useEffect(() => {
      setFields(fusedData.accountViewData.ACCOUNT_SETTINGS)
      setFieldsInit(fusedData.accountViewData.ACCOUNT_SETTINGS)
    }, [fusedData.accountViewData.ACCOUNT_SETTINGS])

  useEffect(() => {
    const value = fields.new_passw;

    let passwValid1 = null;
    let passwValid2 = null;

    if(value){
      passwValid1 = value.length > 7;
      passwValid2 = utils.handlePassw(value) ? true : false;
    }

    if (passwValid1 !== null || passwValid2 !== null) {
      setPasswValid1(passwValid1);
      setPasswValid2(passwValid2);
    }
  }, [fields.new_passw])

  const onSubmit = (fields) => {
    const infosChanged = join(fieldsInit) !== join(fields)
    if (editMode && infosChanged){
      const fieldsFilled = {};

      for(let [key, val] of Object.entries(fields)){
        if(fields[key] != null && (fields[key] !== fieldsInit[key]))
            fieldsFilled[key] = val;
      }

      props.onSubmit(fieldsFilled);
    }
    setEditMode(editMode => !editMode);
  };

  const nextStep = (fields) => {
    const infosChanged = join(fieldsInit) !== join(fields)
    if(infosChanged) props.onSubmit(fields)
    props.startMembershipApplySubmit(fields)
  }
  
  const fieldsLoaded = Object.keys(fields).length > 0
  const infosChanged = join(fieldsInit) !== join(fields)
  const allFilled = fields.email && fields.real_name && fields.address && fields.phone

  return (
    <div>
      <div className="popup-content">

        {(!fieldsLoaded || fusedData.pending) ? "Loading" : 

        !editMode ? (
          <div>
            {!props.startMembershipApplySubmit ? 
              (<div>
                <div>
                  <b>Username: {fields.username}</b>
                </div>
                <div>Password: </div>
                <hr />
              </div>) : ""
            }
            <div>Email: {fields.email}</div>
            <div>Legal name: {fields.real_name}</div>
            <div>Address: {fields.address}</div>
            <div>Phone: {fields.phone}</div>
          </div>
        ) : (
          <div>
          {!props.startMembershipApplySubmit ? 
            (<div>
              <div><input
                type="text"
                placeholder={"Username"}
                onChange={(e) => onChange(e.target.value, "username")}
                value={fields.username || ""}
                className="form-control"
              /></div>
              <hr />
              <div><input
                type="password"
                placeholder={"Current Password"}
                onChange={(e) => onChange(e.target.value, "passw")}
                value={fields.passw || ""}
                className="form-control"
              /></div>
              <div><input
                type="password"
                placeholder={"New Password"}
                onChange={(e) => onChange(e.target.value, "new_passw")}
                value={fields.new_passw || ""}
                className="form-control"
              /></div>
              <div><input
                type="password"
                placeholder={"Repeat Password"}
                onChange={(e) => onChange(e.target.value, "new_passw2")}
                value={fields.new_passw2 || ""}
                className="form-control"
              /></div>

              {fields.new_passw ? (
              <div>
                <div className="hr-empty"></div>
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
              </div>) : ""}
              
              <hr />
            </div>) : ""}

        
            <textarea
              type="text"
              placeholder={"Email"}
              onChange={(e) => onChange(e.target.value, "email")}
              value={fields.email || ""}
              className="form-control"
            />
            <textarea
              type="text"
              placeholder={"Legal Name"}
              onChange={(e) => onChange(e.target.value, "real_name")}
              value={fields.real_name || ""}
              className="form-control"
            />
            <textarea
              type="text"
              placeholder={"Address"}
              onChange={(e) => onChange(e.target.value, "address")}
              value={fields.address || ""}
              className="form-control"
            />
            <textarea
              type="text"
              placeholder={"Phone"}
              onChange={(e) => onChange(e.target.value, "phone")}
              value={fields.phone || ""}
              className="form-control"
            />
          </div>
          )}

        <div className="mb-25">
          <div className="mb-12"></div>
          <small>Security note: All data is stored fully encrypted. <i className="green far fa-check-circle"></i></small>
          <div><span className="text-btn" onClick={() => onSubmit(fields)}>
            {!editMode ? "Edit these infos" : infosChanged ? "Save changes" : "View infos"}
          </span></div>
        </div>
        <hr />

        {props.startMembershipApplySubmit ? 
          (<div className="mb-25">
            <div className="popup-btn-wrapper">
              <div
                className={`button border-btn right ${allFilled ? "" : "inactive"}`}
                onClick={() => allFilled ? nextStep(fields) : props.modal(["All fields must be filled out", PS.RED])}
              >
                Next step <i className="fas fa-arrow-circle-right"></i>
              </div>
          </div>
        </div>) : ""
      }
      </div>
    </div>
  );
};
