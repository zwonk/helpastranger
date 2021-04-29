import { createSlice } from "@reduxjs/toolkit";

import utils from "functions/utils/utils";

const OPTIONS_INIT = {
  amountOptions: [
    {
      value: 200,
      emoji: "emoji-yellow-heart",
      text: `2.0${utils.getCrncySign()}`,
    },
    {
      value: 500,
      emoji: "emoji-food",
      text: `5.0${utils.getCrncySign()}`,
    },
    {
      value: 950,
      emoji: "emoji-hotel",
      text: `9.5${utils.getCrncySign()}`,
    },
    /*{
      value: 0,
      text: "",
    },*/
  ],
  recurrentAmountOptions: [
    {
      value: 50,
      text: `0.5${utils.getCrncySign()}`,
    },
    {
      value: 250,
      text: `2.5${utils.getCrncySign()}`,
    },
    {
      value: 450,
      text: `4.5${utils.getCrncySign()}`,
    },
    /*{
      value: 0,
      text: "",
    },*/
  ],
  recurrentIntervalOptions: [
    {
      value: 0,
      text: "Weekly",
    },
    {
      value: 1,
      text: "Daily",
    },
  ],
};

export const optionsSlice = createSlice({
  name: "options",
  initialState: OPTIONS_INIT,
  reducers: {
    updateOptions: (state, { payload }) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = value;
      }
    },
  },
});

export const { updateOptions } = optionsSlice.actions;
