import chalk from "chalk";
import { BeanConfig } from "@bean/core";
import { serveApp } from "./app.js";

export class Bean {
  /**
   *  List of paths to generate. Used for SSG
   * */
  paths?: string[];
  pagesDirectory: BeanConfig["pagesDirectory"];
  buildOutputPath: BeanConfig["buildOutputPath"];
  viewsDirectory: BeanConfig["viewsDirectory"];
  watchTargets: BeanConfig["watchTargets"];
  passthroughDirectories: BeanConfig["passthroughDirectories"];
  renderMode: BeanConfig["renderMode"];
  templateEngine: BeanConfig["templateEngine"];

  constructor(config: BeanConfig) {
    /* Configuration */
    this.pagesDirectory = config.pagesDirectory || "pages";
    this.viewsDirectory = config.viewsDirectory || "views";
    this.buildOutputPath = config.buildOutputPath || "dist";
    this.passthroughDirectories = config.passthroughDirectories || [];

    this.watchTargets = config.watchTargets || [
      `${this.pagesDirectory}/**/*`,
      `${this.viewsDirectory}/**/*`,
      `${this.passthroughDirectories}/**/*`,
    ];

    this.renderMode = config.renderMode || "ssg";
    this.templateEngine = config.templateEngine || "njk";

    this.paths = [];
  }

  /**
   *  Runs an Express server in dev
   * */
  async serve() {
    await serveApp({
      pagesDirectory: this.pagesDirectory,
      viewsDirectory: this.viewsDirectory,
      watchTargets: this.watchTargets,
      templateEngine: this.templateEngine,
    });
  }

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
