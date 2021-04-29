import React from "react";

export default (props) => {
  return (
    <div className="flat-switcher">
      <div className="col-12 center container">
        <div className="flat-switcher-inner blue">
          {props.dataLength === 1 ? (
            <div>&nbsp;</div>
          ) : (
            <div onClick={() => props.onChange(-1)}>
              <i className="fas fa-chevron-left"></i>
            </div>
          )}
          <div className="heading">{props.pn}</div>
          {props.lastIndex ? (
            <div>&nbsp;</div>
          ) : (
            <div onClick={() => props.onChange(1)}>
              <i className="fas fa-chevron-right"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
