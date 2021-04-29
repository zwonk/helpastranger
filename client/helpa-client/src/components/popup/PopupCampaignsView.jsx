import React, { useState } from "react";

import POPUP from "constants/Popup.constants";
import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState(fusedData.itemData);

  const onChange = (value, field) =>
    setFields((fields) => ({ ...fields, [field]: value }));

  const onSubmit = (fields) => {
    if (editMode) props.onSubmit(fields);
    setEditMode((editMode) => !editMode);
  };

  const renderDonationGoal = (fiat_amount, fiat_amount_sum) => (
    <div>
      Donation goal (required):{" "}
      {fiat_amount
        ? `${fiat_amount_sum / 100} / ${
            fiat_amount / 100
          } ${utils.getCrncySign()}`
        : ""}
    </div>
  );

  const isCreateView = props.caller === POPUP.CAMPAIGNS_CREATE;
  const isWithdrawalReady =
    fusedData.itemData.fiat_amount === fusedData.fiatAmountSum;

  return (
    <div>
      <div className="popup-content">
        {!editMode && !isCreateView ? (
          <div>
            <div>
              <b>Campaign Title (required): {fields.title}</b>
            </div>
            {renderDonationGoal(
              fusedData.itemData.fiat_amount,
              fusedData.fiatAmountSum
            )}
            <div>Description: {fields.description}</div>
            <div>Image link: {fields.img_link}</div>
          </div>
        ) : (
          <div>
            <textarea
              type="text"
              placeholder={"Campaign Title"}
              onChange={(e) => onChange(e.target.value, "title")}
              value={fields.title}
              className="form-control"
            />
            {!isCreateView ? (
              renderDonationGoal(
                fusedData.itemData.fiat_amount,
                fusedData.fiatAmountSum
              )
            ) : (
              <textarea
                type="text"
                placeholder={"Donation goal"}
                onChange={(e) => onChange(e.target.value, "fiat_amount")}
                value={fields.fiat_amount}
                className="form-control"
              />
            )}
            <textarea
              type="text"
              placeholder={"Description"}
              onChange={(e) => onChange(e.target.value, "description")}
              value={fields.description}
              className="form-control"
            />
            <textarea
              type="text"
              placeholder={"Image link"}
              onChange={(e) => onChange(e.target.value, "img_link")}
              value={fields.img_link}
              className="form-control"
            />
          </div>
        )}

        <div>
          {!isCreateView ? (
            <span className="text-btn" onClick={() => onSubmit(fields)}>
              {!editMode ? "Edit these infos" : "Save changes"}
            </span>
          ) : (
            ""
          )}

          {!editMode ? (
            <div className="popup-btn-wrapper">
              {!isCreateView ? (
                ""
              ) : (
                <div
                  href="#"
                  className="button border-btn"
                  onClick={() => onSubmit(fields)}
                >
                  Create campaign
                </div>
              )}
              {isCreateView || !isWithdrawalReady ? (
                ""
              ) : (
                <div
                  href="#"
                  className="button solid-btn"
                  onClick={() => props.startCashout()}
                >
                  <i className="fas fa-donate"></i>Withdraw campaign
                </div>
              )}
              {isCreateView ? (
                ""
              ) : (
                <div
                  href="#"
                  className="button border-btn"
                  onClick={() =>
                    props.onDelete(fusedData.itemData.campaigns_id)
                  }
                >
                  Delete campaign
                </div>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};
