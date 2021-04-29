import { createSlice } from "@reduxjs/toolkit";

import utils from "functions/utils/utils";

const AUTH_INIT = {
    errors: {},
    signedup: false,
    signUpPage: false,
    users_id: utils.getCachedUsersId(),
    pending: false,
  };
  
export const authSlice = createSlice({
  name: "auth",
  initialState: AUTH_INIT,
  reducers: {
    signUpErrors: (state, { payload }) => {
      const res = payload;

      let stateErrors = {};

      if (!res || (res && res.error)) {

        if(!res){
          state = { ...state, errors: {username: utils.DEFAULT_ERROR}};
          return;
        }
        
        let errors = res.error

        if (!Array.isArray(errors)) {
          errors = [errors];
        }

        for (const i in errors) {
          const error = errors[i];
          if (error && error.toLowerCase().includes("username")) {
            stateErrors.username = error;
          } else if (error && error.toLowerCase().includes("passw")) {
            stateErrors.passw = error;
          } else if (error && error.toLowerCase().includes("agb")) {
            stateErrors.agb = error;
          } else {
            state = { ...state, errors: {username: utils.DEFAULT_ERROR}};
            return;
          }
        }

        state.errors = stateErrors;
      }
    },

    signUpPage: (state, { payload }) => {
      state.signUpPage = payload;
    },

    signUpSuccessful: (state, { payload }) => {
      state.signedup = true;
    },

    signInErrors: (state, { payload }) => {
      // 1. error details
      if (payload && payload.error) {
        let error = payload.error;
        if (error && error.toLowerCase().includes("username")) {
          state.errors = { username: error };
          return;
        }
      }

      // 2. unknown error
      if (!payload) {
        state.errors = utils.DEFAULT_ERROR;
        return;
      }

      // 3. no errors
      state.pending = false;
    },

    signInSuccessful: (state, { payload }) => {
      const res = payload;
      state.users_id = res.users_id;
      state.signedup = false;
      state.passw_recovery_used = res.passw_recovery_used;
    },

    signOut: (state, { payload }) => {
      state.errors = {};
      state.signedup = false;
      state.signUpPage = false;
      state.pending = false;
      state.users_id = null;
    },
  },
  extraReducers: {
    /*[signFormWithFollowAction.fulfilled]: (state, { payload }) => {
      },*/
  },
});

export const {
    signInErrors,
    signInSuccessful,
    signUpErrors,
    signUpSuccessful,
    signOut,
    signUpPage
  } = authSlice.actions;
  
  