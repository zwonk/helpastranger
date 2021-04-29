import utils from "functions/utils/utils";
import React from "react";

export default (props) => {
    const fusedData = props.fusedData;

  return (
    <div>
      <div>
        <div>
          Cashout sendbacks will transfer the cashed out amount from your
          account back to{" "}
          {fusedData.affectedData.name || `the beneficiary's account`}{" "}in iota.
          Please make sure the shown amount is available in your account.
        </div>
      </div>
      <hr />

      <div className="col-12 mb-25 center container">
        <div>
          <p>
            <b>Amount to be sent back.</b>
          </p>
          <div className="border-box green">
            {utils.formatBalanceIota(fusedData.itemData.amount)}
          </div>
        </div>
      </div>

      <hr />

      <div className="col-12 mb-25 center container">
        <div className="popup-btn-wrapper">
          <div className="center">
            Only send back if you the amount is available in your account.
          </div>
          <div
            href="#"
            className="button solid-btn"
            onClick={() => props.sendBack()}
          >
            <i className="fas fa-donate"></i>Confirm the auto send-back
          </div>
        </div>
      </div>
    </div>
  );
};
