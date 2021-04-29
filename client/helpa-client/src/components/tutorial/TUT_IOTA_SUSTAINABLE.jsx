import React from "react";

export default (props) => {
  return (
    <div className="mb-25">
      Put simply:
      <ul className="tutorial-list">
        <li>1. Transactions are free</li>
        <li>2. Transactions are immediate</li>
      </ul>
      <div className="center">
        <br />
        <iframe
          title="iota-advantages-1"
          src="https://www.youtube-nocookie.com/embed/ivWqqfzunhI"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        ></iframe>
      </div>
      <hr />
      <ul className="tutorial-list">
        <li>3. Transactions consume less energy</li>
      </ul>
      <div className="center">
        <br />
        <iframe
          title="iota-advantages-2"
          src="https://www.youtube-nocookie.com/embed/uSqA9FPGMEI"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        ></iframe>
      </div>
    </div>
  );
};
