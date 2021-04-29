import React from "react";

import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";

export default (props) => {
  const fusedData = props.fusedData;

  const link1 = Functions.generateCopyToClipboard({
    text: "IOTA public address",
    link: fusedData.accountViewData.ACCOUNT_DETAILS.curr_public_key_checksum,
  });

  const link2 = Functions.generateLink({
    text: "here",
    link: POPUP.CHARGE_ACCOUNT_BACK,
  });

  const link3 = Functions.generateLink({
    text: "external crypto exchange",
    link: POPUP.TUT_IOTA_EXTERNAL_ACCOUNT,
  });

  return (
    <div className="mb-25">
      <div className="center">
        <video alt="sending_iota" width="100%" controls={true} loop={true}>
          <source src="/img/video-sendingiota-720.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <ul className="tutorial-list">
        <li>
          <ul className="list-styled">
          <li>
              You can buy IOTA directly via credit card {link2}. In this case you can ignore the instructions below.
            </li>
            <li>
              {" "}
              IOTA can be bought on an {link3}. Once you have IOTA on such an
              exchange:
            </li>
            <li className="not-styled">
              <ul>
                <li>
                  1. Find a page where you can send transactions out of the your
                  wallet on the crypto exchange.
                </li>
                <li>2. Copy your {link1} and paste it where required.</li>
                <li>
                  3. Finish the transfer dialogue. It may take several minutes
                  or longer until the money is here.
                </li>
              </ul>
            </li>
            <li>
              If you have tokens in an IOTA wallet such as{" "}
              <a
                className="share-pin logo-firefly"
                alt="donate"
                rel="noopener noreferrer"
                target="_blank"
                href="https://firefly.iota.org/"
              >
                Firefly
              </a>{" "}
              :
            </li>
            <li className="not-styled">
              <ul>
                <li>
                  1. Click where it says "Send", and paste your&nbsp;
                  {link1} into the address field.
                </li>
                <li>
                  2. Finish the transfer. It will take several seconds until the
                  money is in this account.
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};
