import { api } from "functions/api";

import store from "reducers/store";

import { updateAdminData } from "reducers/slices/adminDataSlice";
import { redirect as redirectFn } from "reducers/slices/popupSlice";

import { showModal } from "reducers/slices/topModalSlice";

const dispatch = store.dispatch;

export default {
  fetchToViewAdminData: async function (captcha = null) {
    const usersData = await api("a_admins_get_users_data", {
      body: {},
      captcha,
    });

    const membersData = await api("a_admins_get_members_data", {
      body: {},
      captcha,
    });

    const limits = await api("a_admins_get_limits", {
      body: {},
      captcha,
    });

    if (this.error(usersData) || this.error(limits)) {
      dispatch(redirectFn(true));
      return false;
    }

    dispatch(updateAdminData({ usersData, membersData, limits }));
  },

  adminsAction: async function (users_id, action, captcha = null){
    const res = await api("a_admins_action", {
      body: { users_id, action },
      captcha,
    });

    if (this.error(res)) return false;
    dispatch(showModal("Member status changed"))

    this.fetchToViewAdminData(captcha)

  }
};
