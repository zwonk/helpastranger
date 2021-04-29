import React from "react";

import Functions from "functions/FunctionsMain"

export default () => {
    const link1 = Functions.generateHref({
        text: "tangle explorer",
        link: "https://explorer.iota.org/mainnet"
    })
  return (
    <div className="mb-25">
      <ul className="tutorial-list">
        <li>
          At any time in the future you will be able to find your transaction in
          the data storage that is stored on all servers in the iota network.
        </li>
        <li>
          The {link1} gives you a glimpse into this storage, but you could also
          setup your own server for this. Without your transactions in it, no
          iota server will ever be valid. No one can deny your donation!
        </li>
        <li>
          Further, you can see where the money went.{" "}
          <b>
            You can track the path of what addresses received the tokens you
            donated.
          </b>{" "}
          Did it all go to the beneficiary, or did someone took a commission?
        </li>
      </ul>
      <br />
      <div className="center">
        <iframe
          title="iota-explanation"
          src="https://www.youtube-nocookie.com/embed/CZxH1V_zoug"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        ></iframe>
      </div>
    </div>
  );
};
