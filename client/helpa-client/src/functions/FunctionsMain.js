import categories from "functions/categories/index";
import utils from "functions/utils/utils";

const VIEW_UPDATING_FUNCTIONS = ["donate", "noPending", "deleteSaved"];
const CONTENT_UPDATING_FUNCTIONS = [
  "deliver",
  "changeInfos",
  "cashout",
  "changeUserInfo",
];
const DELAY_CONTENT_UPDATING_FUNCTIONS = [
  "cashoutSendBack",
];

function BindToClassWithRefetch(functionsObject, thisClass) {
  for (let [functionKey, fn] of Object.entries(functionsObject)) {
    if (VIEW_UPDATING_FUNCTIONS.includes(functionKey)) {
      thisClass[functionKey] = async (...args) => {
        await fn.call(thisClass, ...args);
        if (utils.getCachedUsersId()) {
          thisClass.refetchAccountView();
        }
      };
    } else if (CONTENT_UPDATING_FUNCTIONS.includes(functionKey)) {
      thisClass[functionKey] = async (...args) => {
        await fn.call(thisClass, ...args);
        if (utils.getCachedUsersId()){
          thisClass.refetchAccountView();
        }
        thisClass.refetchPopupContent();
      };
    } else if (DELAY_CONTENT_UPDATING_FUNCTIONS.includes(functionKey)) {
      thisClass[functionKey] = async (...args) => {
        await fn.call(thisClass, ...args);
        thisClass.refetchPopupContent();
        thisClass.refetchAccountView();
        await utils.timeout(4000);
        if (utils.getCachedUsersId()){
          thisClass.refetchAccountView();
        }
      };
    } 
    else if (!["prototype", "length", "name"].includes(functionKey)) {
      thisClass[functionKey] = fn.bind(thisClass);
    }
  }
}

class Functions {
  constructor() {
    for (let [, functionValue] of Object.entries(categories)) {
      BindToClassWithRefetch(functionValue, this);
    }
  }
}

const functions = new Functions();

export default functions;
