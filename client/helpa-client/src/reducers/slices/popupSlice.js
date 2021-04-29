import { createSlice } from "@reduxjs/toolkit";

import { List } from "immutable";

import utils from "functions/utils/utils";

const POPUP_INIT = {
  /* over all views */
  popup: List(),
  popupContent: {},
  redirect: null,
  aborted: null,
  pending: false,
  errors: null,
  popupContentHash: null,
  bottomPopupState: utils.getBottomPopupState(),
};

export const popupSlice = createSlice({
  name: "popup",
  initialState: POPUP_INIT,
  reducers: {
    popup: (state, { payload }) => {
      state.popup = state.popup.push(payload);
    },
    popupPending: (state, { payload }) => {
      state.pending = payload;
    },
    popupErrorContent: (state, { payload }) => {
      state.pending = false;
      state.errors = payload
        ? payload || utils.DEFAULT_ERROR
        : utils.DEFAULT_ERROR;
    },
    popupReverseShift: (state, { payload }) => {
      state.popup = state.popup.reverse().shift().reverse();
    },
    popupReversePush: (state, { payload }) => {
      state.popup = state.popup.reverse().shift().reverse().push(payload);
    },
    popupAbort: (state, { payload }) => {
      state.aborted = payload;
    },
    popupClose: (state, { payload }) => {
      state.aborted = true;
      state.popup = state.popup.push(null);
    },
    refetchPopupContent: (state, { payload }) => {
      state.popupContentHash = utils.makeHash(6);
    },
    addPopupContent: (state, { payload }) => {
      state.popupContent = { ...state.popupContent, ...payload };
    },
    updatePopupContent: (state, { payload }) => {
      state.popupContent = payload;
    },
    redirect: (state, { payload }) => {
      state.redirect = payload;
    },
    setBottomPopupState: (state, { payload }) => {
      state.bottomPopupState = payload;
      utils.setBottomPopupState(payload);
    },
  },
});

export const {
  redirect,
  popup,
  refetchPopupContent,
  popupErrorContent,
  popupReversePush,
  popupReverseShift,
  popupClose,
  popupPending,
  popupAbort,
  addPopupContent,
  updatePopupContent,
  setBottomPopupState,
} = popupSlice.actions;
