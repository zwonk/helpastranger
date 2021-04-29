import React from "react";

import utils from "functions/utils/utils";
import Functions from "functions/FunctionsMain";

export default (props) => {
  const fusedData = props.fusedData;

  return (
    <div>
      <div className="popup-content">
        <div className="col-12 mb-25 center container">
          <div>
            <p>
              <b>Amount to transfer</b>
            </p>
            <div className="border-box green">
              {fusedData.itemData.amount / utils.MI + " MIOTA"}
            </div>
          </div>
        </div>

        <div className="col-12 mb-25 center container">
          <div
            onClick={() =>
              Functions.copyToClipboard(fusedData.affectedExtended.publicKey)
            }
          >
            <p className="left">This is the IOTA address to send funds to</p>
            <div className="border-box sub-field green">
              <div className="small black-text">
                {fusedData.affectedExtended.publicKey
                  ? fusedData.affectedExtended.publicKey.substring(0, 30) +
                    "..."
                  : "Loading"}
              </div>
              <div className="small">Copy by clicking</div>
            </div>
          </div>
        </div>

        <div className="col-12 mb-25 center container">
          <div className="popup-btn-wrapper">
            <div className="center">
              You need to send this withdrawal within a week or you loose your
              member status.
            </div>
            <div className="button">
              <span className="text-btn danger" onClick={() => props.report()}>
                Too complicated? Ask for help.
              </span>
            </div>
          </div>
        </div>

        <hr />
      </div>
    </div>
  );
};
