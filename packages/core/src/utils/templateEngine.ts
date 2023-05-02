import { BeanConfig } from "@bean/core";
import chalk from "chalk";
import nunjucks from "nunjucks";
import { Express } from "express";

export function renderTemplateEngine(
  engine: BeanConfig["templateEngine"],
  views: BeanConfig["viewsDirectory"],
  app: Express
) {
  switch (engine) {
    case "njk":
      return nunjucks.configure(views, {
        autoescape: true,
        express: app,
      });
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
