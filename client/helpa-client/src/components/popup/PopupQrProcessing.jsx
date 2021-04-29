import React from "react";

export default (props) => {
  return (
    <div>
      <div className="center">
        <div>
          <img alt="spinner" width="200" src="/img/spinner.svg" />
        </div>
        <div>
          <h3 className="">Processing QR code.</h3>
        </div>
        <br />
        <div>
          <p className="">Taking too long or is the connection bad?</p>
        </div>
        <div href="#" className="button border-btn" onClick={() => props.save()}>
          Save for later!
        </div>
      </div>
    </div>
  );
};
