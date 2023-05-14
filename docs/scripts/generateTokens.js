import fs from "fs";
import path from "path";

/**
 * Generates SCSS variables based of a
 * JSON object of design tokens
 * */
function generateTokens(args) {
  /* Output path to generate the tokens file */
  const outputPath = args[2];

  /* Convert the tokens.json file into an object */
  const tokensPath = path.join(process.cwd(), "tokens.json");
  const tokensContent = fs.readFileSync(tokensPath, { encoding: "utf-8" });
  const tokensObject = JSON.parse(tokensContent);

  /* Generate tokens output */
  const tokenStrings = [];

  Object.entries(tokensObject).map((entry) => {
    /*
     * Create the name of the token by joining
     * the keys of the nested token object
     */
    const tokenValues = entry[1];

    const iterate = (obj, prefix, generatedName) => {
      const keys = Object.keys(obj);
      keys.map((key) => {
        const keyValue = obj[key];
        const nested = typeof keyValue === "object";

        /* Create the token string if it isn't a nested object */
        if (!nested) {
          return tokenStrings.push(`$${generatedName}-${key}: ${keyValue};`);
        }

        iterate(keyValue, key, `${prefix}-${key}`);
      });
    };

    iterate(tokenValues, entry[0], entry[0]);
  });

  const outputContent = tokenStrings.join("\n");

  try {
    fs.writeFileSync(outputPath, outputContent);
    console.log(`Successfully generated tokens at ${outputPath}`);
  } catch (e) {
    console.error(e);
  }
}

generateTokens(process.argv);
