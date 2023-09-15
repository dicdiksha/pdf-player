const fs = require("fs-extra");
const concat = require("concat");

const build = async () => {
  const files = [
    "./dist/pdf-player-wc/runtime.js",
    "./dist/pdf-player-wc/polyfills-es5.js",
    "./dist/pdf-player-wc/polyfills.js",
    "./dist/pdf-player-wc/styles.js",
    "./dist/pdf-player-wc/vendor.js",
    "./dist/pdf-player-wc/main.js",
  ];

  await fs.ensureDir("dist/pdf-player-wc");
  await concat(files, "web-component/sunbird-pdf-player.js");
  await fs.copy("./dist/pdf-player-wc/assets", "web-component/assets");
  console.log("Files concatenated successfully!!!");
};
build();
