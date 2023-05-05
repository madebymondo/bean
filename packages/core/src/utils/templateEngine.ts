import chalk from "chalk";
import nunjucks from "nunjucks";
import {
  RenderTemplateEngineParams,
  RenderBuildTemplateParams,
} from "@bean/core";

/* Setup the template engine for an express app */
export function renderTemplateEngine(params: RenderTemplateEngineParams) {
  const { engine, views, app } = params;

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

/* Renders the template HTML for the SSG and pre-render build */
export function renderBuildTemplate(params: RenderBuildTemplateParams) {
  const { engine, views, template, data } = params;

  switch (engine) {
    case "njk":
      nunjucks.configure(views);
      return nunjucks.render(template, data);
    default:
      throw new Error(
        chalk.red(
          `Error: Template engine not found or doesn't exist. Check if the templateEngine value in the config file is missing or incorrect.`
        )
      );
  }
}
