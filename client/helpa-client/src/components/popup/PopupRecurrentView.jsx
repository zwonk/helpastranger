import React, { useState } from "react";

import { useDispatch } from "react-redux";

import { updateOptions } from "reducers/slices/optionsSlice";

import AffectedBalance from "components/dumb/AffectedInfo/AffectedInfoBalance";
import AffectedLocationHistory from "components/dumb/AffectedInfo/AffectedInfoLocationHistory";
import LabelChooser from "components/dumb/LabelChooser";

export default (props) => {
  const dispatch = useDispatch();

  const fusedData = props.fusedData;

  const [fields, setFields] = useState(fusedData.itemData);

  const onChange = (value, field) => setFields({ ...fields, [field]: value });

  return (
    <div>
      <div className="col-12 mb-25 center">
        <p>
          This recurrent payment is{" "}
          {fusedData.pausedState ? "paused" : "running"} since{" "}
          {fusedData.updatedDate}
        </p>
      </div>

      <LabelChooser
        type={null}
        amount={fields.amount}
        options={fusedData.options.recurrentAmountOptions}
        onAmountChange={(amount) => onChange(amount, "amount")}
        onOptionsChange={(options) =>
          dispatch(updateOptions({ recurrentAmountOptions: options }))
        }
        classDesc="popup-donation-amounts"
      />
      <LabelChooser
        type="general"
        amount={fields.pay_interval}
        options={fusedData.options.recurrentIntervalOptions}
        onAmountChange={(amount) => onChange(amount, "pay_interval")}
        onOptionsChange={(options) =>
          dispatch(updateOptions({ recurrentIntervalOptions: options }))
        }
        classDesc="popup-donation-amounts"
      />

      <div className="col-12 mb-25 center container">
        <div className="popup-btn-wrapper">
          <div
            href="#"
            className="button solid-btn"
            onClick={() =>
              props.changeRecurrent(fields.amount, fields.pay_interval)
            }
          >
            Apply changes
          </div>
          <div
            href="#"
            className="button border-btn"
            onClick={() =>
              props.toggleRecurrent(Math.abs(1 - fusedData.pausedState))
            }
          >
            {fusedData.pausedState ? "Restart recurrent" : "Pause recurrent"}
          </div>
          <div className="button">
            <span
              className="text-btn danger"
              onClick={() => props.deleteRecurrent()}
            >
              Delete recurrent.
            </span>
          </div>
        </div>
      </div>

      <hr />

      <br />

      <AffectedLocationHistory
        affectedData={fusedData.affectedData}
        locations={fusedData.affectedLocations}
        caller={props.caller}
      />
      <hr />

      <AffectedBalance
        fusedData={fusedData}
        startCashout={() => props.startCashout()}
        modal={(arr) => props.modal(arr)}
      />
    </div>
  );
};
