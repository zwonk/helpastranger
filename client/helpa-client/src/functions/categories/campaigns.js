import POPUP from "constants/Popup.constants";

import { api } from "functions/api";
import utils from "functions/utils/utils";

import store from "reducers/store";
import { popup, popupErrorContent, popupPending } from "reducers/slices/popupSlice";
import { showModal } from "reducers/slices/topModalSlice";

const dispatch = store.dispatch;

export default {
  startCampaignsWithdraw: function () {
    dispatch(popup(POPUP.CAMPAIGNS_WITHDRAW));
  },

  startCampaign: function () {
    dispatch(popup(POPUP.CAMPAIGNS_CREATE));
  },

  campaignsCreate: async function (content, captcha = null) {
    const fiat_amount = parseInt(content.fiat_amount);

    dispatch(popupPending(true));
    dispatch(popup(null));

    if (!Number.isInteger(fiat_amount)) {
      dispatch(popupErrorContent("Donation amount must be valid integer"));
      return false;
    }

    if (!content.title) {
      dispatch(popupErrorContent("Title is a required field"));
      return false;
    }
      
    let res = await api("a_campaigns_create", {
      body: {
        affected_id: content.affected_id,
        title: content.title,
        description: content.description,
        img_link: content.img_link,
        fiat_amount: parseInt(content.fiat_amount) * 100,
        captcha
      },
    });

    const campaigns_id = res.campaigns_id;

    if (this.error(res)) return false;

    dispatch(showModal("Campaign created."));

    /* send funds */

    await api("a_campaigns_send_worker", { body: { campaigns_id}, captcha  });

    dispatch(popupPending(false));
    return true;
  },

  campaignsDelete: async function (content, captcha = null) {    const res2 = await api("a_campaigns_delete", {
      body: { campaigns_id: content.campaigns_id}, captcha,
    });

    if (this.error(res2)) return false;

    dispatch(popupPending(false));
    dispatch(showModal("Campaign deleted"));
    return true;
  },

  campaignsWithdraw: async function (content, captcha = null) {    let res, res2;

    /* set campaign withdrawal */

    res = await api("a_campwithdrawals_create", {
      body: {
        campaigns_id: content.campaigns_id,
        landing_address: content.landing_address,
        captcha
      },
    });

    if (this.error(res)) return res;

    const campwithdrawals_id = res.campwithdrawals_id;

    dispatch(showModal("Campaign amount withdrawn."));

    /* send funds */

    res2 = await api("a_campwithdrawals_send", {
      body: { campwithdrawals_id}, captcha
    });

    if (this.error(res2)) return false;

    dispatch(popupPending(false));
    dispatch(popup(null)); //TODO maybe loading screen

    return true;
  },

  changeCampaignsInfo: async function (content, captcha = null) {    let res;

    /* edit */
    if (utils.getCachedUsersId()) {
      res = await api("a_campaigns_change", {
        body: {
          campaigns_id: content.campaigns_id,
          title: content.title,
          description: content.description,
          img_link: content.img_link,
           }, captcha
       
      });
    }

    if (this.error(res)) return false;

    dispatch(showModal("Infos changed"));
  },
};
