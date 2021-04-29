import React from "react";

import PS from "constants/PopupStatus.constants";
import utils from "functions/utils/utils";
import Functions from "functions/FunctionsMain";

export default (props) => {
  const fusedData = props.fusedData;
  const name = props.name || fusedData.affectedData.name;

  const onCashout = () => {
    if (!fusedData.isMember)
      Functions.modal(["Only for verified members", PS.RED]);
    else if (fusedData.affectedExtended.balance) Functions.startCashout();
    else Functions.modal(["Nothing to cashout.", PS.RED]);
  };

  return (
    <div>
      <div>
        <hr />
        <div className={`${!utils.getCachedUsersId() ? "mb-25" : ""}`}></div>

        <div className={`col-12 center mb-25 container`}>
          {!utils.getCachedUsersId() ? (
            <div>
              <span className="text-btn" onClick={() => Functions.signform()}>
                Sign in
              </span>{" "}
              to see{" "}
              {name ? (
                <span>
                  <b>{name}</b>'s
                </span>
              ) : (
                "their"
              )}{" "}
              balance
            </div>
          ) : (
            <div>
              <p>
                <b>Beneficiary's live balance</b>
                <button className="button-recording">live</button>
                <br />
                <span className="small">
                  (Revisit in ~10s if old balance is shown.)
                </span>
              </p>
              <div className="border-box green">
                {fusedData.affectedExtended.balance != null
                  ? utils.formatBalanceIota(
                      fusedData.affectedExtended.balance
                    ) +
                    " = " +
                    utils.formatBalance(
                      fusedData.affectedExtended.fiatBalance,
                      null,
                      fusedData.affectedExtended.crncy
                    )
                  : "Loading"}
              </div>
            </div>
          )}
        </div>

        {!utils.getCachedUsersId() ? (
          ""
        ) : (
          <div className={`col-12 mb-25 center container`}>
            {fusedData.isMember ? (
              <div className="popup-btn-wrapper-narrow">
                <div
                  href="#"
                  className={
                    fusedData.affectedExtended.balance && fusedData.isMember
                      ? "button solid-btn"
                      : "button solid-btn inactive"
                  }
                  onClick={() => onCashout()}
                >
                  Cashout{name ? " for " + name : ""}
                </div>
              </div>
            ) : (
              <div>
                <p>
                  Become{" "}
                  <span
                    className="text-btn"
                    onClick={() => Functions.startMembershipApply()}
                  >
                    verified
                  </span>{" "}
                  to cashout.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
