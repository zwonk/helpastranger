import POPUP from "constants/Popup.constants";

import { api } from "functions/api";

import store from "reducers/store";
import { popup } from "reducers/slices/popupSlice";

const dispatch = store.dispatch;

export default {
  startRecurrent: function () {
    dispatch(popup(POPUP.RECURRENT_CREATE));
  },

  changeRecurrent: async function (content, captcha = null) {
    let res;

    if (content.id) {
      const id = content.id
        .toString()
        .replace("donations", "")
        .replace("saved", "");

      res = await api("a_recurrents_change", {
        body: {
          id: id,
          fiat_amount: content.amount,
          pay_interval: content.pay_interval,
        },
        captcha,
      });
    }

    if (this.error(res)) {
      return false;
    } else {
      dispatch(popup(POPUP.RECURRENT_VIEW));
      return;
    }
  },

  deleteRecurrent: async function (content, captcha = null) {
    const res = await api("a_recurrents_delete", {
      body: { id: content.id },
      captcha,
    });

    if (this.error(res)) {
      return false;
    } else {
      dispatch(popup(POPUP.RECURRENT_CREATE));
      return;
    }
  },

  toggleRecurrent: async function (content, captcha = null) {
    const res = await api("a_recurrents_toggle", {
      body: {
        id: content.id,
        paused_state: content.paused_state,
      },
      captcha,
    });

    if (this.error(res)) {
      return false;
    } else {
      dispatch(popup(POPUP.RECURRENT_VIEW));
      return;
    }
  },

  makeRecurrent: async function (content, captcha = null) {
    const res = await api("a_recurrents_create", {
      body: {
        fiat_amount: content.amount,
        affected_id: content.affected_id,
        pay_interval: content.pay_interval,
      },
      captcha,
    });

    if (this.error(res)) {
      return false;
    } else {
      dispatch(popup(POPUP.RECURRENT_VIEW));
      return;
    }
  },
};
