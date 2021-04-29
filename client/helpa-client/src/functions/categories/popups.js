import store from "reducers/store";
import {
  popup as popupFn,
  popupReverseShift,
  popupClose,
  popupPending,
  redirect as redirectFn,
  setBottomPopupState
} from "reducers/slices/popupSlice";
import { showModal } from "reducers/slices/topModalSlice";
import utils from "functions/utils/utils";

const dispatch = store.dispatch;

export default {
  popup: function (content) {
    dispatch(popupFn(content));
  },

  setBottomPopupState: function(content){
    dispatch(setBottomPopupState(content));
  },

  redirect: function(content){
    dispatch(redirectFn(content));
  },

  popupBack: function () {
    dispatch(popupReverseShift());
  },

  popupClose: function () {
    dispatch(popupClose());
  },

  popupCloseDonation: function () {
    if(utils.getCachedUsersId()) {
      dispatch(showModal("Started donation will be saved."));
    }
    dispatch(popupClose());
  },

  noPending: function () {
    dispatch(popupPending(false));
  },

  modal: function (arr) {
    dispatch(showModal(arr));
  },
};
