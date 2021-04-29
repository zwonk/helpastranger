import React from "react";

export default (props) => {
  
  const fusedData = props.fusedData;

  return (
    <div>
      <div className="popup-content mb-25">
        <div className="line-align center">
          <div>
            <img alt="error" width="200" src="/img/error_gif.gif" />
          </div>
          <div>
            <h3 className="red">{fusedData.errors}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};
