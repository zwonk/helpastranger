import utils from "functions/utils/utils";
import React from "react";

export default (props) => {

  return (
    <div className="mb-25">
      <div className="center">
        <div className="video-container">
          <video
            width="100%"
            className="video-container-cashout"
            autoPlay
            loop
            muted
            playsInline
            poster="img/spinner.svg"
          >
            <source src="img/anim-cashout.mov" type="video/mp4" />
          </video>
        </div>
      </div>
      <ul className="tutorial-list">
        <li>
          <ul className="list-styled">
            <li>
              As a verified member you are the person delivering beneficiary's their
              donations in cash as they have no technical means to access their
              iota account themselves. Please remind them of how the money was
              collected and encourage them to promote their QR plate.
            </li>
            <li>
              In return, you immediately receive their iota funds into your
              account from where you can withdraw them to{" "}
              {
                utils.getCrncyList().find((x) => x.code === utils.getCrncy())
                  .name
              }{" "}
              on an exchange.
            </li>
            <li>
              We require your GPS for the cashout, to verify that you are close
              to a beneficiary's past locations and not passing them to the
              wrong person.
            </li>
            <li>
              You are encouraged to create an entirely new QR plate for a
              beneficiary if their old one is damaged and trash the old one.
            </li>
            <li>
              If you keep a homeless person's funds without returning the cash
              you are likely more in need than him, and you put in effort to
              learn using IOTA. We are happy we could help.
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};
