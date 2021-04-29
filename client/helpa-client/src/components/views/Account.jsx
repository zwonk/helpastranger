import React, { useEffect } from "react";

import {
  useGoogleReCaptcha
} from 'react-google-recaptcha-v3';

import {
  ACCOUNT_DETAILS,
  ACCOUNT_STATISTICS,
  ACCOUNT_SETTINGS,
} from "components/dumb/AccountView/AccountViewNoCardsWrapper";

import ACCOUNT_VIEW from "components/dumb/AccountView/AccountViewWrapper";

import {
  ACCOUNT_CARDS,
} from "components/dumb/AccountView/AccountViewCardsWrapper";

import AccountViewSwitcher from "components/dumb/AccountView/AccountViewSwitcher";

import POPUP from "constants/Popup.constants";
import VIEWS from "constants/Views.constants";
import VIEW_TEXTS from "constants/ViewTexts.constants";

import { useSelector, useDispatch } from "react-redux";
import { showModal } from "reducers/slices/topModalSlice";
import { popup as popupFn, updatePopupContent } from "reducers/slices/popupSlice";

import CaptchaedFunctions from "functions/CaptchaedFunctions";
import Functions from "functions/FunctionsMain";
import utils from "functions/utils/utils";

export default (props) => {
  
  useEffect(() => {
    captchaedFunctions.switchAccountView(0, null, null);
  }, []);

  const dispatch = useDispatch();

  const { executeRecaptcha } = useGoogleReCaptcha();
  const captchaedFunctions = new CaptchaedFunctions(executeRecaptcha);

  const viewIndex = useSelector((state) => state.accountViews.viewIndex);
  const options = useSelector((state) => state.accountViews.options);
  const dataStartIndex = useSelector(
    (state) => state.accountViews.dataStartIndex
  );
  const affectedData = useSelector((state) => state.affectedData);
  const accountViewData = useSelector((state) => state.accountViewData);
  const meme = useSelector((state) => state.data.meme);

  const switchAccountViewWithRefresh = (i) =>
    captchaedFunctions.switchAccountView(i, true, null);

  const loadMore = (view) => {
    const viewIndex = options.findIndex((x) => x === view);
    let start = dataStartIndex.get(viewIndex);
    start += utils.LIMIT;
    captchaedFunctions.switchAccountView(0, true, start);
  };

  const handleContentClick = (content, i, view) => {
    dispatch(updatePopupContent({view, i}));

    switch (view) {
      case VIEWS.ACCOUNT_LAST_DONATIONS:
        dispatch(popupFn(POPUP.ACCOUNT_DONATION_INFO));
        break;

      case VIEWS.ACCOUNT_QR_CODE_PRINTS:
        if (content.tab === "Created")
          dispatch(popupFn(POPUP.QR_CREATE_FINISHED));
        else dispatch(popupFn(POPUP.QR_INFO));
        break;

      case VIEWS.ACCOUNT_CASHOUTS:
        dispatch(popupFn(POPUP.CASHOUT_INFO));
        break;

      case VIEWS.ACCOUNT_WITHDRAWS:
        dispatch(popupFn(POPUP.WITHDRAW_INFO));
        break;

      case VIEWS.ACCOUNT_RECURRENT_PAYMENTS:
        dispatch(popupFn(POPUP.RECURRENT_VIEW));
        break;

      case VIEWS.ACCOUNT_CAMPAIGNS:
        if (content.delivered_state)
          dispatch(popupFn(POPUP.WITHDRAWAL_DELIVERED));
        else if (content.sendback) dispatch(popupFn(POPUP.WITHDRAWAL_SENDBACK));
        else dispatch(popupFn(POPUP.CAMPAIGNS_VIEW));
        break;

      default:
        break;
    }
  };

  const renderContent = () => {
    const view = options[viewIndex];

    const ACCOUNT_CARD_VIEWS = [
      VIEWS.ACCOUNT_LAST_DONATIONS,
      VIEWS.ACCOUNT_QR_CODE_PRINTS,
      VIEWS.ACCOUNT_CASHOUTS,
      VIEWS.ACCOUNT_WITHDRAWS,
      VIEWS.ACCOUNT_RECURRENT_PAYMENTS,
      VIEWS.ACCOUNT_CAMPAIGNS,
    ];

    const renderContentCards = (props) => {
      if (ACCOUNT_CARD_VIEWS.includes(view))
      return (
        <ACCOUNT_CARDS
          loadMore={() => loadMore(view)}
          data={accountViewData}
          affectedData={affectedData}
          view={view}
          handleContentClick={(content, i) =>
            handleContentClick(content, i, view)
          }
        />
      );
      else if (view === VIEWS.ACCOUNT_DETAILS)
        return (
          <ACCOUNT_DETAILS
            data={accountViewData}
            startWithdraw={() => Functions.startWithdraw()}
            modal={(str) => dispatch(showModal(str))}
          />
        );
      else if (view === VIEWS.ACCOUNT_STATISTICS)
        return (
          <ACCOUNT_STATISTICS data={accountViewData} />
        );
      else if (view === VIEWS.ACCOUNT_SETTINGS)
        return (
          <ACCOUNT_SETTINGS
            startMembershipApply={() => Functions.startMembershipApply()}
            signOut={() => {Functions.signOut(); Functions.redirect(VIEWS.SIGNOUT)}}
            onEditUser={() => captchaedFunctions.onEditUser()}
            deleteAccount={() => captchaedFunctions.deleteAccount()}
            data={accountViewData}
          />
        );
    };

    return (
      <ACCOUNT_VIEW data={accountViewData} view={view}>
        {renderContentCards(props)}
      </ACCOUNT_VIEW>
    );
  };

  const viewText = VIEW_TEXTS[options[viewIndex]]; // TODO optionsText instead of options

  return (
    <div id="Account">
      {!utils.getCachedUsersId() ? (
        <div>
          <div className="col-12 mb-55 container"></div>
          <div className="col-12 mb-55 container center">
            <h2>Please login</h2>
            <div>
              <img alt="spinner" width="200" src="/img/spinner.svg" />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <span className="c-btn">
            <div className="pro-pic container d-flex align-items-center flex-column">
              <div
                className={
                  "pro-pic-wrapper " +
                  (meme === true ? "chart-bg" : meme ? "black" : "")
                }
              >
                {meme && meme !== true ? (
                  <img
                    alt="old-tv"
                    className="pro-pic-tube"
                    src="img/oldtv.svg"
                  ></img>
                ) : (
                  ""
                )}
                <div className="pro-pic-wrap account-img">
                  {meme === true ? (
                    <CoinChartComponent />
                  ) : meme ? (
                    <img width="100%" alt="decorative-images" src={meme} />
                  ) : (
                    "Welcome back!"
                  )}
                </div>
              </div>
              <h2>Account</h2>
            </div>
          </span>

          <AccountViewSwitcher
            pn={viewText}
            onChange={(direction) => switchAccountViewWithRefresh(direction)}
          />
          {renderContent()}
        </div>
      )}
    </div>
  );
};
var CoinChartComponent = () => (
  <div>
    <iframe
      title="iota-chart"
      src="https://widget.coinlib.io/widget?type=chart&theme=dark&coin_id=1026&pref_coin_id=1505"
      scrolling="auto"
      marginWidth={0}
      marginHeight={0}
      border={0}
      className="account-tv-iframe"
      style={{
        border: 0,
        margin: 0,
        marginLeft: 2,
        marginTop: 65.5,
        padding: 0,
        lineHeight: "14px",
      }}
      height="700px"
      width="1050px"
      frameBorder={0}
    />
  </div>
);