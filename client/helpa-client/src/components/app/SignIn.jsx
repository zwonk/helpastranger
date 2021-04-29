import { useEffect } from "react";

import { useDispatch } from "react-redux";
import { popup } from "reducers/slices/popupSlice";

import POPUP from "constants/Popup.constants";

export default () => {
  const dispatch = useDispatch();

  useEffect(
    () => {
      dispatch(popup(POPUP.SIGNFORM_TO_MAIN));
    },
    // eslint-disable-next-line
    []
  );

  return "";
};
