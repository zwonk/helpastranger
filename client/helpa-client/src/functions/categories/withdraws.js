import POPUP from "constants/Popup.constants";

import { api } from "functions/api";

import store from "reducers/store";
import { popup, popupPending } from "reducers/slices/popupSlice";
import { showModal } from "reducers/slices/topModalSlice";
import utils from "functions/utils/utils";

const dispatch = store.dispatch;

export default {
  startWithdraw: function () {
    dispatch(popup(POPUP.WITHDRAW));
  },

  withdraws: async function (content, captcha = null) {
    dispatch(popupPending(true));
    dispatch(popup(POPUP.WITHDRAW_INFO));

    /* set withdraw */

    let res = await api("a_withdraws_create", {
      body: {
        landing_address: content.landingAddress,
        fiat_amount: content.fiatAmount * 100,
        crncy: utils.getCrncy(),
      },
      captcha,
    });

    if (this.error(res)) return res;

    dispatch(popupPending(false));
    dispatch(popup(null));

    const withdraws_id = res.withdraws_id;

    dispatch(
      showModal(
        "Withdrawal created. Amount will be on your external account within seconds."
      )
    );

    /* send funds */

    let res2 = await api("a_withdraws_send", {
      body: { withdraws_id },
      captcha,
    });

    if (this.error(res2)) return false;
  },
};
