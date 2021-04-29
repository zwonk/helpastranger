import { createSlice } from "@reduxjs/toolkit";

const ACCOUNT_VIEW_DATA_INIT = {
  ACCOUNT_DETAILS: null,
  ACCOUNT_LAST_DONATIONS: null,
  ACCOUNT_QR_CODE_PRINTS: null,
  ACCOUNT_CASHOUTS: null,
  ACCOUNT_WITHDRAWS: null,
  ACCOUNT_STATISTICS: null,
  ACCOUNT_SETTINGS: null,
};

export const accountViewDataSlice = createSlice({
  name: "accountViewData",
  initialState: ACCOUNT_VIEW_DATA_INIT,
  reducers: {
    updateAccountViewData: (state, { payload }) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = value;
      }
    },
    addAccountViewData: (state, { payload }) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = { ...state[key], ...value };
      }
    },
  },
});

export const {
  updateAccountViewData,
  addAccountViewData,
} = accountViewDataSlice.actions;
