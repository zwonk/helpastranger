import React from "react";

import utils from "functions/utils/utils";

const BLUE = "DeepSkyBlue";

export function deriveTabForRecurrentPayments(itemData) {
  const { paused_state } = itemData;
  const headerText = (
    <div>
      <p>
        You can start recurrent payment to an affected person. It will run until
        your out of funds or you stop it.
      </p>
    </div>
  );

  let tab;
  let color = BLUE;
  if (paused_state) {
    tab = <i className="fas fa-pause-circle fa-5x"></i>;
  } else {
    tab = <i className="fas fa-play-circle fa-5x"></i>;
  }
  return { tab, color, headerText };
}

export function AffectedCardLeftRecurrentPayments(props) {
  const itemData = props.itemData;

  const { fiat_amount, amount, donations_count } = itemData;
  let tab = deriveTabForRecurrentPayments(itemData);

  return (
    <div
      className="card-content left blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center">
        <span>
          {fiat_amount / 100 || amount / utils.MI}{" "}
          {fiat_amount ? utils.getCrncySign() : "MI"}
        </span>
        <br />
        <span className="small">
          {donations_count ? "(" + donations_count + " executions)" : ""}
        </span>
      </div>
    </div>
  );
}
export function AffectedCardRightRecurrentPayments(props) {
  const itemData = props.itemData;

  let tab = deriveTabForRecurrentPayments(itemData);

  return (
    <div
      className="card-content right blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center small">{tab.tab}</div>
    </div>
  );
}
