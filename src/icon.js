// src/icons.js
const requireSvg = require.context(
  "../assets/svg/colorSvg", // directory
  false, // no subdirectories
  /\.svg$/, // match .svg files
);

const icons = {};

requireSvg.keys().forEach((fileName) => {
  // Extract the name without `./` and `.svg`
  const key = fileName.replace("./", "").replace(".svg", "");
  icons[key] = requireSvg(fileName);
});

export default icons;
// Used for title div
