import React from "react";

import utils from "functions/utils/utils";

export default () => {
  return (
    <div>
      <div id="imprint-page" className="view-page">
        <div className="col-12 mb-55 container">
          <h1 className="center">Legal Disclosure</h1>
          Information in accordance with §5 TMG:
          <br />
          <br />
          Help A Stranger c/o WeWork Sony Center
          <br />
          Kemperplatz 1 Mitte D<br />
          10785 Berlin
          <br />
          <br />
          <h2>Contact Information</h2>
          Phone: Mail only
          <br />
          E-Mail:{" "}
          <a
            className="text-btn"
            href={`mailto:${utils.MAIL}`}
            rel="noopener noreferrer"
          >
            {utils.MAIL}
          </a>
          <br />
          Internet address:{" "}
          <a
            className="text-btn"
            rel="noopener noreferrer"
            href={utils.DOMAIN_URL}
          >
            {utils.DOMAIN_URL}
          </a>
          <br />
          <br />
          <h2>Disclaimer</h2>
          Accountability for content
          <br />
          The contents of our pages have been created with the utmost care.
          However, we cannot guarantee the contents' accuracy, completeness or
          topicality. According to statutory provisions, we are furthermore
          responsible for our own content on these web pages. In this matter,
          please note that we are not obliged to monitor the transmitted or
          saved information of third parties, or investigate circumstances
          pointing to illegal activity. Our obligations to remove or block the
          use of information under generally applicable laws remain unaffected
          by this as per §§ 8 to 10 of the Telemedia Act (TMG).
          <br />
          <br />
          Accountability for links
          <br />
          Responsibility for the content of external links (to web pages of
          third parties) lies solely with the operators of the linked pages. No
          violations were evident to us at the time of linking. Should any legal
          infringement become known to us, we will remove the respective link
          immediately.
          <br />
          <br />
          Copyright
          <br /> Our web pages and their contents are subject to German
          copyright law. Unless expressly permitted by law, every form of
          utilizing, reproducing or processing works subject to copyright
          protection on our web pages requires the prior consent of the
          respective owner of the rights. Individual reproductions of a work are
          only allowed for private use. The materials from these pages are
          copyrighted and any unauthorized use may violate copyright laws.
          <br />
          <br />
          <i>Quelle: </i>
          <a
            href="http://www.translate-24h.de"
            rel="noopener noreferrer"
            target="_blank"
          >
            translate-24h.de
          </a>{" "}
          <br />
          <br />
        </div>
      </div>
    </div>
  );
};
