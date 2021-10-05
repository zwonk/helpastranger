import React from "react";

import Functions from "functions/FunctionsMain";

export default () => {

    return (
      <div>
        <div id="terms-page" className="view-page">
          <div className="col-12 mb-25 container">
            <h1 className="center">Terms</h1>
            <b>Cookie policy:</b>
            <p>
              This site makes use of&nbsp;
              <a
                className="text-btn"
                target="_blank"
                rel="noopener noreferrer"
                href="https://policies.google.com/terms?hl=en"
              >
                Google Recaptcha{" "}
              </a>
              and{" "}
              <a
                className="text-btn"
                target="_blank"
                rel="noopener noreferrer"
                href="https://onramper.com/privacy-policy/"
              >
                onramper.com
              </a>
            </p>
            <hr />
            <b>Transactions:</b>
            <p>
              No fiat transactions are made on this platform.
              <br /> <br />
              However, if you plan to use the widget in the account page to buy
              iota via credit card, please view the respective terms of{" "}
              <a
                className="text-btn"
                target="_blank"
                rel="noopener noreferrer"
                href="https://onramper.com/terms-of-use/"
              >
                onramper.com
              </a>
            </p>
            <hr />
            <b>Signup terms:</b>
            <p>
              Review the{" "}
              <span
                className="text-btn"
                onClick={() => Functions.startShowTerms()}
              >
                signup terms
              </span>{" "}
              if you consider signing up to this platform.
            </p>
            <br />
          </div>
        </div>
      </div>
    );
}
