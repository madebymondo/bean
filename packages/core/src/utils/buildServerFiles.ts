import { BeanConfig } from "@bean/core";
import fs from "fs-extra";
import path from "path";
import { walkSync } from "./walkSync.js";
import { compileAndRunTS, tsCompile } from "./compileAndRunTs.js";
import { renderBuildTemplate } from "./templateEngine.js";
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

  const outputServerRoutesPromises: {
    path: string;
    content: Promise<void>;
  }[] = [];

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

      pagesToPrerender?.forEach(async (prerenderedPage) => {
        const prerenderedPageContext = {
          params: prerenderedPage,
        };
        const { context } = await createPage(prerenderedPageContext);
        const { template, data } = context;

        const generatedHTML = renderBuildTemplate({
          engine: templateEngine,
          views: viewsPath,
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
      console.log(chalk.blue(`Generating server bundle...`));
      outputServerRoutesPromises.push({
        path: page,
        content: await compileAndRunTS(page),
      });
    }
  }

  /* Create the manifest.js contains route information for the app */
  const serverRoutes = await Promise.all(outputServerRoutesPromises);

  for (const serverRoute of serverRoutes) {
    try {
      const serverRouteOutputPath = serverRoute.path
        .replace(pagesDirectory, `${outputPath}/server-routes`)
        .replace(".ts", ".js");

      const serverRouteContents = fs.readFileSync(serverRoute.path, {
        encoding: "utf-8",
      });
      const compiledJS = tsCompile(serverRouteContents);

      fs.outputFileSync(serverRouteOutputPath, compiledJS, {
        encoding: "utf-8",
      });

      console.log(
        chalk.green(`Successfully compiled route: ${serverRouteOutputPath}`)
      );
    } catch (error) {
      console.log(chalk.red(`Error compiling route: ${serverRoute.path}`));
    }
  }

  /* Generate the content for the server template */
  const template = generateServerTemplate({
    pagesDirectory: pagesPath,
    viewsDirectory: viewsPath,
    buildPath: buildPath,
    templateEngine,
    port: 3000,
  });

  const serverPath = path.join(buildPath, "server.js");

  try {
    fs.outputFileSync(serverPath, template, { encoding: "utf-8" });
    console.log(chalk.green(`Successfully created server file`));
  } catch (error) {
    console.log(chalk.red(`Error creating server file: ${error}`));
  }
}
