import { BeanConfig } from "@bean/core";
import fs from "fs-extra";
import path from "path";
import { walkSync } from "./walkSync.js";
import { compileAndRunTS } from "./compileAndRunTs.js";
import { renderBuldTemplate } from "./templateEngine.js";
import chalk from "chalk";
import { generateHTMLOutputPath } from "./generateHTMLOutputPath.js";
import { generateServerTemplate } from "../templates/templateServer.js";

interface BuildServerFilesParams {
  pagesDirectory: BeanConfig["pagesDirectory"];
  outputPath: BeanConfig["buildOutputPath"];
  templateEngine: BeanConfig["templateEngine"];
  views: BeanConfig["viewsDirectory"];
}

/**
 * Creates the server.js, manifest and generates
 * HTML for all pre-rendered routes
 */
export async function buildServerFiles(params: BuildServerFilesParams) {
  const { pagesDirectory, outputPath, templateEngine, views } = params;

  const viewsPath = path.join(process.cwd(), views);
  const pagesPath = path.join(process.cwd(), pagesDirectory);
  const buildPath = path.join(process.cwd(), outputPath);
  const prerenderPath = path.join(buildPath, "pre-rendered");

  for (const page of walkSync(pagesPath)) {
    const pageContent = await compileAndRunTS(page);

    /* Get the createPage and createPaths callback */
    const createPage = pageContent.find(
      (item) => item.key === "createPage"
    )?.callback;

    const createPaths = pageContent.find(
      (item) => item.key === "createPaths"
    )?.callback;

    if (createPaths) {
      /* Generate HTML for paths with prerender: true */
      const pagesToPrerender = createPaths().paths.filter(
        (page) => page.prerender === true
      );

      if (pagesToPrerender) {
        console.log(chalk.blue(`Generating pre-rendered routes...`));
      }

      pagesToPrerender?.forEach((prerenderedPage) => {
        const prerenderedPageContext = {
          params: prerenderedPage,
        };
        const { context } = createPage(prerenderedPageContext);
        const { template, data } = context;

        const generatedHTML = renderBuldTemplate({
          engine: templateEngine,
          views,
          template,
          data,
        });

        const htmlOutputPath = generateHTMLOutputPath({
          path: page,
          context,
          pagesPath,
        });

        /* Write the HTML file */
        const builtHTMLPath = path.join(prerenderPath, htmlOutputPath);

        try {
          fs.outputFileSync(builtHTMLPath, generatedHTML);
          console.log(
            chalk.green(
              `Successfully created pre-rendered page: ${htmlOutputPath}`
            )
          );
        } catch (error) {
          console.log(
            chalk.red(
              `Error creating pre-rendered page: ${builtHTMLPath}: ${error}`
            )
          );
        }
      });
    } else {
      console.log(chalk.blue(`Generating server file...`));
      const template = generateServerTemplate({
        pagesDirectory: pagesPath,
        viewsDirectory: viewsPath,
        templateEngine,
        port: 3000,
      });

      console.log(template);
    }
  }

  // TODO: Implement this - use buildStaticFiles and point output to 'prerendered'
  /* Generate static files for all pre-rendered routes */

  // TODO: Implement this
  /* Create the manifest.js contains route information for the app */

  // TODO: Implement this
  /* Parse the server.tmpl.ts file and fill in the neccessary values */
}
