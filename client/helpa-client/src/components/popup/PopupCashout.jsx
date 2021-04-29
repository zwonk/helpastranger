import React from "react";

import PS from "constants/PopupStatus.constants";
import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  const onSubmit = async () => {
    let gps;

    if (navigator.geolocation) {
      gps = (async () =>
        new Promise(function (resolve, reject) {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => resolve(null)
          );
        }))();
    }

    if (!gps) props.modal(["You need to enable GPS once to cashout.", PS.RED]);

    props.cashout({
      affected_id: fusedData.affected_id,
      gps,
    });
  };

  return (
    <div>
      <div>
        <div>
          Cashouts act as a way to exchange donations to cash. You deliver the
          shown amount in cash to the beneficiary and get refunded in iota to
          your account. We require your GPS data to verify you have been around
          the beneficiary's location.
        </div>
      </div>
      <hr />

      <div className="col-12 mb-25 center container">
        <div>
          <p>
            <b>Amount to deliver in cash</b>
          </p>
          <div className="border-box green">
            {utils.formatBalance(fusedData.affectedExtended.fiatBalance)}
          </div>
        </div>
      </div>

      <div className="video-container">
        <video
          width="80%"
          className="video-container-cashout"
          autoPlay
          loop
          muted
          playsInline
          poster="/img/spinner.svg"
          alt="person delivering cash"
        >
          <source src="/img/anim-cashout.mov" type="video/mp4" />
        </video>
      </div>

      <hr />

      <div className="col-12 mb-25 center container">
        <div className="popup-btn-wrapper">
          <div className="center">
            Only cash out if you are delivering the money at the spot!
          </div>
          <div href="#" className="button solid-btn" onClick={() => onSubmit()}>
            <i className="fas fa-donate"></i>Confirm cashout
          </div>
        </div>
      </div>
    </div>
  );
};
