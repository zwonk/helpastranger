import React, { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { showModal } from "reducers/slices/topModalSlice";

export default () => {
  const dispatch = useDispatch();
  const topModalContent = useSelector((state) => state.topModal.content);
  const topModalColor = useSelector((state) => state.topModal.color);

  useEffect(() => {
    setTimeout(() => dispatch(showModal("")), 4000);
  }, [topModalContent, dispatch]);

  return (
    <div id="TopModal">
      <div className="container">
        {topModalContent ? (
          <div className={`topModalInner ${topModalColor}`}>
            {topModalContent}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
