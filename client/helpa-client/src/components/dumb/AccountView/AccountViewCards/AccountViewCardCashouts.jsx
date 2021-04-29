import React from "react";

import Functions from "functions/FunctionsMain";
import POPUP from "constants/Popup.constants";
import utils from "functions/utils/utils";

const BLUE = "DeepSkyBlue",
  RED = "red",
  GREEN = "limegreen",
  ORANGE = "orange";

export function deriveTabForCashouts(itemData) {
  const { sendback, sendback_txhash, sendback_error, txhash, error } = itemData;
  const headerText = (
    <div>
      <p className="left">
        When you{" "}
        <span
          className="text-btn"
          onClick={() => Functions.popup(POPUP.TUT_CASHOUT)}
        >
          cashout
        </span>{" "}
        for a person it means you bring him his account balance in cash and
        immediately get refundend in iota. You can also revert mistakes with a
        "send back".
      </p>
    </div>
  );

  let tab = "Cashout received";
  let color = GREEN;

  if (!sendback && error && error !== utils.NO_ERROR) {
    tab = "Cashout Error";
    color = RED;
  } else if (sendback && sendback_error && sendback_error !== utils.NO_ERROR) {
    tab = "Sendback Error";
    color = RED;
  } else if (!txhash) {
    tab = "Processing";
    color = ORANGE;
  } else if (sendback && !sendback_txhash) {
    tab = "Sendback Processing";
    color = ORANGE;
  } else if (sendback && sendback_txhash) {
    tab = "Sent back to beneficiary";
    color = BLUE;
  }
  return { tab, color, headerText };
}
export function AffectedCardLeftCashouts(props) {
  const itemData = props.itemData;

  const { fiat_amount, crncy } = itemData;
  let tab = deriveTabForCashouts(itemData);

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
export function AffectedCardRightCashouts(props) {
  const itemData = props.itemData;
  let tab = deriveTabForCashouts(itemData);

  return (
    <div
      className="card-content right blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center small">{tab.tab}</div>
    </div>
  );
}
