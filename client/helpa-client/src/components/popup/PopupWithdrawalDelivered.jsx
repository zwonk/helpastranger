import React from "react";

export default (props) => {
  return (
    <div>
      <div className="popup-content">
        <div className="line-align center">
          <div className="video-container">
            <video
              width="80%"
              src="img/anim-donated-blue.mov"
              autoPlay
              loop
              muted
              playsInline
              poster="img/spinner.svg"
              alt="anim-donated"
            />
            </div>
          <div>
            <h3 className="green">Thanks for your help!</h3>
          </div>
        </div>

        <hr />

        <div className="col-12 mb-25 center container">
          <div className="popup-btn-wrapper">
            <div className="center">Change delivery status here.</div>
            <div
              href="#"
              className="button solid-btn"
              onClick={() => props.undeliver()}
            >
              <i className="fas fa-donate"></i>Unmark delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
