import React, { useState } from "react";

import utils from "functions/utils/utils"

export default (props) => {
  const [options, setOptions] = useState(props.options);
  const [optionSelected, setOptionSelected] = useState(0);

  const LAST_EDITABLE = false
  const onChange = (obj) => {
    if(obj.options != null){
      props.onOptionsChange(options);
      setOptions(obj.options);
    }

    if(obj.optionSelected != null){
      props.onAmountChange(options[obj.optionSelected]);
      setOptionSelected(obj.optionSelected)
    }
  };

  const renderOptionText = (obj) => {
    if(obj.emoji && Object.keys(utils.EMOJI_LABELS).includes(obj.emoji)){
      return <span><span role="img" aria-label={obj.emoji}>{utils.EMOJI_LABELS[obj.emoji]}</span> {obj.text}</span>
    }
    else 
      return obj.text
  }

  const renderOptions = () => {
    return options
      .slice(0, LAST_EDITABLE ? options.length - 1 : options.length)
      .map((obj, i) => {
        return (
          <div
            key={i}
            onClick={() => onChange({ optionSelected: i })}
            className={
              optionSelected === i ? "label solid-btn" : "label border-btn"
            }
          >
            {renderOptionText(obj)}
          </div>
        );
      });
  };

  const renderGeneralOptions = () => {
    return options.slice(0, options.length).map((obj, i) => {
      return (
        <div
          key={i}
          onClick={() => onChange({ optionSelected: i })}
          className={ optionSelected === i ? "solid-btn" : "border-btn"}
        >
          {obj.text}
        </div>
      );
    });
  };

  return !props.type? (
    <div className={props.classDesc}>
      {renderOptions()}
      { LAST_EDITABLE ? <div className={optionSelected === 3 ? "" : ""} onClick={() => {}}>
        <label className="intext" data-domain={utils.getCrncySign()}>
          <input
            className={
              optionSelected === options.length -1
                ? "label solid-btn intext"
                : "label border-btn intext"
            }
            onClick={() =>
              onChange({ optionSelected: options.length - 1 })
            }
            onChange={(e) =>
              onChange({
                optionSelected: options.length - 1,
                options: [
                  ...options.slice(0, options.length - 1),
                  { value: parseFloat(e.target.value || 0) * 100 ,
                    text: (parseFloat(e.target.value || 0)).toString() },
                ],
              })
            }
            value={options[options.length - 1].text}
            maxLength="3"
            type="text"
          />
        </label>
      </div> : ""}
    </div>
  ) : (
    <div className={props.classDesc}>{renderGeneralOptions()}</div>
  );
};
