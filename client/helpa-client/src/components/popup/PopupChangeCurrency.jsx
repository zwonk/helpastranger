import React, { useState } from "react";

import utils from "functions/utils/utils";

export default (props) => {
  const [content, setContent] = useState(utils.getCrncy());

  return (
    <div>
      <div className="popup-content">
        <div>Change displayed currency:</div>
        {utils.getCachedUsersId() ? (
          <small>
            Your account statistics will be converted automatically.
          </small>
        ) : null}

        <select
          className="form-control"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        >
          {utils.getCrncyList().map((x, i) => (
            <option key={`${i}_crncy`} value={x.code}>
              {x.name}
            </option>
          ))}
        </select>

        <div className="popup-btn-wrapper mb-25">
          <div
            href="#"
            className="button solid-btn"
            onClick={() => props.changeCurrency(content)}
          >
            Change currency
          </div>
        </div>
      </div>
    </div>
  );
};
