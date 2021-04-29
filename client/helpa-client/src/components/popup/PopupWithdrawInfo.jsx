import React from "react";

import utils from "functions/utils/utils";
import Functions from "functions/FunctionsMain";

export default (props) => {
  const fusedData = props.fusedData;

  return (
    <div>
      <div className="popup-content">
        {fusedData.pending ? (
          <div className="center">
            <div>
              <img alt="spinner" width="200" src="/img/spinner.svg" />
            </div>
            <div>
              <h3 className="mb-25">Withdrawal is processing</h3>
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
                      <b>Amount received in iotas</b>
                    </p>
                    <div className="border-box green">
                      {fusedData.itemData.amount / utils.MI + " MI"}
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
                              20 /* TODO dynamic length */
                            ) + "..."
                          : ""}
                      </div>
                      <div className="small">Copy by clicking</div>
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
