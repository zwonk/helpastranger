import React from "react";

import POPUP from "constants/Popup.constants";
import utils from "functions/utils/utils";

export default (props) => {
  const {
    title,
    name,
    tab,
    caller,
    startDonation,
    startRecurrent,
    startCampaign,
    deleteEntry,
    report,
  } = props.props;
  return (
    <div className="affected-donate-buttons">
      <div className="col-12 mb-25 center container">
        <div className="popup-btn-wrapper">
          <div
            href="#"
            className="button solid-btn"
            onClick={() => startDonation()}
          >
            <i className="fas fa-donate"></i>
            {tab === "saved" || caller === POPUP.HOME_MAP_AFFECTED_INFO
              ? "Start Donation"
              : "Re-donate"}
          </div>
          {tab === "saved" || caller === POPUP.HOME_MAP_AFFECTED_INFO ? (
            ""
          ) : utils.ROLLOUT_RECURRENTS ? (
            <div
              href="#"
              className="button border-btn"
              onClick={() => startRecurrent()}
            >
              Make recurrent
            </div>
          ) : (
            ""
          )}
          {tab !== "saved" || caller === POPUP.QR_INFO ? (
            ""
          ) : (
            <div
              href="#"
              className="button border-btn"
              onClick={() => deleteEntry()}
            >
              Delete
            </div>
          )}
          {!title && utils.ROLLOUT_CAMPAIGNS ? (
            <div
              href="#"
              className="button border-btn"
              onClick={() => startCampaign()}
            >
              Start Campaign
            </div>
          ) : (
            ""
          )}
          <div className="button">
            <span className="text-btn danger" onClick={() => report()}>
              This was not {name ? name : "them"}? Report a problem.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
