import React from "react";
import QrReaderComponent from "react-qr-reader";

export default (props) => {
  const handleError = (err) => {
    console.error(err);
  };

  return (
    <QrReaderComponent
      delay={300}
      onError={handleError}
      onScan={(res) => props.handleScan(res)}
      style={{ width: "100%" }}
    />
  );
};
