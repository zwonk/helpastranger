function BindToClassWithCaptcha(functionsObject, thisClass, executeRecaptcha) {
    for (let [ functionKey, functionValue ] of Object.entries(functionsObject)) {
        thisClass[functionKey] = async (...args) => {
            const argsNew = [...args, executeRecaptcha]
            functionValue.apply(thisClass, argsNew);
        };
    }
  }
  
  class DoubleCaptchaedFunctions {
    constructor(captchaedFunctions, executeRecaptcha) {
      BindToClassWithCaptcha(captchaedFunctions, this, executeRecaptcha);
    }
  }
  
export default DoubleCaptchaedFunctions;