import React from "react";

export default (props) => {
  const d = props.data[props.view];
  return (
    <div>
      {!d ? (
        <div className="col-12 mb-25 center container">
          <div className="line-align">
            <img alt="spinner" width="20" src="/img/spinner.svg" />
            <div>
             <small>Loading Data...</small>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {props.children}
    </div>
  );
};
