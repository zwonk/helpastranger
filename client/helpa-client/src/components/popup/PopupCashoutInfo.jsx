import React from "react";

import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  return (
    <div>
      <div>
        <div>
          <div>
            {!fusedData.itemData.sendback
              ? `Cashout from: ${fusedData.createdDate}`
              : `Cashout sendback at: ${fusedData.sendbackCreatedDate}`}
          </div>
          <div>
            {!fusedData.itemData.txhash ||
            (fusedData.itemData.sendback &&
              !fusedData.itemData.sendback_txhash) ? (
              <div className="line-align">
                {!fusedData.itemData.sendback
                  ? `Sendback transaction still processing...`
                  : `Transaction still processing...`}
              </div>
            ) : (
              <small>
                Track{" "}
                <a
                  className="text-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={fusedData.sendbackTxlink || fusedData.txlink}
                >
                  your transaction
                </a>{" "}
                in the iota network.
              </small>
            )}
          </div>
          <hr />
        </div>

        {!fusedData.itemData.txhash ||
        (fusedData.itemData.sendback && !fusedData.itemData.sendback_txhash) ? (
          <div className="center">
            <div>
              <img alt="spinner" width="200" src="/img/spinner.svg" />
            </div>
          </div>
        ) : (
          <div>
            <div className="col-12 mb-25 center container">
              <div>
                <p>
                  <b>
                    Amount{" "}
                    {!fusedData.itemData.sendback
                      ? `delivered in cashout`
                      : `sent back to beneficiary`}{" "}
                  </b>
                </p>
                <div className="border-box green">
                  {utils.formatBalance(fusedData.itemData.fiat_amount)}
                </div>
              </div>
            </div>
          
            <hr />

            {!fusedData.itemData.sendback ? (
              <div className="col-12 mb-25 center container">
                <div className="popup-btn-wrapper">
                  <div className="center">
                    Couldn't deliver the cash? No problem.
                  </div>
                  <div
                    href="#"
                    className="button solid-btn"
                    onClick={() => props.startSendBack()}
                  >
                    <i className="fas fa-donate"></i>Send back
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
    </div>
  );
};
