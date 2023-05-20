import chalk from "chalk";
import nunjucks from "nunjucks";
import {
  RenderTemplateEngineParams,
  RenderBuildTemplateParams,
} from "@bean/core";

/* Setup the template engine for an express app */
export function renderTemplateEngine(params: RenderTemplateEngineParams) {
  const { engine, views, template, data, app, filters } = params;

  switch (engine) {
    case "njk":
      const env = nunjucks.configure(views, {
        autoescape: true,
        express: app,
      });

      if (filters) {
        filters.forEach((filter) => {
          filter(env);
        });
      }
      return env.render(template, data);
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
  const { engine, views, template, data, filters } = params;

  switch (engine) {
    case "njk":
      const env = nunjucks.configure(views);

      if (filters) {
        filters.forEach((filter) => {
          filter(env);
        });
      }
      /*
      TODO: figure out how to pass server integration here. 
      Maybe it's better only being a feature for the 'server'
      render mode
      */

      return env.render(template, data);
    default:
      throw new Error(
        chalk.red(
          `Error: Template engine not found or doesn't exist. Check if the templateEngine value in the config file is missing or incorrect.`
        )
      );
  }
}
