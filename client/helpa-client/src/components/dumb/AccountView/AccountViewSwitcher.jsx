import React from "react";

export default (props) => {
  return (
    <div className="account-view-switcher">
      <div className="col-12 mb-25 center container">
        <div className="account-view-switcher-inner blue">
          <div
            className="small button solid-btn round"
            onClick={() => props.onChange(-1)}
          >
            <i className="fas fa-arrow-circle-left"></i>
          </div>
          <div className="heading">{props.pn}</div>
          <div
            className="small button solid-btn round"
            onClick={() => props.onChange(1)}
          >
            <i className="fas fa-arrow-circle-right"></i>
          </div>
        </div>
      </div>
    </div>
  );
};
