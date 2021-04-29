import Functions from "functions/FunctionsMain";

function BindToClassWithCaptcha(functionsObject, thisClass, executeRecaptcha) {
    for (let [ functionKey, functionValue ] of Object.entries(functionsObject)) {
        thisClass[functionKey] = async (...args) => {
            const argsNew = [...args, executeRecaptcha]
            functionValue.apply(thisClass, argsNew);
        };
    }
  }
  
  class CaptchaedFunctions {
    constructor(executeRecaptcha) {
      BindToClassWithCaptcha(Functions, this, executeRecaptcha);
    }
  }
  
  export default CaptchaedFunctions;