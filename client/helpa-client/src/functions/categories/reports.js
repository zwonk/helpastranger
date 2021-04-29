import POPUP from "constants/Popup.constants";

import { api } from "functions/api";

import store from "reducers/store";
import { popup } from "reducers/slices/popupSlice";
import { showModal } from "reducers/slices/topModalSlice";

const dispatch = store.dispatch;

export default {
  report: async function (data, captcha = null) {
    const { content, context, view } = data;
    const contentData = await api("reports_add", {
      body: { content, context: JSON.stringify(context), view },
      captcha,
    });

    if (this.error(contentData)) {
      dispatch(showModal("Error when submitting report. Try later."));
      return false;
    }

    dispatch(showModal("Report submitted"));
    dispatch(popup(null));
  },

  startReport: function () {
    dispatch(popup(POPUP.REPORT_FORM));
  },
};
