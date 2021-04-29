import React from "react";

import { useDispatch } from "react-redux";

import POPUP from "constants/Popup.constants";

import utils from "functions/utils/utils";

import { setReaderActivity } from "reducers/slices/homeViewDataSlice";
import { popup as popupFn } from "reducers/slices/popupSlice";

export default (props) => {
  const dispatch = useDispatch();

  return (
    <div id="Footer">
      {/*<!-- footer area start -->*/}
      <footer
        className="wow animate__animated animate__fadeInUp"
        data-wow-delay=".2s"
        data-wow-duration="0.9s"
      >
        <div className="container">
          <div className="row">
            <div className="col">
              <ul className="foot-menu">
                <li>
                  <a
                    href="/#Home"
                    onClick={() => dispatch(setReaderActivity(true))}
                  >
                    scan
                  </a>
                </li>
                <li>
                  <a href="/#process">process</a>
                </li>
                <li>
                  <span onClick={() => dispatch(popupFn(POPUP.REPORT_FORM))}>
                    Report problem
                  </span>
                </li>
                <li>
                  <span
                    onClick={() => dispatch(popupFn(POPUP.CHANGE_CURRENCY))}
                  >
                    change - {utils.getCrncySign()}
                  </span>
                </li>
              </ul>
            </div>{" "}
            {/*<!-- col end -->*/}
            <div className="col-5">
              <ul className="foot-menu">
                <li>
                  <span onClick={() => dispatch(popupFn(POPUP.SIGNFORM))}>
                    login / signup
                  </span>
                </li>
                <li>
                  <a href="/account">account</a>
                </li>
                <li>
                  <span
                    onClick={() => dispatch(popupFn(POPUP.APPLY_MEMBERSHIP_0))}
                  >
                    become verified
                  </span>
                </li>
              </ul>
            </div>{" "}
            {/*<!-- col end -->*/}
            <div className="col">
              <ul className="foot-menu">
                <li>
                  <a href="/terms">terms</a>
                </li>
                <li>
                  <a href="/about">about</a>
                </li>
                <li>
                  <a href="/imprint">Imprint</a>
                </li>
                {/*<li>
                  <a href="/faq">FAQ</a>
                </li>*/}
              </ul>
            </div>{" "}
            {/*<!-- col end -->*/}
          </div>{" "}
          {/*<!-- row end -->*/}
          <hr />
          <div className="foot-menu-bottom small">
            © Help A Stranger 2022
            <br />
            by{" "}
            <a className="light-grey" href="/about">
              Help A Stranger Collective
            </a>
            <br />
            <i class="fab fa-github"></i> Open-source{" "}
            <a className="light-grey" href="https://github.com/zwonk/helpastranger">
              code
            </a>
            <br />
            <i class="fab fa-ethereum"></i> Commercial rights for for-profit use of this software
            are held by the owner of{" "}
            <a className="light-grey" href="https://opensea.io/">
              this NFT.
            </a>
          </div>
        </div>{" "}
        {/*<!-- container end -->*/}
      </footer>
      {/*<!-- footer area end -->*/}
    </div>
  );
};
