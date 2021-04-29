import React from "react";
import { useSelector } from "react-redux";

export default () => {
  const data = useSelector(state => state.auth);

  return (
    <div>
      <div className="line-align center">
        <div>
          <img alt="spinner" width="200" src="/img/spinner.svg" />
        </div>
        <div>
          <h3 className="green">
            {data.signedup ? "Thanks for signing up!" : "Logging in..."}
          </h3>
        </div>
      </div>
      <div className="spacer"></div>
    </div>
  );
};
