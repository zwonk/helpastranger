import React from "react";

import utils from "functions/utils/utils";

const BLUE = "DeepSkyBlue",
  RED = "red",
  GREEN = "limegreen",
  ORANGE = "orange";

export function deriveTabForCampaigns(itemData) {
  const { donations_count, txhash_bridge, error, finished } = itemData;
  const headerText = (
    <div>
      <p>
        You can start a campaign to help somebody out of homelessness
        sustainably by organzing clothes, documents etc. for him. The amount you
        raise will be exclusive to you.
      </p>
    </div>
  );

  let tab = "Created";
  let color = RED;
  if (donations_count !== null) {
    tab = "Ongoing";
    color = BLUE;
  }
  if (finished !== null) {
    tab = `Finished after ${utils.dayDifference(new Date(), finished)} days`;
    color = GREEN;
  }
  if (!txhash_bridge) {
    tab = "Processing";
    color = ORANGE;
  }
  if (error && error !== 0) {
    tab = "Error";
    color = RED;
  }

  return { tab, color, headerText };
}

export function AffectedCardMidCampaigns(props) {
  const itemData = props.itemData;

  const { title } = itemData;

  const date = utils.formatDate(itemData, "created_at");

  return (
    <div className="mid-inner">
      <div className="black-text">
        <b>{title}</b>
      </div>
      <div className="black-text">Started {date}</div>
      <div className="small">Expand by clicking</div>
    </div>
  );
}
export function AffectedCardLeftCampaigns(props) {
  const itemData = props.itemData;

  const { fiat_amount_sum } = itemData;
  let tab = deriveTabForCampaigns(itemData);

  return (
    <div
      className="card-content left blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center">{`Collected ${fiat_amount_sum / 100} ${utils.getCrncySign()}`}</div>
    </div>
  );
}
export function AffectedCardRightCampaigns(props) {
  const itemData = props.itemData;

  let tab = deriveTabForCampaigns(itemData);

  return (
    <div
      className="card-content right blue"
      style={{ backgroundColor: tab.color }}
    >
      <div className="center small">{tab.tab}</div>
    </div>
  );
}
