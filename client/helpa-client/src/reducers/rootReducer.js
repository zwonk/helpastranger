import { combineReducers } from "redux";

import { accountViewDataSlice } from "./slices/accountViewDataSlice";
import { accountViewsSlice } from "./slices/accountViewsSlice";
import { adminDataSlice } from "./slices/adminDataSlice";
import { affectedDataSlice } from "./slices/affectedDataSlice";
import { authSlice } from "./slices/authSlice";
import { dataSlice } from "./slices/dataSlice";
import { homeViewDataSlice } from "./slices/homeViewDataSlice";
import { optionsSlice } from "./slices/optionsSlice";
import { popupSlice } from "./slices/popupSlice";

import { topModalSlice }  from "./slices/topModalSlice";

const rootReducer = combineReducers({
  affectedData: affectedDataSlice.reducer,
  options: optionsSlice.reducer,
  auth: authSlice.reducer,
  popup: popupSlice.reducer,
  homeViewData: homeViewDataSlice.reducer,
  adminData: adminDataSlice.reducer,
  accountViewData: accountViewDataSlice.reducer,
  accountViews: accountViewsSlice.reducer,
  data: dataSlice.reducer,
  topModal: topModalSlice.reducer,
});

export default rootReducer;
