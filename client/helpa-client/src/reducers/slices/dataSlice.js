import { createSlice } from "@reduxjs/toolkit";

const DATA_INIT = {
  affected_id: null,
  qr_blob_merged: { content: null, affected_ids: [] },
  qr_code: null,
  secrets: {},
  campaign: null,
  donation: {},
  txhash: null,
  meme: null,
  memes: null,
};

export const dataSlice = createSlice({
  name: "data",
  initialState: DATA_INIT,
  reducers: {
    updateData: (state, { payload }) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = value;
      }
    },
    addData: (state, { payload }) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = { ...state[key], ...value };
      }
    },
  },
});

export const { addData, updateData } = dataSlice.actions;
