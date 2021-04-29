import POPUP from "constants/Popup.constants";

import { api } from "functions/api";

import store from "reducers/store";
import { popup, popupPending } from "reducers/slices/popupSlice";
import { showModal } from "reducers/slices/topModalSlice";
import utils from "functions/utils/utils";

const dispatch = store.dispatch;

export default {
  startCashout: async function () {
    dispatch(popup(POPUP.CASHOUT));
  },

  startCashoutSendBack: async function () {
    dispatch(popup(POPUP.CASHOUT_SENDBACK));
  },

  cashout: async function (content, captcha = null) {
    dispatch(popupPending(true));
    dispatch(popup(POPUP.CASHOUT_DELIVERY));
    /* 2. create location */

    const gps = await content.gps;
    let x, y;

    if (gps) {
      x = gps.coords.latitude;
      y = gps.coords.longitude;
    }

    if(!x || !y){
      this.error({error: "You must activate or allow GPS"});
      return;
    }
    /* set cashout */

    let res = await api("a_cashouts_create", {
      body: {
        affected_id: content.affected_id,
        x,
        y,
        crncy: utils.getCrncy(),
      },
      captcha,
    });

    if (this.error(res)) {
      return res;
    }

    dispatch(popupPending(false));
    dispatch(popup(null));

    const cashouts_id = res.cashouts_id;

    dispatch(
      showModal("Cashout created. Amount will be with you within seconds.")
    );

    /* send funds */

    let res2 = await api("a_cashouts_send", { body: { cashouts_id}, captcha  });

    if (this.error(res2)) return false;
  },

  cashoutSendBack: async function (content, captcha = null) {
    //dispatch(popupPending(true));

    dispatch(popupPending(false));
    dispatch(popup(POPUP.CASHOUT_INFO));

    const res = await api("a_cashouts_sendback", {
      body: { cashouts_id: content.id}, captcha ,
    });
    if (this.error(res)) return false;

    /* send funds */

    let res2 = await api("a_cashouts_sendback_send", {
      body: { cashouts_id: content.id}, captcha ,
    });

    if (this.error(res2)) return false;

    dispatch(showModal("Sendback successful!"));
    return true;
  },
};
