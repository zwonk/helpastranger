import React from "react";
import utils from "functions/utils/utils";

export default () => {

    return (
      <div>
        <div id="faq-page" className="view-page">
          <div className="col-12 mb-55 container">
            <h1 className="center">FAQ</h1>
            <p>
              <b>Why did my account balance turned 0 after a donation?</b>
              <div className="blockquote">
                The IOTA protocol does not allow accounts to hold balances smaller than 1MIOTA for spam protection.<br />
                Therefore, we round up donations to the full balance <small>(max +1MIOTA)</small> when the balance would drop below otherwise.
              </div>
            </p>
            <p>
              <b>Why did my IOTA order through the onramper widget fail?</b>
              <div className="blockquote">
                Check your mails first for information on the transaction
                outcome from the provider (i.e. moonpay).
                <br />
                Otherwise, check the{" "}
                <a
                  className="text-btn"
                  target="_blank"
                  href={`https://onramper.com/faq/#elementor-tab-title-2415`}
                  rel="noopener noreferrer"
                >
                  onramper faq
                </a>
                , contact onramper's custom support or directly make a request
                with{" "}
                <a
                  className="text-btn"
                  target="_blank"
                  href={`https://support.moonpay.com/hc/en-gb/requests/new`}
                  rel="noopener noreferrer"
                >
                  moonpay
                </a>
                .
              </div>
            </p>
            <p>
              <b>Why does the purchase process fail after providing my mail?</b>
              <div className="blockquote">
                On iPhones you need to enable third party cookies through:
                System Settings {">"} Safari {">"} Prevent Cross-Site Tracking{" "}
                {">"} Off
              </div>
            </p>
            <p>
              <b>Scanning doesn't work.</b>
              <div className="blockquote">
                Give your browser the permission to use the camera. Should be
                possible through a camera icon in the top left of the url bar.
              </div>
            </p>
            <p>
              <b>
                Aren't you worried about people just steeling funds or
                duplicating QR codes?
              </b>
              <div className="blockquote">
                We do background checks on our members and we have tight
                limitations on the number of cashouts that can be performed
                within a time-interval.
              </div>
            </p>
            <p>
              <b>
                Why do I need to provide personal data when purchasing through
                the onramper widget?
              </b>
              <div className="blockquote" id="faq-question-6EE554A0-8BBF">
                This is required by the third-party conversion service (i.e.
                moonpay) that onramper is using. But even that service isn't
                storing your data permanently nor sharing it with anyone and it
                cannot be associated to your account here.
              </div>
            </p>
            <p>
              <b>
                I forgot my password, didn't fill out my mail, and want to
                rescue the money on my account.
              </b>
              <div className="blockquote">
                - Forward us the confirmation mail from onramper/moonpay when
                purchasing the tokens to{" "}
                <a
                  className="text-btn"
                  href={
                    `mailto:${utils.MAIL}?subject=Fund%20Rescue #` +
                    utils.makeHash()
                  }
                  rel="noopener noreferrer"
                >
                  {utils.MAIL}
                </a>
                <br />
                <br />- If you sent IOTA to your account here, you can make a
                custom message transaction from the same address you previously
                sent IOTA from. Send us the transaction hash to{" "}
                <a
                  className="text-btn"
                  href={
                    `mailto:${utils.MAIL}?subject=Fund%20Rescue #` +
                    utils.makeHash()
                  }
                  rel="noopener noreferrer"
                >
                  {utils.MAIL}
                </a>
              </div>
            </p>
            <p>
              <b>What is the legal entity behind this site?</b>
              <div className="blockquote">
                We are a network of volunteers that help match donators without
                cash to beneficiaries with QR codes. We pursue a similar
                approach to couchsurfing.com or craigslist.org. However, as we
                do not make any revenue with this service nor directly deal with
                money a legal entity is not required.
              </div>
            </p>
          </div>
        </div>
      </div>
    );
}