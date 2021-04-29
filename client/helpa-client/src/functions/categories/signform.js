import POPUP from "constants/Popup.constants";
import VIEWS from "constants/Views.constants";

import { api, auth, authAdmin, logout } from "functions/api";
import utils from "functions/utils/utils";

import store from "reducers/store";
import { redirect as redirectFn, popup, popupPending } from "reducers/slices/popupSlice";
import { addHomeViewData } from "reducers/slices/homeViewDataSlice";
import {
  signInErrors,
  signInSuccessful,
  signUpSuccessful,
  signUpErrors,
  signOut as signOutFn,
  signUpPage
} from "reducers/slices/authSlice";

import { showModal } from "reducers/slices/topModalSlice";

const dispatch = store.dispatch;

export default {
  signform: function (followAction = null) {
    let followActionPost = followAction || store.getState().popup.popup.last();

    dispatch(popup(POPUP.SIGNFORMBACK));
    //no captcha binding necessary as signForm only triggers followAction, the actual signin though happens through SIGNFORMBACK
    dispatch(addHomeViewData({ followAction: followActionPost }));
  },

  signFormWithFollowAction: async function (payload, captcha = null) {
    const { signFormAction, data, followAction, redirect } = payload;

    // 1. show loading screen
    dispatch(popup(POPUP.SIGNFORMCOMPLETE));

    // 2. try login

    let signInSuccess;

    if (signFormAction === "signIn")
      signInSuccess = await this.signIn(data, captcha);

    if (signFormAction === "signUp")
      signInSuccess = await this.signUp(data, captcha);

    if (signFormAction === "signInAdmin")
      signInSuccess = await this.signInAdmin(data, captcha);

    if (signInSuccess) {
      await utils.timeout(2000);

      if (
        typeof followAction === "string" &&
        Object.keys(POPUP).includes(followAction)
      ) {
        dispatch(popup(followAction));
      } else if (
        typeof followAction === "string" &&
        Object.values(VIEWS).includes(followAction)
      ) {
        dispatch(popup(null));
        dispatch(redirectFn("/" + followAction));
      } else {
        if (followAction) followAction.call(this, captcha); //TODO check if followAction names are still up to date
        dispatch(popup(null));
      }

      this.fetchMemeToData();

      if (!followAction && redirect) dispatch(redirectFn(redirect));
    } else {
      dispatch(addHomeViewData({ followAction: followAction }));
    }
  },

  signIn: async function (form, captcha = null) {
    let res = await auth({ body: { ...form }, captcha });

    dispatch(signInErrors(res));

    if (this.error(res, false)) {
      if (res && res.error) {
        dispatch(popup(POPUP.SIGNFORM_TO_MAIN));
      } else {
        dispatch(popup(POPUP.ERROR));
      }

      return false;
    }

    dispatch(signInSuccessful(res));
    utils.setCachedUsersId(res.users_id);

    this.postSignIn(captcha);

    return true;
  },

  signInAdmin: async function (form, captcha = null) {
    let res = await authAdmin({ body: { ...form }, captcha });

    dispatch(signInErrors(res));

    if (this.error(res, false)) {
      if (res && res.error) {
        dispatch(popup(POPUP.SIGNFORM_ADMIN));
      } else {
        dispatch(popup(POPUP.ERROR));
      }

      return false;
    }

    utils.setCachedUsersId(res.users_id);
    dispatch(signInSuccessful(res));

    this.postSignInAdmin(captcha);

    return true;
  },

  signUp: async function (form, captcha = null) {
    let res = await api("users_create", {
      body: form,
      captcha,
    });

    dispatch(signUpErrors(res));

    if (this.error(res, false)) {
      dispatch(signUpPage(true));
      dispatch(popup(POPUP.SIGNFORM_TO_MAIN));
      //set signform state state
      return false;
    }

    const res2 = await this.signIn(form, captcha);

    if (this.error(res2, false)) {
      return false;
    }

    dispatch(signUpSuccessful());

    //functions.postSignIn(); happens in signin already

    dispatch(showModal("Sign up successful!"));
    return true;
  },

  signOut: async function () {
    utils.clearCachedUsersId(null);
    dispatch(signOutFn());
    await logout();
  },

  postSignIn: async function (captcha = null) {
    const state = store.getState();

    if (!state.ACCOUNT_DETAILS && !state.ACCOUNT_SETTINGS)
      this.fetchToViewUsersData("postSignIn", captcha);

    if (state.data.secrets && state.data.secrets.donationSecret)
      this.reassignDonation(
        {
          secret: state.data.secrets.donationSecret,
        },
        captcha
      );

    if (state.data.secrets && state.data.secrets.qrCodeSecrets)
      this.reassignQrCode(
        {
          secrets: state.data.secrets.qrCodeSecrets,
        },
        captcha
      );
  },

  postSignInAdmin: async function (captcha = null) {
    const adminData = store.getState().adminData;

    if (!adminData.usersData) this.fetchToViewAdminData(captcha);
  },

  startForgotPassw: function () {
    dispatch(popup(POPUP.SIGNFORM_FORGOT_PASSW));
  },

  startShowTerms: function () {
    dispatch(popup(POPUP.SIGNFORM_TERMS));
  },

  sendPassw: async function (username, captcha = null) {
    dispatch(popupPending(true));
    let res = await api("users_forgot_passw", {
      body: {
        username,
      },
      captcha,
    });

    dispatch(popupPending(false));
    if (this.error(res)) return false;

    dispatch(
      showModal("If email is registered, you will receive a mail shortly!")
    );
    this.popupBack();
  },
};
