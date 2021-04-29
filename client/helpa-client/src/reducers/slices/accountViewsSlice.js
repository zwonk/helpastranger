import { createSlice } from "@reduxjs/toolkit";

import { List } from "immutable";

import VIEWS from "constants/Views.constants";

const ACCOUNT_VIEWS_INIT = {
  viewIndex: 0,
  options: [
    VIEWS.ACCOUNT_DETAILS,
    VIEWS.ACCOUNT_LAST_DONATIONS,
    VIEWS.ACCOUNT_QR_CODE_PRINTS,
    VIEWS.ACCOUNT_CASHOUTS,
    VIEWS.ACCOUNT_WITHDRAWS,
    VIEWS.ACCOUNT_STATISTICS,
    VIEWS.ACCOUNT_SETTINGS,
  ],
  optionsInit: [],
  dataStartIndex: List([0, 0, 0, 0, 0, 0, 0, 0]),
};
ACCOUNT_VIEWS_INIT.optionsInit = ACCOUNT_VIEWS_INIT.options;

export const accountViewsSlice = createSlice({
  name: "accountViews",
  initialState: ACCOUNT_VIEWS_INIT,
  reducers: {
    updateAccountViews: (state, { payload }) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = value;
      }
    },
  },
});

export const { updateAccountViews } = accountViewsSlice.actions;
