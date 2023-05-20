import chalk from "chalk";
import { BeanConfig } from "@bean/core";
import path from "path";
import { buildStaticFiles } from "./utils/buildStaticFiles.js";
import { buildServerFiles } from "./utils/buildServerFiles.js";

export class Bean {
  /**
   *  List of paths to generate. Used for SSG
   * */
  paths?: string[];
  baseDirectory: BeanConfig["baseDirectory"];
  pagesDirectory: BeanConfig["pagesDirectory"];
  buildOutputPath: BeanConfig["buildOutputPath"];
  viewsDirectory: BeanConfig["viewsDirectory"];
  passthroughDirectories: BeanConfig["passthroughDirectories"];
  renderMode: BeanConfig["renderMode"];
  templateEngine: BeanConfig["templateEngine"];
  server: BeanConfig["server"];
  templateFilters: BeanConfig["templateFilters"];

  constructor(config: BeanConfig) {
    /* Configuration */
    this.baseDirectory = config.baseDirectory;
    this.pagesDirectory = config.pagesDirectory
      ? path.join(this.baseDirectory, config.pagesDirectory)
      : "src/pages";
    this.viewsDirectory = config.viewsDirectory
      ? path.join(this.baseDirectory, config.viewsDirectory)
      : "src/views";
    this.buildOutputPath = config.buildOutputPath || "dist";
    this.passthroughDirectories = config.passthroughDirectories || [];

    this.templateEngine = config.templateEngine || "njk";
    this.server = config.server;
    this.templateFilters = config.templateFilters ?? [];

    this.paths = [];
  }
  /**
   *   Builds an output of files
   * */
  async build(mode: BeanConfig["renderMode"]) {
    switch (mode) {
      case "ssg":
        return buildStaticFiles({
          templateEngine: this.templateEngine,
          pagesDirectory: this.pagesDirectory,
          outputPath: this.buildOutputPath,
          views: this.viewsDirectory,
          filters: this.templateFilters,
        });
      case "server":
        return buildServerFiles({
          templateEngine: this.templateEngine,
          pagesDirectory: this.pagesDirectory,
          outputPath: this.buildOutputPath,
          views: this.viewsDirectory,
          server: this.server,
          filters: this.templateFilters,
        });
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
