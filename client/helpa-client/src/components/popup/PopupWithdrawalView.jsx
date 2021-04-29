import React from "react";

import Functions from "functions/FunctionsMain";
import utils from "functions/utils/utils";

import AffectedLocationHistory from "components/dumb/AffectedInfo/AffectedInfoLocationHistory";

export default (props) => {
  const fusedData = props.fusedData;

  return (
    <div>
      <div className="popup-content">
        {fusedData.pending ? (
          <div className="center mb-25">
            <div>
              <img alt="spinner" width="200" src="/img/spinner.svg" />
            </div>
            <div>
              <h3 className="">Withdrawal is processing</h3>
            </div>
          </div>
        ) : (
          <div>
            <div>
              <div>Withdrawal from: {fusedData.createdDate}</div>
              <div>
                {!fusedData.itemData.txhash ? (
                  <div className="line-align">
                    Transaction still processing...
                  </div>
                ) : (
                  <small>
                    Track{" "}
                    <a
                      className="text-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={fusedData.txlink}
                    >
                      your transaction
                    </a>{" "}
                    in the iota network.
                  </small>
                )}
              </div>
              <hr />
            </div>

            {!fusedData.itemData.txhash ? (
              ""
            ) : (
              <div>
                <div className="col-12 mb-25 center container">
                  <div>
                    <p>
                      <b>Amount to deliver in cash</b>
                    </p>
                    <div className="border-box green">
                      {fusedData.itemData.fiat_amount / 100 +
                        " " +
                        utils.getCrncySign()}
                    </div>
                  </div>
                </div>

                <div className="col-12 mb-25 center container">
                  <div
                    onClick={() =>
                      Functions.copyToClipboard(
                        fusedData.itemData.landing_address
                      )
                    }
                  >
                    <p className="left">
                      This was your IOTA address that received the funds.
                    </p>
                    <div className="border-box sub-field green">
                      <div className="small black-text">
                        {fusedData.itemData.landing_address
                          ? fusedData.itemData.landing_address.substring(
                              0,
                              30
                            ) + "..."
                          : ""}
                      </div>
                      <div className="small">Copy by clicking</div>
                    </div>
                  </div>
                </div>

                <AffectedLocationHistory
                  affectedData={fusedData.affectedData}
                  locations={fusedData.affectedLocations}
                  caller={props.caller}
                />

                <div className="col-12 mb-25 center container">
                  <div className="popup-btn-wrapper">
                    <div className="center">
                      You need to deliver this withdrawal within a week or send
                      back.
                    </div>
                    <div
                      href="#"
                      className="button solid-btn"
                      onClick={() => props.deliver()}
                    >
                      <i className="fas fa-donate"></i>Confirm delivery
                    </div>
                  </div>
                </div>

                <hr />

                <div className="col-12 mb-25 center container">
                  <div className="popup-btn-wrapper">
                    <div className="center">
                      No time to deliver? No worries!
                    </div>
                    <div
                      href="#"
                      className="button solid-btn"
                      onClick={() => props.sendBack()}
                    >
                      <i className="fas fa-donate"></i>Send back
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
