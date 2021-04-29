import React from "react";

import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";

import utils from "functions/utils/utils";

const BLUE = "DeepSkyBlue",
  RED = "red",
  ORANGE = "orange";

export function deriveTabForDonations(itemData) {
  const { tab } = itemData;
  const headerText = (
    <div>
      <p className="left">
        These are all your executed or saved donations. Donations go directly to
        the beneficiary's IOTA account and are secured by the global{" "}
        <span
          className="text-btn"
          onClick={() => Functions.popup(POPUP.TUT_IOTA_NETWORK)}
        >
          iota network
        </span>{" "}
        which you can{" "}
        <span
          className="text-btn"
          onClick={() => Functions.popup(POPUP.TUT_IOTA_VERIFY)}
        >
          verify forever
        </span>
        .
        <br />
        <small>
          Note: Transaction pending for over an hour can be seen as failed, the
          money is still with you.
        </small>
      </p>
    </div>
  );

  let newTab;
  if (itemData.campaigns_id) newTab = "to campaign";
  else if (itemData.from_recurrent) newTab = "from recurrent";
  else if (tab === "donations") {
    if (itemData.txhash && itemData.manual_save) newTab = "Saved then executed";
    else if (itemData.txhash) newTab = "Donated";
    else newTab = "Transaction pending";
  } else newTab = "Saved";

  let color;
  if (tab === "donations" && !itemData.txhash) {
    color = ORANGE;
  } else if (tab === "donations") {
    color = BLUE;
  } else {
    color = RED;
  }

  return { tab: newTab, color, headerText };
}
export function AffectedCardLeftDonations(props) {
  const itemData = props.itemData;

  const { fiat_amount, donation_free, crncy } = itemData;

  let tab = deriveTabForDonations(itemData);

  const emoji_heart = "emoji-heart";

  return (
    <div
      className="card-content left blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center">
        {donation_free ? (
          <span role="img" aria-label={emoji_heart}>
            {utils.EMOJI_LABELS[emoji_heart]}
          </span>
        ) : (
          `${fiat_amount / 100} ${utils.getCrncySign(crncy)}`
        )}
      </div>
    </div>
  );
}
export function AffectedCardRightDonations(props) {
  const itemData = props.itemData;

  let tab = deriveTabForDonations(itemData);

  return (
    <div
      className="card-content right blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center small">{tab.tab}</div>
    </div>
  );
}
