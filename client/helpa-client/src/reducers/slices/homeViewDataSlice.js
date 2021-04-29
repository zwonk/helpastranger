import { createSlice } from "@reduxjs/toolkit";

const HOME_VIEW_DATA_INIT = {
  affected_locations: [],
  readerActive: false,
  followAction: null,
  userLocation: null,
  platformInfo: {},
};

export const homeViewDataSlice = createSlice({
  name: "homeViewData",
  initialState: HOME_VIEW_DATA_INIT,
  reducers: {
    addHomeViewData: (state, { payload }) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = value;
      }
    },
    setReaderActivity: (state, { payload }) => {
      state.readerActive = payload;
    },
  },
});

export const { addHomeViewData, setReaderActivity } = homeViewDataSlice.actions;
