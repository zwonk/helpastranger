import React, { useEffect } from "react";

import { withRouter } from "react-router-dom";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import Popup from "components/popup/Popup";
import PopupError from "components/popup/PopupError";
import PopupDonationInfo from "components/popup/PopupDonationInfo";
import PopupDonate from "components/popup/PopupDonate";
import PopupDonationFinished from "components/popup/PopupDonationFinished";
import PopupDonationSaved from "components/popup/PopupDonationSaved";
import PopupCashout from "components/popup/PopupCashout";
import PopupCashoutDelivery from "components/popup/PopupCashoutDelivery";
import PopupCashoutInfo from "components/popup/PopupCashoutInfo";
import PopupCashoutSendback from "components/popup/PopupCashoutSendback";
import PopupWithdraw from "components/popup/PopupWithdraw";
import PopupWithdrawInfo from "components/popup/PopupWithdrawInfo";
import PopupWithdrawal from "components/popup/PopupWithdrawal";
import PopupWithdrawalView from "components/popup/PopupWithdrawalView";
import PopupWithdrawalDelivered from "components/popup/PopupWithdrawalDelivered";
import PopupWithdrawalSendback from "components/popup/PopupWithdrawalSendback";
import PopupQrCreate from "components/popup/PopupQrCreate";
import PopupQrProcessing from "components/popup/PopupQrProcessing";
import PopupQrCreateFinished from "components/popup/PopupQrCreateFinished";
import PopupRecurrentCreate from "components/popup/PopupRecurrentCreate";
import PopupRecurrentView from "components/popup/PopupRecurrentView";
import PopupEditUser from "components/popup/PopupEditUser";
import PopupApply from "components/popup/PopupApply";
import PopupApplyInfo from "components/popup/PopupApplyInfo";
import PopupDeleteUser from "components/popup/PopupDeleteUser";
import PopupReport from "components/popup/PopupReport";
import PopupCampaignsView from "components/popup/PopupCampaignsView";
import PopupChargeAccount from "components/popup/PopupChargeAccount";
import PopupChangeCurrency from "components/popup/PopupChangeCurrency";
import TUT_PRINT from "components/tutorial/TUT_PRINT";
import TUT_IOTA_SUSTAINABLE from "components/tutorial/TUT_IOTA_SUSTAINABLE";
import TUT_IOTA_SENDING from "components/tutorial/TUT_IOTA_SENDING";
import TUT_IOTA_EXTERNAL_ACCOUNT from "components/tutorial/TUT_IOTA_EXTERNAL_ACCOUNT";
import TUT_IOTA_WITHDRAWAL from "components/tutorial/TUT_IOTA_WITHDRAWAL";
import TUT_IOTA_NETWORK from "components/tutorial/TUT_IOTA_NETWORK";
import TUT_IOTA_VERIFY from "components/tutorial/TUT_IOTA_VERIFY";
import TUT_CASHOUT from "components/tutorial/TUT_CASHOUT";

import PopupSignForm from "components/popup/PopupSignForm";
import PopupSignFormComplete from "components/popup/PopupSignFormComplete";
import PopupSignFormForgotPassw from "components/popup/PopupSignFormForgotPassw";
import PopupSignFormTerms from "components/popup/PopupSignFormTerms";
import PopupMemberInfo from "components/popup/PopupMemberInfo";

import PS from "constants/PopupStatus.constants";
import POPUP from "constants/Popup.constants";
import VIEWS from "constants/Views.constants";
import TUT_HEADERS from "constants/TutorialHeaders.constants";

import CaptchaedFunctions from "functions/CaptchaedFunctions";
import DoubleCaptchaedFunctions from "functions/DoubleCaptchaedFunctions";
import Functions from "functions/FunctionsMain";
import utils from "functions/utils/utils";

import popupContentFuse from "functions/popupContentFuse";

import store from "reducers/store";

import { useSelector, useDispatch } from "react-redux";
import { showModal } from "reducers/slices/topModalSlice";
import { popup as popupFn, redirect } from "reducers/slices/popupSlice";

