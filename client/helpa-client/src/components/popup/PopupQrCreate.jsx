import POPUP from "constants/Popup.constants";

import Functions from "functions/FunctionsMain";
import utils from "functions/utils/utils";
import React, { useState, useEffect } from "react";

const DEFAULT_QR_AMOUNT = 2;

const OPTIONS_MOBILE = [2, "more on desktop"];
const OPTIONS_DESKTOP = [2, 4, 6];

export default (props) => {
  
  const [amount, setAmount] = useState(DEFAULT_QR_AMOUNT);
  const [optionsQuantity, setOptionsQuantity] = useState(OPTIONS_MOBILE);

  const onChange = (value) => setAmount(value);

  useEffect(() => {
    const mobile = utils.isMobile();
    setOptionsQuantity(mobile ? OPTIONS_MOBILE : OPTIONS_DESKTOP)
    setAmount(mobile ? OPTIONS_MOBILE[0] : OPTIONS_DESKTOP[0])
  }, []);

  const renderOptions = () => {
    return optionsQuantity.map((x, i) =>{
      const disableOption = x !== parseInt(x, 10);
      return (
        <option key={"option_" + i} value={x} disabled={disableOption}>
          {x}
        </option>
      );
    } 
    )
  }

  return (
    <div>
      <div className="left">
        <div>
          Give an affected person a QR plate to help him earn through digital
          donations!
        </div>
        <div>
          <p className="">
            <span
              className="text-btn"
              onClick={() => Functions.popup(POPUP.TUT_PRINT)}
            >
              How to print?
            </span>
          </p>
        </div>
        <div className="form-group mb-25 center">
          <label htmlFor="qr-code-select">How many QR plates to create?</label>
          <select
            onChange={(e) => onChange(e.target.value)}
            value={amount}
            className="center form-control"
            id="qr-code-select"
          >
            {renderOptions()}
          </select>
        </div>
        <div className="center">
          <div
            href="#"
            className="button solid-btn"
            onClick={() => props.create(amount)}
          >
            <img src="/img/qr.svg" alt="qr" />
            Generate the codes!
          </div>
        </div>
        <br />
        <div className="video-container mb-12">
          <video
            className="video-container-qrprint"
            width="100%"
            autoPlay
            loop
            muted
            playsInline
            alt="printing qr plate"
            poster="img/anim-qrprint.jpg"
          >
            <source src="img/anim-qrprint.mov" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
};
