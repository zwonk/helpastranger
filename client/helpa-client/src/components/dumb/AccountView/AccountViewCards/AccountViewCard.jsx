import React from "react";

import utils from "functions/utils/utils";

const MID = "MID";

const EMPTY_STRING = "";

export default (props) => {
  const itemData = props.itemData;
  const affectedData = props.affectedData || {};

  const date = utils.formatDate(itemData, "created_at");

  const color = props.colorFn(itemData).color;

  return (
    <div>
      <div
        className="wow animate__animated animate__fadeInUp"
        data-wow-duration="0.9s"
      >
        <div className="border-box card blue" style={{ borderColor: color }}>
          {props.children[0]}

          <div
            className="card-content mid small"
            onClick={() => props.onClick(MID)}
          >
            {props.children[1] === EMPTY_STRING ? (
              <div className="mid-inner">
                <div className="black-text">
                  <b>{affectedData.name || "somebody"}</b> (<i>currently </i>
                  {affectedData.location_address ? (
                    <span>
                      <i>at </i>
                      {affectedData.location_address}
                    </span>
                  ) : (
                    "somewhere"
                  )}
                  )
                </div>
                <div className="black-text">{date}</div>
                <div className="small">Expand by clicking</div>
              </div>
            ) : (
              props.children[1]
            )}
          </div>

          {props.children[2]}
        </div>
      </div>
    </div>
  );
};
