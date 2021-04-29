import React from "react";
import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  const offline = !fusedData.affected_id; //TODO choose a better offline detection

  return (
    <div>
      {!fusedData.pending ? (
        <div>
          <div className="center">
            {fusedData.affectedData.name || "Beneficiary"} received{" "}
            {fusedData.donation.txdonationfree ? (
              <span>
                <span role="img" aria-label={"emoji_heart"}>
                  ❤️
                </span>
                {fusedData.donation.txamount ? (
                  <b>
                    {" + " +
                      utils.formatBalanceKIota(fusedData.donation.txamount)}
                  </b>
                ) : (
                  ""
                )}
              </span>
            ) : (
              <span>
                {" "}
                your donation of{" "}
                <b>{utils.formatBalanceKIota(fusedData.donation.txamount)}</b>
              </span>
            )}
            {utils.formatBalanceOptional(fusedData.donation.txfiatamount)}
          </div>
          <div className="center">
            {!fusedData.donation.txhash ? (
              <div className="line-align">
                <img alt="spinner" width="20" src="/img/spinner.svg" />
                <div>
                  <small>Loading the transaction hash. (~10 sec)</small>
                </div>
              </div>
            ) : (
              <small>
                Track{" "}
                <a
                  className="text-btn"
                  rel="noopener noreferrer"
                  target="_blank"
                  href={fusedData.datatxlink}
                >
                  your transaction
                </a>{" "}
                in the iota network.
              </small>
            )}
          </div>
          <br />
        </div>
      ) : (
        <div className="center">
          <div className="video-container">
            <video
              width="80%"
              src="/img/anim-transaction.mov"
              autoPlay
              loop
              muted
              playsInline
              poster="/img/spinner.svg"
              alt="donation-processing"
            />
          </div>
          <div>
            <h3 className="">
              {offline
                ? "Waiting for connection. Please keep this open"
                : "Transaction is processing."}
            </h3>
          </div>
          <div>
            <div>
              <p className="">Takes a couple of seconds...</p>
            </div>
            <div
              className="button border-btn"
              onClick={() => {
                offline ? props.close() : props.save();
              }}
            >
              {offline ? "Save and Scan another one" : "Save for later"}
            </div>
          </div>
        </div>
      )}
      <div className={fusedData.pending ? "hide" : "video-container"}>
        <video
          width="80%"
          src="/img/anim-donated.mov"
          autoPlay
          loop
          muted
          playsInline
          poster="/img/anim-donated.jpg"
          alt="donation-finished"
        />
      </div>
      <div className="col-12 mb-25 center container">
        {props.account && props.signform && !fusedData.pending ? (
          !utils.getCachedUsersId() ? (
            <div className="popup-btn-wrapper">
              <div
                href="#"
                className="button border-btn"
                onClick={() => props.signform()}
              >
                Sign up to donate more
              </div>
              {/*<div><a className="text-btn danger" href="#">This is not Joe? Report a problem.</a></div>*/}
            </div>
          ) : (
            <div className="popup-btn-wrapper">
              <div
                href="#"
                className="button border-btn"
                onClick={() => props.account()}
              >
                Go to your account <i className="fas fa-arrow-circle-right"></i>
              </div>
              {/*<div><a className="text-btn danger" href="#">This is not Joe? Report a problem.</a></div>*/}
            </div>
          )
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
