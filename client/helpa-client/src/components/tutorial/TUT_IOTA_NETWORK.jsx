import React from "react";

import Functions from "functions/FunctionsMain";

export default (props) => {
  const link = Functions.generateHref({
    text: "Iota",
    link: "https://www.iota.org/",
  });
  return (
    <div className="mb-25">
      <ul className="tutorial-list">
        <li>
          The Bitcoin Blockchain was the first technology that powered a
          financial economy with peer-to-peer monetary transactions without
          banks.
        </li>
        <li>
          {link} extended that idea in 2016 with their technology in order to
          power an economy of all types of data.
        </li>
        <li>
          The iota network consists of potentially thousands of distributed, independent
          servers that store a copy of all transactions. No server
          can fake transactions, as the other servers would notice the outlier
          as a fraud.
        </li>
        <li>
          The money is not owned by a single institution - it is owned by you
          who has the secret key. The servers store a history of
          transactions to proof your current balance but don't have access to your funds.
        </li>
      </ul>
      <br />
      <div class="center">
        <img
          className="img-iota-distributed"
          alt="iota-distributed"
          src="img/iota-distributed.png"
          width="80%"
        />
      </div>
    </div>
  );
};
