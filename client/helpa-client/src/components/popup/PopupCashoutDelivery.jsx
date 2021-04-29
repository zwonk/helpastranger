import React from "react";

export default (props) => {
  const fusedData = props.fusedData;

  return (
    <div>
      {fusedData.pending ? (
        <div className="center mb-25">
          <div>
            <img alt="spinner" width="200" src="/img/spinner.svg" />
          </div>
          <div>
            <h3 className="">Cashout is processing</h3>
          </div>
        </div>
      ) : (
        <div>
          <div>
            <div>
              You need to deliver the cash immediately or loose member status.
              Transaction details can be found under "Cashouts". Accidental
              cashouts can be reverter with the button below.
            </div>
            <hr />
          </div>

          <div className="line-align center">
            <div>
              <video 
                  width="80%"
                  src="img/anim-cashout.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="img/spinner.svg"
                  alt="person delivering cash"
                  />
            </div>
            <div>
              <h3 className="green">Thanks for your help!</h3>
            </div>
          </div>

          <hr />

          <div className="col-12 mb-25 center container">
            <div className="popup-btn-wrapper">
              <div className="center">Mistakenly cashed out?</div>
              <div
                href="#"
                className="button solid-btn"
                onClick={() => props.sendBack()}
              >
                <i className="fas fa-donate"></i>Send back
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
