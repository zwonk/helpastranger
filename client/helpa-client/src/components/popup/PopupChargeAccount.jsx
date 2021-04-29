import React from "react";

import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";
import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;
  const userPubKey =
    fusedData.accountViewData.ACCOUNT_DETAILS.curr_public_key_checksum;

  //266678
  const onramperUrl =
    "https://widget.onramper.com?color=b58bb4" +
    `&apiKey=${process.env.REACT_APP_ONRAMPER_API_KEY}` +
    `&defaultCrypto=MIOTA` +
    `&defaultPaymentMethod=creditCard` +
    `&wallets=MIOTA:${userPubKey}` +
    `&onlyCryptos=MIOTA` +
    `&defaultAmount=35
     &isAddressEditable=false
     &fontFamily='Nunito'%2C%20sans-serif
     &gFontPath=css2%3Ffamily%3DNunito%3Awght%40400%3B600%3B700%26display%3Dswap`;

  const link1 = Functions.generateLink({
    text: "external crypto exchange",
    link: POPUP.TUT_IOTA_EXTERNAL_ACCOUNT,
  });

  const link0 = Functions.generateHref({
    text: "onramper.com",
    link: "https://onramper.com",
  });

  const link2 = Functions.generateLink({
    text: "withdraw",
    link: POPUP.TUT_IOTA_WITHDRAWAL,
  });

  const link3 = Functions.generateHref({
    text: "FAQ",
    link: "/faq",
  });

  return (
    <div className="mb-25">
      <div>
        <div>
          <ul className="tutorial-list">
            <li>
              <ul className="list-styled">
                <li>
                  The widget below is powered by {link0} which allows you to buy
                  IOTA safely and without storing any of your personal
                  information. Follow the instruction in the widget below or see
                  the {link3}
                </li>
                <li>
                  You can {link2} the tokens at any time back to an {link1} and
                  from their to cash.
                </li>
                <li>
                  At the moment, we recommend a minimum 35{utils.getCrncySign()}{" "}
                  purchase to avoid high fees.
                </li>
                <li>
                  On iPhones you need to enable third party cookies through:
                  System Settings {">"} Safari {">"} Prevent Cross-Site Tracking{" "}
                  {">"} Off
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <hr />

      {userPubKey ? (
        <iframe
          id="charge-account-iframe"
          src={onramperUrl}
          title="Onramper widget"
          frameBorder="no"
        ></iframe>
      ) : (
        <div>Loading public key</div>
      )}
    </div>
  );
};
