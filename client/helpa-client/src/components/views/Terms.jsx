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
              We use&nbsp;
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
              . Click their links to read their respective privacy policy and
              cookie terms.
            </p>
            <hr />
            <b>Transactions:</b>
            <p>
              No monetary transactions are made directly on this platform rather
              than through external providers.
              <br /> <br />
              View the respective terms of{" "}
              <a
                className="text-btn"
                target="_blank"
                rel="noopener noreferrer"
                href="https://onramper.com/terms-of-use/"
              >
                onramper.com
              </a>{" "}
              if you plan to use the option to buy iota directly through the
              widget in the account page.
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
