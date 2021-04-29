import React from "react";

import utils from "functions/utils/utils";

export default (props) => {
  const isMember = utils.isMember(props.data);
  return (
    <div id="account_settings">
      <div
        className="col-12 mb-55 center container"
        onClick={() => props.onEditUser()}
      >
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <div className="border-box link-box blue">EDIT DATA</div>
        </div>
      </div>

      <div
        className="col-12 mb-55 center container"
        onClick={isMember ? () => {} : () => props.startMembershipApply()}
      >
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <div className={`border-box link-box ${isMember ? "green" : "blue"}`}>
            {isMember ? "YOU ARE A MEMBER" : "APPLY FOR MEMBER STATUS"}
          </div>
        </div>
      </div>

      <div
        className="col-12 mb-55 center container"
        onClick={() => props.signOut()}
      >
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <div className="border-box link-box green">SIGNOUT</div>
        </div>
      </div>

      <div
        className="col-12 mb-55 center container"
        onClick={() => props.deleteAccount()}
      >
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <div className="border-box link-box red">DELETE ACCOUNT</div>
        </div>
      </div>
    </div>
  );
};
