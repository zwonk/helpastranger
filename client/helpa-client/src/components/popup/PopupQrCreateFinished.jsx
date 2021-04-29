import React, { useState } from "react";

import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  const [printState, setPrintState] = useState(0);

  return (
    <div>
      {!fusedData.pending ? (
        <div className="center">
          <div>
            {!fusedData.qrBlobMerged ? (
              ""
            ) : (
              <div>
                <span
                  className="text-btn normal"
                  onClick={() => {
                    setPrintState(1);
                    utils.print(fusedData.qrBlobMerged.big, () =>
                      setPrintState(0)
                    );
                  }}
                >
                  Print them now
                </span>

                {printState ? (
                  <div className="line-align center">
                    <img alt="spinner" width="20" src="/img/spinner.svg" />
                    <div>
                      <small>
                        Generating PDF ~
                        {utils.pdfGenerationEstimate(
                          fusedData.qrBlobMerged
                            ? fusedData.qrBlobMerged.count
                            : 1
                        )}
                        s
                      </small>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            )}
          </div>
          <div>
            {fusedData.qrBlobMerged ? (
              <img
                alt="qr_codes"
                width="50%"
                src={fusedData.qrBlobMerged.small}
              />
            ) : (
              <img
                alt="spinner"
                id="qr_code"
                width="200"
                src="/img/spinner.svg"
              />
            )}
          </div>
          <div className="qr_codes_bottom_title">
            <div>Your QR codes are ready!</div>
          </div>
        </div>
      ) : (
        <div className="center">
          <div>
            <img
              alt="spinner"
              id="qr_code"
              width="200"
              src="/img/spinner.svg"
            />
          </div>
          <div>
            <h3 className="">QR codes in creation</h3>
            <small>
              Might take several seconds because the QR codes represent keys
              that are based on advanced cryptography.
            </small>
          </div>
        </div>
      )}
      <div className="col-12 mb-25 container">
        {!fusedData.pending ? (
          !utils.getCachedUsersId() && props.signform ? (
            <div className="popup-btn-wrapper qr-finished-view">
              <div
                href="#"
                className="button border-btn"
                onClick={() => props.signform()}
              >
                Sign up to save them
              </div>
            </div>
          ) : props.save ? (
            <div className="popup-btn-wrapper qr-finished-view">
              <div
                href="#"
                className="button border-btn"
                onClick={() => props.save()}
              >
                Save for later
              </div>
            </div>
          ) : (
            ""
          )
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
