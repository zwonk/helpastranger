import React from "react";

import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";

export default (props) => {
  return (
    <div className="">
      <ul className="tutorial-list">
        <li>
          1.{" "}
          <b>
            <span
              className="text-btn"
              onClick={() => Functions.popup(POPUP.QR_CREATE)}
            >
              Create the codes for the plates here
            </span>
          </b>
        </li>
        <li>
          2. Use the <b>"print here"</b> button in the dialogue to print the
          pdf.
        </li>
        <li>
          3. Cut the printed DIN A4 pages <b>in half.</b>
        </li>
        <li>
          4. <b>Laminate each qr code</b> into a full DIN A4 laminate.
        </li>
        <li>
          5. IMPORTANT: <b>Reverse the qr code</b> so that it goes upside down
          into the machine!
        </li>
        <li>
          6. Take the laminate, <b>fold it in half</b>, and hold it folded for a
          minute.
        </li>
        <li>
          7. <b>Place the laminate to stand</b> in front of a person and explain
          our concept to him.
        </li>
        <li>
          8. If you can - scan the QR code immediately and{" "}
          <b>donate your GPS</b> in the donation window.
        </li>
      </ul>
      <div className="center">
        <br />
      </div>
    </div>
  );
};
