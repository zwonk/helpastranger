import React, { useState } from "react";

import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";
import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  const [fields, setFields] = useState(fusedData.itemData);

  const onChange = (value, field) =>
    setFields((fields) => ({ ...fields, [field]: value.toString() }));

  return (
    <div>
      <div className="popup-content">
        <div className="col-12 mb-25 center container">
          <div>
            <p>
              <b>
                Amount to withdraw
                <br />
                (max{" "}
                {utils.formatBalance(
                  fusedData.accountViewData.ACCOUNT_DETAILS.userDataBalance,
                  "fiat_balance"
                )}{" "}
                )
              </b>
            </p>
            <input
              placeholder={"Withdrawal amount in " + utils.getCrncySign()}
              type="text"
              value={fields.fiatAmount || ""}
              onChange={(e) => onChange(e.target.value, "fiatAmount")}
              className="custom-forms-input-line forms-input-large"
            />
          </div>
          <small>
            <small>
              If the remaining amount is smaller than 1 MIOTA we add that remaining amount to the withdrawal.
              </small>
            </small>
        </div>

        <div className="col-12 mb-25 center container">
          <div>
            <p className="left">
              Enter one of you external IOTA addresses that the amount should be
              sent to. Don't have one? Create it{" "}
              <span
                className="text-btn"
                onClick={() => Functions.popup(POPUP.TUT_IOTA_EXTERNAL_ACCOUNT)}
              >
                here
              </span>
              .
            </p>
            <div className="border-box green">
              <input
                placeholder={"IOTA Address"}
                type="text"
                value={fields.landingAddress || ""}
                onChange={(e) => onChange(e.target.value, "landingAddress")}
                className="custom-forms-input-line forms-input-large"
              />
            </div>
          </div>
        </div>

        <div className="col-12 mb-25 center container">
          <div className="center">
            The corresponding iota amount will be with you in seconds.
          </div>
          <div className="popup-btn-wrapper">
            <div
              href="#"
              className="button solid-btn"
              onClick={() =>
                props.withdraws({
                  landingAddress: fields.landingAddress,
                  fiatAmount: fields.fiatAmount,
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
