
import React from "react";

import Functions from "functions/FunctionsMain";

export default (props) => {
  const link1 = Functions.generateHref({link: "https://www.iota.org/get-started/buy-iota#buy-iota", text:"crypto exchange"});
  return (
    <div className="mb-25">
      <ul className="tutorial-list">
      <li>Open an account on an external {link1} that supports IOTA
       in order to exchange between fiat currencies i.e. "Dollar" and IOTA.
        <br /><small>Note: Those platforms require ID verification.</small></li>
        </ul>
        <div className="center">
            <br />
             <video alt="external_crypto_exchange" width="100%" controls={true} loop={true} >
              <source src="/img/video-externalcryptoexchange-720.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video> 
          </div>
    </div>
  );
};
