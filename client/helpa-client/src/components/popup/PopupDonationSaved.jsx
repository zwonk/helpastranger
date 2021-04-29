import React from "react";

export default () => {
  return (
    <div>
      <div>
        <div className="center">
          We saved this person in your account. Come back later to finish the
          donation!
        </div>
        <br />
        <div className="video-container mb-25">
          <video
            width="80%"
            src="img/anim-donated.mov"
            autoPlay
            loop
            muted
            playsInline
            poster="img/anim-donated.jpg"
            alt="donation-saved"
          />
        </div>
      </div>
    </div>
  );
};
