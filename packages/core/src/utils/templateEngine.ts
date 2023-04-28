import chalk from "chalk";

export function renderTemplateEngine(engine: BeanConfig["templateEngine"]) {
  switch (engine) {
    case "njk":
      console.log("render nunjucks");
    case "liquid":
      console.log("render liquide");
    case "preact":
      console.log("render preact");
    default:
      throw new Error(
        chalk.red(
          `Error: Template engine not found or doesn't exist. Check if the templateEngine value in the config file is missing or incorrect.`
        )
      );
  }
}
