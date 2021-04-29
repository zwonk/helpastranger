import { createSlice } from "@reduxjs/toolkit";

const ADMIN_DATA_INIT = {
  usersData: null,
  membersData: null,
  limits: null,
};

export const adminDataSlice = createSlice({
  name: "admin",
  initialState: ADMIN_DATA_INIT,
  reducers: {
    updateAdminData: (state, { payload }) => {
      for (const [key, value] of Object.entries(payload)) {
        state[key] = value;
      }
    },
  },
});

export const { updateAdminData } = adminDataSlice.actions;
