import React, { useState } from "react";

import { useDispatch } from "react-redux";
import LabelChooser from "components/dumb/LabelChooser";
import { updateOptions } from "reducers/slices/optionsSlice";

export default (props) => {
  
  const dispatch = useDispatch(); //TODO dispatch only form parent

  const fusedData = props.fusedData;
  
  var [fields, setFields] = useState({});

  const onChange = (value, field) => setFields({ ...fields, [field]: value });

  return (
    <div>
      <div className="col-12 mb-25 center">
        <p>
          Recurrent payments are payments that are automatically made from your
          IOTA account in an interval of your choice to help an affected person
          towards a funding goal and get him into a stable lifestyle again.
        </p>
        <p>
          Recurrent payments can be paused and stopped at any time and will only
          be made of you're balance is sufficient
        </p>
      </div>

      <LabelChooser
        type={null}
        options={fusedData.options.recurrentAmountOptions}
        onOptionsChange={(recurrentAmountOptions) =>
          dispatch(updateOptions({ recurrentAmountOptions }))
        }
        onAmountChange={(value) => onChange(value, "amount")}
        classDesc="popup-donation-amounts"
      />
      <LabelChooser
        type="general"
        options={fusedData.options.recurrentIntervalOptions}
        onOptionsChange={(recurrentIntervalOptions) =>
          dispatch(updateOptions({ recurrentIntervalOptions }))
        }
        onAmountChange={(value) => onChange(value, "pay_interval")}
        classDesc="popup-donation-amounts"
      />

      <div className="col-12 mb-25 center container">
        <div className="popup-btn-wrapper">
          <div
            href="#"
            className="button border-btn"
            onClick={() =>
              props.makeRecurrent({
                amount: fields.amount,
                pay_interval: fields.pay_interval,
              })
            }
          >
            Make recurrent
          </div>
          <div className="button">
            <span className="text-btn danger" onClick={() => props.report()}>
              Report a problem.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
