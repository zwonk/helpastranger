import React, { useState } from "react";

import utils from "functions/utils/utils";

const HOME_MAP = "HOME_MAP";

export default (props) => {
  const [readMore, setReadMore] = useState(false);

  const campaign = props.campaign;
  const readMorePossible = props.caller !== HOME_MAP;
  
  const fiat_amount_sum = campaign.curr_fiat_amount || campaign.fiat_amount_sum || 0; 
  //TODO make only one field in sql query

  return (
    <div className="campaign-card">
      <b>{campaign.title}</b>
      <div>
        {readMore && readMorePossible ? (
          <p>
            <span
              className="text-btn"
              onClick={() => setReadMore((readMore) => !readMore)}
            >
              Read more <i className="fas fa-caret-down"></i>
            </span>
          </p>
        ) : (
          ""
        )}
      </div>
      {readMorePossible ? (
        <div>
          <img alt="campaign" width="50%" src={campaign.img_link} />
          <div>
            <p className="block-description">{campaign.description}</p>
          </div>
        </div>
      ) : (
        ""
      )}
      <div>
        <span>
          {(fiat_amount_sum ? fiat_amount_sum / 100 : 0) +
            "/" +
            campaign.fiat_amount / 100}
          {utils.getCrncySign()}
        </span>
      </div>
      <svg
        style={{ position: "relative" }}
        width="100%"
        height="50px"
        viewBox="0 0 100 6"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          y1="3"
          y2="3"
          stroke="lightgray"
          strokeLinecap="round"
          strokeWidth="3"
          x1="1.5"
          x2="98.5"
        />
        <line
          y1="3"
          y2="3"
          stroke="green"
          strokeLinecap="round"
          strokeWidth="3"
          x1="1.5"
          x2={
            campaign.fiat_amount
              ? (fiat_amount_sum / campaign.fiat_amount) * 100
              : 0
          }
        />
      </svg>
    </div>
  );
};
