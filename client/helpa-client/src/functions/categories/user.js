import POPUP from "constants/Popup.constants";
import VIEWS from "constants/Views.constants";

import { api } from "functions/api";
import utils from "functions/utils/utils";

import store from "reducers/store";
import {
  redirect as redirectFn,
  popup,
  popupPending,
} from "reducers/slices/popupSlice";
import { showModal } from "reducers/slices/topModalSlice";
import { addAccountViewData } from "reducers/slices/accountViewDataSlice";

const dispatch = store.dispatch;

export default {
  showPrivateKey: async function (captcha = null) {
    const userData = await api("a_users_get_private_key", {
      body: { users_id: utils.getCachedUsersId() },
      captcha,
    });

    if (this.error(userData)) {
      dispatch(redirectFn(true));
      return false;
    }

    dispatch(
      addAccountViewData({
        ACCOUNT_DETAILS: { private_key: userData.private_key },
      })
    );

    //no error handling

    dispatch(popup(POPUP.PRIVATE_KEY_BOX));

    return true;
  },

  changeUserInfo: async function (content, captcha = null) {
    let res;

    dispatch(popupPending(true));

    const body = {
      username: content.username,
      passw: content.passw,
      new_passw: content.new_passw,
      new_passw2: content.new_passw2,
      email: content.email,
      real_name: content.real_name,
      address: content.address,
      phone: content.phone,
    };

    /* edit */
    if (utils.getCachedUsersId()) {
      res = await api("a_users_update", {
        body,
        captcha,
      });
    }

    dispatch(popupPending(false));

    if (this.error(res)) return false;

    if (
      Object.entries(body).length > 3 &&
      body.passw &&
      body.new_passw &&
      body.new_passw2
    )
      dispatch(showModal("Password and/or user data changed"));
    else if (body.passw && body.new_passw && body.new_passw2)
      dispatch(showModal("Password changed"));
    else if (Object.entries(body).length > 0)
      dispatch(showModal("User data changed"));
  },

  deleteUser: async function (captcha = null) {
    let res = await api("a_users_delete", {
      body: { users_id: utils.getCachedUsersId() },
      captcha,
    });

    if (this.error(res)) return false;

    utils.clearCachedUsersId();

    dispatch(showModal("User deleted"));
    dispatch(redirectFn(VIEWS.HOME));

    return true;
  },

  onEditUser: function () {
    dispatch(popup(POPUP.EDIT_USERS));
  },

  deleteAccount: function () {
    dispatch(popup(POPUP.DELETE_USERS));
  },

  startMembershipApply: function () {
    dispatch(popup(POPUP.APPLY_MEMBERSHIP_0));
  },

  loadMembershipApplyScreen: async function (captcha = null) {
    const state = store.getState();
    if (!state.accountViewData.ACCOUNT_SETTINGS) {
      await this.fetchToViewUsersData(null, captcha);
    }
    dispatch(popup(POPUP.APPLY_MEMBERSHIP_1));
  },

  startMembershipApplySubmit: async function (fields, captcha = null) {
    if (fields.email && fields.real_name && fields.address && fields.phone) {
      await this.fetchToViewUsersData(null, captcha);
      dispatch(popup(POPUP.APPLY_MEMBERSHIP_2));
    } else {
      this.error({ error: "All fields need to be filled" }, true, false);
    }
  },

  membershipApply: async function (fields, captcha = null) {
    const res = await api("a_users_membership_apply", {
      body: {
        motivation: fields.motivation,
      },
      captcha,
    });

    if (this.error(res)) return false;

    dispatch(popup(null));
    dispatch(
      addAccountViewData({ ACCOUNT_SETTINGS: { membership_applied: true } })
    );
    dispatch(showModal("Successfully applied!"));
  },
};
