const cp = require("child_process");
const os = require("os");

module.exports = function iotaSeed() {
  switch (os.platform()) {
    case "darwin":
      return cp
        .execSync(
          "cat /dev/urandom | LC_ALL=C tr -dc 'A-Z9' | fold -w 81 | head -n 1",
          { maxBuffer: 82, encoding: "ascii" }
        )
        .trim();
    case "win32":
      throw new Error(
        "IOTA seed can't be generated for Windows operating system at the moment:("
      );
    default:
      /* eslint-disable */
      return cp
        .execSync("cat /dev/urandom | tr -dc A-Z9 | head -c${1:-81}", {
          encoding: "ascii",
        })
        .trim();
  }
};
