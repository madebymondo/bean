import chalk from "chalk";

export default class Bean {
  config: BeanConfig;
  /**
   *  List of paths to generate. Used for SSG
   * */
  paths?: string[];
  renderMode: BeanConfig["renderMode"];
  templateEngine: BeanConfig["templateEngine"];

  constructor(config: BeanConfig) {
    /* Configuration */
    this.config = config;
    this.renderMode = this.config.renderMode;
    this.templateEngine = this.config.templateEngine;

    this.paths = [];
  }

  /**
   *  Runs an Express server in dev
   * */
  serve() {}

  /**
   *   Builds an output of files
   * */
  build(mode: BeanConfig["renderMode"]) {
    switch (mode) {
      case "ssg":
        console.log("Generate static files from path");
      case "server":
        console.log("Generate express app");
      default:
        throw new Error(
          chalk.red(
            `Error: Rendering mode not found or doesn't exist. Check if the renderMode value in the config is missing or incorrect`
          )
        );
    }
  }

  /**
   *  Rendered output of the site
   * */
  run(mode: BeanConfig["renderMode"]) {
    switch (mode) {
      case "ssg":
        console.log("server generated output");
      case "server":
        console.log("serve generated express app");
      default:
        throw new Error(
          chalk.red(
            `Error: Rendering mode not found or doesn't exist. Check if the renderMode value in the config is missing or incorrect`
          )
        );
    }
  }
}
