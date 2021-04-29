import POPUP from "constants/Popup.constants";

import store from "reducers/store";
import { popup, popupErrorContent, popupReversePush } from "reducers/slices/popupSlice";

import utils from "functions/utils/utils"

const dispatch = store.dispatch;

export default {
  error: function (res, dispatchRes = true, removePrevPopup = true) {
    if (!res || res.error) {
      if (dispatchRes) {
        dispatch(popupErrorContent(res ? res.error : utils.DEFAULT_ERROR));
        if(removePrevPopup){
          dispatch(popupReversePush(POPUP.ERROR));
        }
        else{
          dispatch(popup(POPUP.ERROR));
        }
      }
      return true;
    }
    return false;
  },
};
