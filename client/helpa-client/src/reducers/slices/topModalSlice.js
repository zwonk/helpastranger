import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
    content: "",
    color: 0,
};

export const topModalSlice = createSlice({
  name: "topModal",
  initialState: INITIAL_STATE,
  reducers: {
    // mutate the state all you want with immer
    showModal: (state, { payload }) => {
      if(Array.isArray(payload)){
        if(payload.length > 1){
          state.content = payload[0]
          state.color = payload[1]
        }
      } else {
        state.content = payload;
        state.color = 0;
      }
    }
  }
})

export const { showModal } = topModalSlice.actions;
