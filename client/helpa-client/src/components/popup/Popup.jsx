import React from "react";

import Functions from "functions/FunctionsMain";

import PS from "constants/PopupStatus.constants";

export default (props) => {
  const className = "popup " + (props.classDesc ? props.classDesc : "");

  const renderPopupStatus = () => {
    switch (props.ps) {
      case PS.GREEN:
        return <i className="green far fa-check-circle"></i>;
      case PS.ORANGE:
        return <i className="orange fas fa-exclamation-triangle"></i>;
      case PS.RED:
        return <i className="red far fa-check-times"></i>;
      case PS.NONE:
        return "";
      default:
        return <i className="fas fa-exclamation-triangle"></i>;
    }
  };

  const close = props.close === true ? Functions.popupClose : props.close

  return (
    <div>
      <div className="overlay" onClick={() => close()}></div>
      <div className={className}>
        <div className="popup-header">
          <div className="popup-header-left">
            <div className="popup-header-left content-hor">
              {!props.back ? (
                ""
              ) : (
                <div
                  className="first small button solid-btn round"
                  onClick={() => Functions.popupBack()}
                >
                  <i className="fas fa-arrow-circle-left"></i>
                </div>
              )}
            </div>
            <div>{renderPopupStatus()}</div>
            <div>
              <h3 className={props.ps}>{props.pn}</h3>
            </div>
          </div>

          {!props.close ? (
            ""
          ) : (
            <div className="popup-header-right" onClick={() => close()}>
              <i className="close-icon fas fa-times"></i>
            </div>
          )}
        </div>

        <hr />

        <div className="popup-content">{props.children}</div>
      </div>
    </div>
  );
};
