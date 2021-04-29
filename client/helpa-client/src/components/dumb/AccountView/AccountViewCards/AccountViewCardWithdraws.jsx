import React from "react";

import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";
import utils from "functions/utils/utils";

const BLUE = "DeepSkyBlue",
  RED = "red",
  ORANGE = "orange";

export function deriveTabForWithdraws(itemData) {
  const { txhash, error } = itemData;
  const headerText = (
    <div>
      <p className="left">
        Here are all your withdrawals to external accounts.{" "}
        If you withdrew the funds to an exchange, you can then{" "}
        <span
          className="text-btn"
          onClick={() => Functions.popup(POPUP.TUT_IOTA_WITHDRAWAL)}
        >
          withdraw to cash.
        </span>
      </p>
    </div>
  );

  let tab;
  let color = RED;

  if (txhash) {
    tab = "Withdrawn";
    color = BLUE;
  }
  if (!txhash) {
    tab = "Processing";
    color = ORANGE;
  }
  if (error && error !== utils.NO_ERROR) {
    tab = "Error. Try again later.";
    color = RED;
  }
  return { tab, color, headerText };
}
export function AffectedCardLeftWithdraws(props) {
  const itemData = props.itemData;

  const { fiat_amount, crncy } = itemData;
  let tab = deriveTabForWithdraws(itemData);

  return (
    <div
      className="card-content left blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center">
        {fiat_amount / 100} {utils.getCrncySign(crncy)}
      </div>
    </div>
  );
}
export function AffectedCardRightWithdraws(props) {
  const itemData = props.itemData;
  let tab = deriveTabForWithdraws(itemData);

  return (
    <div
      className="card-content right blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center small">{tab.tab}</div>
    </div>
  );
}
export function AffectedCardMidWithdraws(props) {
  const itemData = props.itemData;

  const date = utils.formatDate(itemData, "created_at");

  return (
    <div className="mid-inner">
      <div className="black-text">
        <b>External IOTA Account</b>
      </div>
      <div className="black-text">{date}</div>
      <div className="small">Expand by clicking</div>
    </div>
  );
}
