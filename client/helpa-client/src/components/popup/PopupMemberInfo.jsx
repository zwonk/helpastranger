import React, { useEffect, useState } from "react";

import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  const [fields, setFields] = useState({}); //TODO !fields -> loading spinner
  const [usersId, setUsersId] = useState(null);

  useEffect(() => {
    setUsersId(fusedData.itemData.users_id)
    setFields({...fusedData.itemData, users_id: utils.hashCode(fusedData.itemData.users_id)});
  }, [fusedData.itemData]);

  const renderFields = (fields) => Object.keys(fields).map((f,i) => (
        <div><b>{f}:</b> {fields[f]}</div>
    ))

  const flagged = fields.flagged
  const member = fields.member_state
  
  return (
    <div>
      <div className="popup-content">
        <div className="mb-25">
          <div className="popup-btn-wrapper">
            <div
              className="button border-btn left"
              onClick={() =>
                props.adminsAction(
                  usersId,
                  flagged
                    ? utils.ADMIN_ACTIONS.UNFLAG_MEMBER
                    : utils.ADMIN_ACTIONS.FLAG_MEMBER
                )
              }
            >
              {flagged ? "Unflag" : "Flag"}{" "}
              <i className="fas fa-arrow-circle-left"></i>
            </div>

            <div
              className="button solid-btn right"
              onClick={() =>
                props.adminsAction(
                  usersId,
                  member
                    ? utils.ADMIN_ACTIONS.UNMAKE_MEMBER
                    : utils.ADMIN_ACTIONS.MAKE_MEMBER
                )
              }
            >
              {member ? "Unmake member" : "Make member"}{" "}
              <i className="fas fa-arrow-circle-right"></i>
            </div>
          </div>
        </div>
        <div className="member-info-container col-12 mb-55">
          {fields && renderFields(fields)}
        </div>
      </div>
    </div>
  );
};
