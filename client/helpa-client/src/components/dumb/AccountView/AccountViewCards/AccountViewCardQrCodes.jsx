import React from "react";

import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";

import utils from "functions/utils/utils";

const BLUE = "DeepSkyBlue",
  RED = "red";

export function deriveTabForQrCodes(itemData) {
  const { donations_fiat_amount_sum, donations_count, crncy, donations_crncy } = itemData;
  const headerText = (
    <div>
      <p className="left">
        QR codes are identifiers for a beneficiary's account number. Here is a
        summary of all those you brought into the world. <br />
        <span
          className="text-btn"
          onClick={() => Functions.popup(POPUP.TUT_PRINT)}
        >
          Print more here.
        </span>
        <br />
        <small>
          Note: The collected amount is the total amount people sent through
          donations but will differ from the live balance when volunteers cash out or
          due to course fluctuations.
        </small>
      </p>
    </div>
  );

  let tab = "Created";
  let color = RED;
  if (donations_count != null) {
    tab = "Collected " + utils.formatFiatBalanceOrSmaller(donations_fiat_amount_sum, crncy || donations_crncy);
    color = BLUE;
  }

  return { tab, color, headerText };
}

export function AffectedCardLeftQrCodes(props) {
  const itemData = props.itemData;

  const { qr_blob } = itemData;
  let tab = deriveTabForQrCodes(itemData);

  return (
    <div
      className="card-content left blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center">
        <img style={{backgroundColor: "white"}} alt="qr-code" width={80} src={qr_blob} />
      </div>
    </div>
  );
}
export function AffectedCardRightQrCodes(props) {
  const itemData = props.itemData;

  let tab = deriveTabForQrCodes(itemData);

  return (
    <div
      className="card-content right blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center small">{tab.tab}</div>
    </div>
  );
}