export default withRouter((props) => {
  const dispatch = useDispatch();

  const popup = useSelector((state) => state.popup.popup);
  const popupContentHash = useSelector((state) => state.popup.popupContentHash);

  /***** DATA FUSION ****/

  const popupMeta = useSelector((state) => state.popup);
  const affectedDataMeta = useSelector((state) => state.affectedData);
  const accountViewData = useSelector((state) => state.accountViewData);
  const options = useSelector((state) => state.options);
  const data = useSelector((state) => state.data);
  const homeViewData = useSelector((state) => state.homeViewData);
  const adminData = useSelector((state) => state.adminData);

  const { executeRecaptcha } = useGoogleReCaptcha();
  const captchaedFunctions = new CaptchaedFunctions(executeRecaptcha);
  const doubleCaptchaedFunctions = new DoubleCaptchaedFunctions(
    captchaedFunctions,
    executeRecaptcha
  );

  useEffect(() => {
    console.log("POPUP");

    const HOME_MAP_VIEWS = [POPUP.HOME_MAP_AFFECTED_INFO];

    const AFFECTED_EXTENDED_VIEWS = [
      POPUP.ACCOUNT_DONATION_INFO,
      POPUP.HOME_MAP_AFFECTED_INFO,
      POPUP.WITHDRAW,
      POPUP.WITHDRAWAL_VIEW,
      POPUP.WITHDRAWAL_SENDBACK,
      POPUP.QR_INFO,
      POPUP.RECURRENT_VIEW,
    ];

    const DONATION_CAMPAIGN_VIEWS = [
      POPUP.ACCOUNT_DONATION_INFO,
      POPUP.RE_DONATE,
      POPUP.QR_RECOGNIZED,
    ];

    const EXTENDED_VIEWS = AFFECTED_EXTENDED_VIEWS.concat(
      DONATION_CAMPAIGN_VIEWS
    );

    let f;

    const url = props.location.pathname;
    const isUrlHome = url === "/" + VIEWS.ACCOUNT;

    if (isUrlHome || EXTENDED_VIEWS.includes(popup.last())) {
      // just to know what to fetch
      f = popupContentFuse({
        popupMeta,
        adminData,
        affectedDataMeta,
        accountViewData,
        homeViewData,
        options,
        data,
      });
    }

    if (f && f.itemData) {
      const updateRequiredExtended =
        !f.affectedExtendedTimestamp ||
        f.affectedExtendedTimestamp < new Date().getTime() - utils.TEN_SEC;

      if (updateRequiredExtended)
        captchaedFunctions.fetchToAffectedDataExtended(
          f.itemData.affected_id,
          null
        );

      const updateRequiredLocations =
        !f.affectedLocationsTimestamp ||
        f.affectedLocationsTimestamp < new Date().getTime() - utils.TWO_MIN;

      if (updateRequiredLocations)
        captchaedFunctions.fetchToAffectedLocations(f.itemData.affected_id);

      if (
        HOME_MAP_VIEWS.includes(popup.last()) ||
        !f.affectedData ||
        Object.keys(f.affectedData).length === 0
      )
        captchaedFunctions.fetchToAffectedData(f.itemData.affected_id);

      if (DONATION_CAMPAIGN_VIEWS.includes(popup.last())) {
        if (
          f.itemData &&
          (!f.campaign || f.campaign.campaigns_id !== f.itemData.campaigns_id)
        )
          captchaedFunctions.fetchCampaignToData(f.itemData.campaigns_id);
      }
    }
  }, [popup, popupContentHash]);

  const renderPopup = (popup) => {
    // fused popup data from reducers
    let fusedData = popupContentFuse({
      popupMeta,
      adminData,
      affectedDataMeta,
      accountViewData,
      homeViewData,
      options,
      data,
    });

    //const popupTmp = POPUP.ACCOUNT_DONATION_INFO;
    console.log("--------");
    console.log("popup.last(): " + popup.last());
    console.log(store.getState());
    console.log(fusedData);

    if (popup.last() && popup.last().startsWith("TUT")) {
      const tutComponentsMap = {
        TUT_PRINT,
        TUT_IOTA_SUSTAINABLE,
        TUT_IOTA_SENDING,
        TUT_IOTA_WITHDRAWAL,
        TUT_IOTA_NETWORK,
        TUT_IOTA_VERIFY,
        TUT_IOTA_EXTERNAL_ACCOUNT,
        TUT_CASHOUT,
      };

      /***** TUTORIALS *****/
      const TutorialContainer = tutComponentsMap[popup.last()];

      return (
        <Popup
          ps={PS.NONE}
          pn={TUT_HEADERS[popup.last()]}
          back={true}
          close={true}
        >
          <TutorialContainer fusedData={fusedData} />
        </Popup>
      );
    }

    switch (popup.last()) {
      /****************/
      /** DONATIONS **/
      /****************/

      case POPUP.QR_RECOGNIZED:
        return (
          <PopupDonateViewTemplate
            pn={"QR code recognized!"}
            captchaedFunctions={captchaedFunctions}
            fusedData={fusedData}
            back={false}
            modal={(arr) => dispatch(showModal(arr))}
          />
        );

      case POPUP.HOME_MAP_DONATE:
        return (
          <PopupDonateViewTemplate
            pn={"Donate now"}
            captchaedFunctions={captchaedFunctions}
            fusedData={fusedData}
            back={true}
            modal={(arr) => dispatch(showModal(arr))}
          />
        );

      case POPUP.RE_DONATE:
        return (
          <PopupDonateViewTemplate
            pn={"Re-donate"}
            captchaedFunctions={captchaedFunctions}
            fusedData={fusedData}
            back={true}
            modal={(arr) => dispatch(showModal(arr))}
          />
        );

      case POPUP.DONATION_FINISHED:
        return (
          <Popup
            ps={PS.GREEN}
            pn="Donation sent"
            close={() =>
              fusedData.pending
                ? Functions.popupCloseDonation()
                : Functions.popupClose()
            }
          >
            <PopupDonationFinished
              fusedData={fusedData}
              caller="campaign"
              save={() => captchaedFunctions.saveDonation(fusedData)}
              close={() => Functions.popupCloseDonation()}
              signform={() => captchaedFunctions.signform(VIEWS.ACCOUNT)}
              account={() => {
                dispatch(popupFn(null));
                dispatch(redirect("/" + VIEWS.ACCOUNT));
              }}
            />
          </Popup>
        );

      case POPUP.SAVED_DONATION:
        return (
          <Popup ps={PS.GREEN} pn="Saved donation!" close={true}>
            <PopupDonationSaved
              fusedData={fusedData}
              next={() => dispatch(popupFn(POPUP.ACCOUNT))}
            />
          </Popup>
        );

      case POPUP.ACCOUNT_DONATION_INFO:
        return (
          <Popup
            ps={
              fusedData.itemData.tab === "donations"
                ? !fusedData.itemData.txhash
                  ? PS.ORANGE
                  : PS.GREEN
                : PS.NONE
            }
            pn={
              fusedData.itemData.tab === "donations"
                ? !fusedData.itemData.txhash
                  ? "Transaction pending"
                  : "Donation Info"
                : "Saved donation"
            }
            close={true}
          >
            <PopupDonationInfo
              fusedData={fusedData}
              changeInfos={(obj) => captchaedFunctions.changeInfos(obj)}
              startMembershipApply={() => Functions.startMembershipApply()}
              startDonation={() => Functions.startDonation()}
              startCampaign={() => Functions.startCampaign()}
              startRecurrent={() =>
                Functions.startRecurrent(fusedData.itemData)
              }
              startCashout={() => Functions.startCashout(fusedData.itemData)}
              deleteEntry={() =>
                captchaedFunctions.deleteSaved(fusedData.itemData.id)
              }
              modal={(arr) => dispatch(showModal(arr))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      /***** AFFECTED ******/

      case POPUP.HOME_MAP_AFFECTED_INFO:
        return (
          <Popup ps={PS.NONE} pn="Beneficiary info" close={true}>
            <PopupDonationInfo
              fusedData={fusedData}
              caller={POPUP.HOME_MAP_AFFECTED_INFO}
              changeInfos={(obj) => captchaedFunctions.changeInfos(obj)}
              startDonation={() => dispatch(popupFn(POPUP.HOME_MAP_DONATE))}
              startCampaign={() => Functions.startCampaign()}
              startRecurrent={() => Functions.startRecurrent()}
              startCashout={() => Functions.startCashout()}
              modal={(arr) => dispatch(showModal(arr))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      /***** SIGNIN *******/

      case POPUP.SIGNFORM_TERMS:
        return (
          <Popup ps={PS.NONE} pn="Signup Terms" back={true} close={true}>
            <PopupSignFormTerms />
          </Popup>
        );

      case POPUP.SIGNFORM:
        return (
          <Popup ps={PS.NONE} pn="Sign in / Sign up" close={true}>
            <PopupSignFormTemplate
              captchaedFunctions={captchaedFunctions}
              homeViewData={homeViewData}
              redirect={"/" + VIEWS.ACCOUNT}
            />
          </Popup>
        );

      case POPUP.SIGNFORM_ADMIN:
        return (
          <Popup ps={PS.NONE} pn="Sign in admin" close={true}>
            <PopupSignForm
              back={null}
              showTerms={() => props.captchaedFunctions.startShowTerms()}
              startForgotPassw={() =>
                dispatch(showModal("Request per mail if you're an admin."))
              }
              signup={(form) =>
                dispatch(showModal("Request per mail if you're an admin."))
              }
              signin={(form) =>
                captchaedFunctions.signFormWithFollowAction({
                  signFormAction: "signInAdmin",
                  data: form,
                  followAction: null,
                  redirect: VIEWS.ADMIN,
                })
              }
            />
          </Popup>
        );

      case POPUP.SIGNFORM_TO_MAIN:
        return (
          <Popup ps={PS.NONE} pn="Sign in / Sign up" close={true}>
            <PopupSignFormTemplate
              showTerms={() => dispatch(popupFn(POPUP.SIGNFORM_TERMS))}
              captchaedFunctions={captchaedFunctions}
              homeViewData={homeViewData}
              redirect={"/" + VIEWS.ACCOUNT}
            />
          </Popup>
        );

      case POPUP.SIGNFORMBACK:
        return (
          <Popup ps={PS.NONE} pn="Sign in / Sign up" back={true} close={true}>
            <PopupSignFormTemplate
              captchaedFunctions={captchaedFunctions}
              homeViewData={homeViewData}
              redirect={null}
            />
          </Popup>
        );

      case POPUP.SIGNFORMCOMPLETE:
        return (
          <Popup ps={PS.GREEN} pn="Signing in" close={true}>
            <PopupSignFormComplete />
          </Popup>
        );

      case POPUP.SIGNFORM_FORGOT_PASSW:
        return (
          <Popup ps={PS.NONE} pn="Recover Password" back={true} close={true}>
            <PopupSignFormForgotPassw
              sendPassw={(str) => captchaedFunctions.sendPassw(str)}
              modal={(arr) => dispatch(showModal(arr))}
            />
          </Popup>
        );

      /***** CASHOUT ******/

      case POPUP.CASHOUT:
        return (
          <Popup ps={PS.NONE} pn="Cashout" back={true} close={true}>
            <PopupCashout
              caller={POPUP.CASHOUT}
              fusedData={fusedData}
              cashout={(obj) => captchaedFunctions.cashout(obj)}
              modal={(arr) => dispatch(showModal(arr))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.CASHOUT_DELIVERY:
        return (
          <Popup ps={PS.NONE} pn="Cashout Delivery" close={true}>
            <PopupCashoutDelivery
              fusedData={fusedData}
              sendBack={() =>
                captchaedFunctions.cashoutSendBack(fusedData.itemData)
              }
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.CASHOUT_INFO:
        return (
          <Popup
            ps={
              !fusedData.itemData.txhash ||
              (fusedData.itemData.sendback &&
                !fusedData.itemData.sendback_txhash)
                ? PS.ORANGE
                : PS.GREEN
            }
            pn={
              !fusedData.itemData.txhash
                ? "Cashout processing"
                : fusedData.itemData.sendback
                ? fusedData.itemData.sendback_txhash
                  ? "Sendback info"
                  : "Sendback processing"
                : "Cashout info"
            }
            close={true}
          >
            <PopupCashoutInfo
              fusedData={fusedData}
              caller={POPUP.CASHOUT_INFO}
              startSendBack={() => captchaedFunctions.startCashoutSendBack()}
              modal={(str) => dispatch(showModal(str))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.CASHOUT_SENDBACK:
        return (
          <Popup ps={PS.NONE} pn="Send back?" close={true}>
            <PopupCashoutSendback
              fusedData={fusedData}
              sendBack={() =>
                captchaedFunctions.cashoutSendBack(fusedData.itemData)
              }
              modal={(str) => dispatch(showModal(str))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      /*** PRIVATE_KEY_BOX FROM ACCOUNT_DETAILS ***/
      case POPUP.PRIVATE_KEY_BOX:
        return (
          <Popup ps={PS.NONE} pn="Private Key" close={true}>
            <div className="mb-25">
              <b>
                Store this mnemonic (other form of private key) only on paper:
              </b>
              <br />
              {fusedData.accountViewData[VIEWS.ACCOUNT_DETAILS].private_key}
            </div>
          </Popup>
        );

      /***** WITHDRAW ******/

      case POPUP.WITHDRAW:
        return (
          <Popup ps={PS.NONE} pn="Withdraw" back={true} close={true}>
            <PopupWithdraw
              fusedData={fusedData}
              withdraws={(obj) => captchaedFunctions.withdraws(obj)}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.WITHDRAW_INFO:
        return (
          <Popup
            ps={!fusedData.itemData.txhash ? PS.ORANGE : PS.GREEN}
            pn={
              !fusedData.itemData.txhash
                ? "Withdrawal processing"
                : "Withdrawal info"
            }
            close={true}
          >
            <PopupWithdrawInfo
              fusedData={fusedData}
              caller={POPUP.WITHDRAW_INFO}
              modal={(str) => dispatch(showModal(str))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      /***** WITHDRAWAL (INACTIVE) ******/

      case POPUP.WITHDRAWAL:
        return (
          <Popup ps={PS.NONE} pn="Withdraw" back={true} close={true}>
            <PopupWithdrawal
              caller={POPUP.WITHDRAWAL}
              fusedData={fusedData}
              withdraw={(obj) => captchaedFunctions.withdraw(obj)}
              report={() => Functions.report()}
            />
          </Popup>
        );

      case POPUP.WITHDRAWAL_VIEW:
        return (
          <Popup
            ps={!fusedData.itemData.txhash ? PS.ORANGE : PS.GREEN}
            pn={
              !fusedData.itemData.txhash
                ? "Withdrawal processing"
                : "Withdrawal info"
            }
            close={true}
          >
            <PopupWithdrawalView
              fusedData={fusedData}
              caller={POPUP.WITHDRAWAL_VIEW}
              deliver={() => captchaedFunctions.deliver(fusedData.itemData)}
              sendBack={() => captchaedFunctions.sendBack(fusedData.itemData)}
              modal={(str) => dispatch(showModal(str))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.WITHDRAWAL_DELIVERED:
        return (
          <Popup ps={PS.NONE} pn="Delivered" close={true}>
            <PopupWithdrawalDelivered
              fusedData={fusedData}
              undeliver={() => captchaedFunctions.deliver(fusedData.itemData)}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.WITHDRAWAL_SENDBACK:
        return (
          <Popup ps={PS.NONE} pn="Send back" close={true}>
            <PopupWithdrawalSendback
              fusedData={fusedData}
              modal={(str) => dispatch(showModal(str))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      /***** QR *****/

      case POPUP.QR_CREATE:
        return (
          <Popup ps={PS.NONE} pn="Create a QR plate" close={true}>
            <PopupQrCreate
              fusedData={fusedData}
              create={(amount) =>
                doubleCaptchaedFunctions.qr_create(amount, utils.isMobile())
              }
            />
          </Popup>
        );

      case POPUP.QR_PROCESSING:
        return (
          <Popup ps={PS.NONE} pn="Processing QR code" close={true}>
            <PopupQrProcessing
              fusedData={fusedData}
              save={() => captchaedFunctions.saveForLater()}
            />
          </Popup>
        );

      case POPUP.QR_CREATE_FINISHED:
        return (
          <Popup
            ps={PS.NONE}
            pn="Create a QR plate"
            back={true}
            close={
              utils.getCachedUsersId()
                ? () => {
                    dispatch(showModal("QR code saved"));
                    Functions.popupClose();
                  }
                : () => Functions.popupClose()
            }
          >
            <PopupQrCreateFinished
              fusedData={fusedData}
              signform={() => captchaedFunctions.signform(VIEWS.ACCOUNT)}
              save={
                utils.getCachedUsersId()
                  ? () => {
                      dispatch(showModal("QR code saved"));
                      Functions.popupClose();
                    }
                  : () => Functions.popupClose()
              }
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.QR_INFO:
        return (
          <Popup ps={PS.GREEN} pn="QR code in use" close={true}>
            <PopupDonationInfo
              fusedData={fusedData}
              caller={POPUP.QR_INFO}
              changeInfos={(obj) => captchaedFunctions.changeInfos(obj)}
              startDonation={() => Functions.startDonation()}
              startRecurrent={() => Functions.startRecurrent()}
              startCashout={() => Functions.startCashout()}
              startCampaign={() => Functions.startCampaign()}
              tab={"saved"}
              modal={(arr) => dispatch(showModal(arr))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      /***** RECURRENT (INACTIVE) *****/

      case POPUP.RECURRENT_CREATE:
        return (
          <Popup ps={PS.NONE} pn="Create a recurrent payment" close={true}>
            <PopupRecurrentCreate
              fusedData={fusedData}
              makeRecurrent={(obj) => captchaedFunctions.makeRecurrent(obj)}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.RECURRENT_VIEW:
        return (
          <Popup ps={PS.NONE} pn="Your recurrent payment" close={true}>
            <PopupRecurrentView
              fusedData={fusedData}
              changeInfos={(obj) => captchaedFunctions.changeInfos(obj)}
              changeRecurrent={(obj) => captchaedFunctions.changeRecurrent(obj)}
              toggleRecurrent={(obj) => captchaedFunctions.toggleRecurrent(obj)}
              deleteRecurrent={() =>
                captchaedFunctions.deleteRecurrent(fusedData.itemData)
              }
              modal={(arr) => dispatch(showModal(arr))}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      /***** CAMPAIGNS (INACTIVE) *****/

      case POPUP.CAMPAIGNS_WITHDRAW:
        return (
          <Popup
            ps={PS.NONE}
            pn="Withdraw for campaign"
            back={true}
            close={true}
          >
            <PopupWithdrawal
              fusedData={fusedData}
              caller={POPUP.CAMPAIGNS_WITHDRAW}
              withdraw={(obj) => captchaedFunctions.campaignsWithdraw(obj)}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.CAMPAIGNS_VIEW:
        return (
          <Popup ps={PS.NONE} pn="Campaigns view" close={true}>
            <PopupCampaignsView
              fusedData={fusedData}
              onSubmit={(obj) =>
                captchaedFunctions.changeCampaignsInfo({
                  campaigns_id: fusedData.itemData.campaigns_id,
                  ...obj,
                })
              }
              onDelete={() =>
                captchaedFunctions.campaignsDelete({
                  campaigns_id: fusedData.itemData.campaigns_id,
                })
              }
              startCashout={() => Functions.startCashout()}
            />
          </Popup>
        );

      case POPUP.CAMPAIGNS_CREATE:
        return (
          <Popup ps={PS.NONE} pn="Create campaign" close={true}>
            <PopupCampaignsView
              fusedData={fusedData}
              caller={POPUP.CAMPAIGNS_CREATE}
              onSubmit={(obj) => captchaedFunctions.campaignsCreate(obj)}
            />
          </Popup>
        );

      /***** USERS *****/

      case POPUP.EDIT_USERS:
        return (
          <Popup ps={PS.NONE} pn="Edit user infos" close={true}>
            <PopupEditUser
              fusedData={fusedData}
              onSubmit={(obj) => captchaedFunctions.changeUserInfo(obj)}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.APPLY_MEMBERSHIP_0:
        return (
          <Popup
            ps={PS.NONE}
            pn="Become a verified member"
            close={true}
            back={true}
          >
            <PopupApplyInfo
              fusedData={fusedData}
              signform={() =>
                captchaedFunctions.signform(POPUP.APPLY_MEMBERSHIP_0)
              }
              loadMembershipApplyScreen={() =>
                captchaedFunctions.loadMembershipApplyScreen()
              }
              report={() => captchaedFunctions.startReport()}
            />
          </Popup>
        );

      case POPUP.APPLY_MEMBERSHIP_1:
        return (
          <Popup ps={PS.NONE} pn="Step 1: Check your details" close={true}>
            <PopupEditUser
              fusedData={fusedData}
              modal={(str) => dispatch(showModal(str))}
              onSubmit={(obj) => captchaedFunctions.changeUserInfo(obj)}
              startMembershipApplySubmit={(obj) =>
                captchaedFunctions.startMembershipApplySubmit(obj)
              }
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.APPLY_MEMBERSHIP_2:
        return (
          <Popup
            ps={PS.NONE}
            pn="Step 2: Submit application"
            close={true}
            back={true}
          >
            <PopupApply
              fusedData={fusedData}
              membershipApply={(obj) => captchaedFunctions.membershipApply(obj)}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.DELETE_USERS:
        return (
          <Popup ps={PS.NONE} pn="Delete user" close={true}>
            <PopupDeleteUser
              fusedData={fusedData}
              deleteUser={() => captchaedFunctions.deleteUser()}
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      case POPUP.CHARGE_ACCOUNT:
      case POPUP.CHARGE_ACCOUNT_BACK:
        return (
          <Popup
            ps={PS.NONE}
            pn="Charge your account directly"
            close={true}
            back={popup.last() === POPUP.CHARGE_ACCOUNT_BACK}
          >
            <PopupChargeAccount fusedData={fusedData} />
          </Popup>
        );

      /***** ADMIN *****/

      case POPUP.ADMIN_MEMBER_INFO:
        return (
          <Popup ps={PS.NONE} pn="Edit member status" close={true}>
            <PopupMemberInfo
              fusedData={fusedData}
              adminsAction={(id, action) =>
                captchaedFunctions.adminsAction(id, action)
              }
              report={() => Functions.startReport()}
            />
          </Popup>
        );

      /***** .. *****/

      case POPUP.REPORT_FORM:
        return (
          <Popup ps={PS.NONE} pn="Report problem" back={true} close={true}>
            <PopupReport
              report={(content) =>
                captchaedFunctions.report({
                  content,
                  context: fusedData.itemData,
                  view: popup.get(popup.size - 2),
                })
              }
            />
          </Popup>
        );

      case POPUP.CHANGE_CURRENCY:
        return (
          <Popup ps={PS.NONE} pn="Change currency" back={false} close={true}>
            <PopupChangeCurrency
              changeCurrency={(content) => Functions.changeCurrency(content)}
            />
          </Popup>
        );

      case POPUP.ERROR:
        return (
          <Popup ps={PS.RED} pn="An error occured." back={true} close={true}>
            <PopupError fusedData={fusedData} />
          </Popup>
        );

      default:
        return "";
    }
  };

  return renderPopup(popup);
});

const PopupSignFormTemplate = (
  props //"/" + VIEWS.ACCOUNT
) => (
  <PopupSignForm
    back={null}
    startForgotPassw={() => props.captchaedFunctions.startForgotPassw()}
    showTerms={() => props.captchaedFunctions.startShowTerms()}
    signup={(form) =>
      props.captchaedFunctions.signFormWithFollowAction({
        signFormAction: "signUp",
        data: form,
        followAction: props.homeViewData.followAction,
        redirect: props.redirect,
      })
    }
    signin={(form) =>
      props.captchaedFunctions.signFormWithFollowAction({
        signFormAction: "signIn",
        data: form,
        followAction: props.homeViewData.followAction,
        redirect: props.redirect,
      })
    }
  />
);

const PopupDonateViewTemplate = ({
  captchaedFunctions,
  pn,
  fusedData,
  back,
  modal,
}) => (
  <div>
    <Popup
      ps={PS.GREEN}
      pn={pn}
      close={true}
      back={back}
      classDesc={
        fusedData.itemData && fusedData.itemData.title
          ? "straightBottomBorders"
          : ""
      }
    >
      <PopupDonate
        fusedData={fusedData}
        donate={(obj) => captchaedFunctions.donate(obj)}
        startCashout={() => captchaedFunctions.startCashout()}
        signform={() => captchaedFunctions.signform(null)}
        back={back}
        modal={(arr) => modal(arr)}
      />
    </Popup>
  </div>
);
