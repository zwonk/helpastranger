import React from "react";

import POPUP from "constants/Popup.constants";

import utils from "functions/utils/utils";
import Functions from "functions/FunctionsMain";

export default (props) => {
  const d = props.data.ACCOUNT_DETAILS;

  const renderUserDataBalance = () => {
    let str = "";

    if (d && d.userDataBalance) {
      if (d.userDataBalance.balance > 0) {
        if (d.userDataBalance.balance / utils.MI < 0.01) str = "> ";
      }

      if (d.userDataBalance.refreshNecessary) {
        str = "Refresh page";
        return str;
      }

      if (d.userDataBalance.balance != null) {
        str += utils.formatBalanceIota(d.userDataBalance.balance);
      } else {
        str = "Loading";
        return str;
      }

      if (d.userDataBalance.fiat_balance != null)
        str += ` = ${utils.formatBalance(d.userDataBalance.fiat_balance)}`;
    }
    return str;
  };

  return (
    <div>
      {d ? (
        <div className="col-12 mb-55 center container">
          <div
            className="wow animate__animated animate__fadeInUp"
            data-wow-duration="0.9s"
          >
            <b>Account balance</b>
            <p className="left">
              Charge it directly via credit card or by&nbsp;
              <span
                className="text-btn"
                onClick={() => Functions.popup(POPUP.TUT_IOTA_SENDING)}
              >
                receiving IOTA tokens
              </span>
              .
              <br />
              <small>
                Note: Refresh the page if it is showing on old balance.
              </small>
            </p>
            <div
              className="border-box sub-field green"
              onClick={() => Functions.popup(POPUP.CHARGE_ACCOUNT)}
            >
              <div className="">{renderUserDataBalance()}</div>
              <div className="small">Add money via credit card</div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      <div className="col-12 mb-55 center container">
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <div>
            <b>Account number</b>
          </div>
          <p className="left">
            This address holds your account balance.
            <br />
            <small>Note: You may share the address publicly.</small>
          </p>
          <div
            className="border-box sub-field blue"
            onClick={() =>
              Functions.copyToClipboard(
                d && d.curr_public_key_checksum
                  ? d.curr_public_key_checksum
                  : ""
              )
            }
          >
            <div className="small black-text">
              {d && d.curr_public_key_checksum
                ? d.curr_public_key_checksum.substring(0, 28) + "..."
                : ""}
            </div>
            <div className="small">Copy IOTA public address</div>
          </div>
        </div>
      </div>

      <div className="col-12 mb-55 center container">
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <b>Create a withdrawal</b>
          <p className="left">
            <span
              className="text-btn normal"
              onClick={() => Functions.popup(POPUP.TUT_IOTA_WITHDRAWAL)}
            >
              Withdraw from this account
            </span>
            &nbsp;to an external account that allows you to cash out for
            personal use.
            <br />
            <small>
              Note: When withdrawing to a crypto exchange, check their minimum
              amount for accepting IOTA.
            </small>
          </p>
          <div
            className="border-box link-box blue"
            onClick={() => props.startWithdraw()}
          >
            Withdraw here
          </div>
        </div>
      </div>

      <div className="col-12 mb-55 center container">
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <b>Private key</b>
          <p className="left">
            This is the private key that lets you access your funds even without
            this platform.
            <br />
            <small>
              Note: Never show your private key to anyone nor copy it to your
              computer. It's best to write it on a piece of paper. Follow online
              guidelines how to transfer funds using this key.
            </small>
          </p>
          <div
            className="border-box link-box blue"
            onClick={() => props.showPrivateKey()}
          >
            Show private key
          </div>
        </div>
      </div>

      <div className="container mb-55 center small">
        <p>
          Questions?
          <br />
          <a className="text-btn" href="/faq">
            FAQ
          </a>
        </p>
        <p>
          Interested in how IOTA works under the hood?
          <br />
          <a
            className="text-btn"
            rel="noopener noreferrer"
            target="_blank"
            href="https://docs.iota.org/"
          >
            Get nerdy!
          </a>
        </p>
      </div>
    </div>
  );
};
