import { BeanConfig, BuildServerFilesParams } from "@bean/core";
import fs from "fs-extra";
import path from "path";
import { walkSync } from "./walkSync.js";
import { compileAndRunTS, tsCompile } from "./compileAndRunTs.js";
import { renderBuildTemplate } from "./templateEngine.js";
import chalk from "chalk";
import { generateHTMLOutputPath } from "./generateHTMLOutputPath.js";

/**
 * Creates the server.js, manifest and generates
 * HTML for all pre-rendered routes
 */
export async function buildServerFiles(params: BuildServerFilesParams) {
  const {
    pagesDirectory,
    outputPath,
    templateEngine,
    views,
    dataDirectory,
    filters,
  } = params;

  const viewsPath = path.join(process.cwd(), views);
  const pagesPath = path.join(process.cwd(), pagesDirectory);
  const buildPath = path.join(process.cwd(), outputPath);
  const prerenderPath = path.join(buildPath, "pre-rendered");

  const outputServerRoutesPromises: {
    path: string;
    content: Promise<void>;
  }[] = [];

  /* Set global data for routes */
  const globalDataFiles = fs.readdirSync(dataDirectory);

  const globalDataPromies = globalDataFiles.map(async (dataFile) => {
    /* Read each data file and get it's default exported function */
    const dataFileFunctions = await compileAndRunTS(
      path.join(dataDirectory, dataFile)
    );
    const dataFileContents = dataFileFunctions.find(
      (func) => func.key === "default"
    );

    /* Get the name of the file and the return value
    of the callback */
    const dataBasename = dataFile
      .replace(dataDirectory, "")
      .replace(".js", "")
      .replace(".ts", "");

    return { [dataBasename]: await dataFileContents.callback() };
  });

  /* Create a globalData object and re-assign values from 
  this globalDataPromises to it */
  const globalData = {};
  await Promise.all(globalDataPromies).then((dataItems) => {
    for (const dataItem of dataItems) {
      const key = Object.keys(dataItem)[0];
      const indexedItem = dataItems.find(
        (item) => Object.keys(item)[0] === key
      );
      const data = indexedItem[key];

      globalData[key] = data;
    }
  });

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
          data: { ...data, ...globalData },
          filters,
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

  /* Reads the compiled server and writes it to the server build path */
  const serverTemplatePath = path.join(
    process.cwd(),
    "node_modules/@bean/core/dist/templates/server.js"
  );
  const template = fs.readFileSync(serverTemplatePath, { encoding: "utf-8" });
  const serverPath = path.join(buildPath, "server.js");

  try {
    fs.outputFileSync(serverPath, template, { encoding: "utf-8" });
    console.log(chalk.green(`Successfully created server file`));
  } catch (error) {
    console.log(chalk.red(`Error creating server file: ${error}`));
  }
}
