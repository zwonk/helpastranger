import { createSlice } from "@reduxjs/toolkit";

const AFFECTED_DATA_INIT = {
  data: [],
  locations: [],
  locationsTimestamp: [],
  extended: [],
  extendedTimestamp: [],
  index: [],
};

export const affectedDataSlice = createSlice({
  name: "affectedData",
  initialState: AFFECTED_DATA_INIT,
  reducers: {
    updateAffectedData: (state, { payload }) => {
      if (Array.isArray(payload)) {
        payload.forEach((affected, i) => {
          if (affected.affected_id) {
            const localIndex = state.index.indexOf(affected.affected_id);
            if (localIndex >= 0) {
              state.data[localIndex] = {
                ...state.data[localIndex],
                ...affected,
              };
            } else {
              state.data.push(affected);
              state.index.push(affected.affected_id);
            }
          }
        });
      }
    },
    updateAffectedLocations: (state, { payload }) => {
      if (Array.isArray(payload)) {
        payload.forEach((affected, i) => {
          if (affected.affected_id) {
            const localIndex = state.index.indexOf(affected.affected_id);
            if (localIndex >= 0) {
              state.locations[localIndex] = affected.locations;
              state.locationsTimestamp[localIndex] = new Date().getTime();
            }
            //TODO really allowed before affected_data is in state.data?
            else {
              state.locations.push(affected.locations);
              state.locationsTimestamp.push(new Date().getTime());
              state.index.push(affected.affected_id);
            }
          }
        });
      }
    },
    updateAffectedExtended: (state, { payload }) => {
      if (Array.isArray(payload)) {
        payload.forEach((extended, i) => {
          if (extended.affected_id) {
            const localIndex = state.index.indexOf(extended.affected_id);
            if (localIndex >= 0) {
              state.extended[localIndex] = {
                ...state.extended[localIndex],
                ...extended,
              };

              //setting timestamp only once balance data is retrieved, not just public_key
              if(extended.crncy){
                state.extendedTimestamp[localIndex] = new Date().getTime();
              }
            }
            //TODO really allowed before affected_data is in state.data?
            else {
              state.extended.push(extended);

              //setting timestamp only once balance data is retrieved, not just public_key
              if(extended.crncy){
                state.extendedTimestamp.push(new Date().getTime());
              }
              state.index.push(extended.affected_id);
            }
          }
        });
      }
    },
  },
});

export const {
  updateAffectedData,
  updateAffectedLocations,
  updateAffectedExtended,
} = affectedDataSlice.actions;
