import React, { useState } from "react";

import POPUP from "constants/Popup.constants";

import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  const [fields, setFields] = useState(fusedData.itemData);

  const onChange = (value, field) =>
    setFields(fields => ({ ...fields, [field]: value.toString() }));

  return (
    <div>
      <div className="popup-content">
        <div className="col-12 mb-25 center container">
          <div>
            <p>
              <b>Amount to be withdrawn (approx.)</b>
            </p>
            {props.caller === POPUP.WITHDRAWAL ? (
              <div className="border-box green">
                {fusedData.affectedExtended.balance == null
                  ? "Loading"
                  : fusedData.affectedExtended.balance / utils.MI + " MIOTA"}
              </div>
            ) : (
              <div className="border-box green">
                {fusedData.fiatAmountSum == null
                  ? "Loading"
                  : fusedData.fiatAmountSum / 100 + " " + utils.getCrncySign()}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 mb-25 center container">
          <div>
            <p className="left">
              Enter one of you external IOTA address where the amount should be
              sent
            </p>
            <div className="border-box green">
              <input
                placeholder={"IOTA Adress"}
                type="text"
                value={fields.landingAddress || ""}
                onChange={(e) => onChange(e.target.value, "landingAddress")}
                className="custom-forms-input-line"
              />
            </div>
          </div>
        </div>

        <div className="col-12 mb-25 center container">
          <div className="center">
            {props.caller === POPUP.WITHDRAWAL_VIEW
              ? "You need to find the affected person and deliver this withdrawal within a week or send it back."
              : "You need to deliver your campaign project within a week."}
          </div>
          <div className="popup-btn-wrapper">
            <div
              href="#"
              className="button solid-btn"
              onClick={() =>
                props.withdraw({
                  affected_id: fusedData.affected_id,
                  landingAddress: fields.landingAddress,
                  affectedBalance: fusedData.affectedExtended.balance,
                })
              }
            >
              <i className="fas fa-donate"></i>Withdraw
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
