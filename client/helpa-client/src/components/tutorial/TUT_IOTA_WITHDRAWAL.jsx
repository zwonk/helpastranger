import React from "react";

import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";

export default (props) => {
  const link1 = Functions.generateLink({
    text: "withdrawal",
    link: POPUP.WITHDRAW,
  });

  const link3 = Functions.generateLink({
    text: "external crypto exchange",
    link: POPUP.TUT_IOTA_EXTERNAL_ACCOUNT,
  });

  return (
    <div className="mb-25">
      <div className="center">
        <video
          alt="withdrawing_iota_from_platform"
          width="100%"
          controls={true}
          loop={true}
        >
          <source src="/img/video-withdraw1-720.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <ul className="tutorial-list">
        <li>
          <ul className="list-styled">
            <li>
              {" "}
              If you want to exchange your money to a different currency
              or&nbsp;
              <b>withdraw to cash</b>:
            </li>
            <li className="not-styled">
              <ul>
                <li>
                  1. Withdraw your IOTA tokens as explained above to an external
                  exchange.
                </li>
                <li>
                  2. Find the page where it says exchange to i.e. "Dollar", and
                  follow the instructions to exchange your funds.
                </li>
                <li>
                  3. Find the page where you can send your "Dollar" funds to an
                  external bank account and follow the instructions. The
                  transfer might take up to several days.
                </li>
                <li>
                  4. Once the money arrived in your bank account you can
                  withdraw it to cash.
                  <br />
                  <small>
                    Note: Keep in mind your
                    government's regulations on exchanging cryptocurrencies to
                    fiat currencies.{" "}
                  </small>
                </li>
              </ul>
            </li>
            <li>
              If you want to withdraw your funds but keep the money in IOTA:
            </li>
            <li className="not-styled">
              <ul>
                <li>a. If you have an account on an {link3}.</li>
                <li>
                  <ul>
                    <li>1. Find your IOTA public key on the exchange</li>
                    <li>
                      2. Copy that address and paste it into this {link1}{" "}
                      dialogue.
                    </li>
                    <li>
                      3. Follow the withdrawal dialogue and the money should be
                      on your external account within seconds.
                    </li>
                  </ul>
                </li>
                <li>
                  b. If you have an IOTA wallet such as{" "}
                  <a
                    className="share-pin logo-firefly"
                    alt="donate"
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://firefly.iota.org/"
                  >
                    Firefly
                  </a>
                </li>
                <li>
                  <ul>
                    <li>
                      1. Go to the section where it says "Receive", and paste
                      that address into the {link1} dialogue.
                    </li>
                    <li>
                      2. Finish the withdrawal dialogue, and reload your balance
                      view in your external wallet.
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};
