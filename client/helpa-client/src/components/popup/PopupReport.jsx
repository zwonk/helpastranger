import React, { useState } from "react";

export default (props) => {
  const [content, setContent] = useState("");

  return (
    <div>
      <div className="popup-content">
        <div>Describe the problem:</div>
        <small>Context data will be submitted automatically.</small>
        <textarea
          type="text"
          placeholder={"Problem description"}
          onChange={(e) => setContent(e.target.value)}
          value={content}
          className="form-control"
        />

        <div className="popup-btn-wrapper mb-25">
          <div
            href="#"
            className="button solid-btn"
            onClick={() => props.report(content)}
          >
            Submit report
          </div>
        </div>
      </div>
    </div>
  );
};
