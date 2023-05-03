import path from "path";
import fs from "fs-extra";
import { walkSync } from "./walkSync.js";
import { BeanConfig } from "@bean/core";
import { compileAndRunTS } from "./compileAndRunTs.js";
import { renderBuldTemplate } from "./templateEngine.js";
import chalk from "chalk";

interface BuildSiteParams {
  pagesDirectory: BeanConfig["pagesDirectory"];
  outputPath: BeanConfig["buildOutputPath"];
  templateEngine: BeanConfig["templateEngine"];
  views: BeanConfig["viewsDirectory"];
}

export async function buildStaticFiles(params: BuildSiteParams) {
  console.log(chalk.blue(`Building static files...`));
  const { pagesDirectory, outputPath, views, templateEngine } = params;

  const pagesPath = path.join(process.cwd(), pagesDirectory);
  const buildPath = path.join(process.cwd(), outputPath);

  for (const pagePath of walkSync(pagesPath)) {
    const pageContent = await compileAndRunTS(pagePath);

    /* Get the createPage and createPaths callback */
    const createPage = pageContent.find(
      (item) => item.key === "createPage"
    )?.callback;
    const createPaths = pageContent.find(
      (item) => item.key === "createPaths"
    )?.callback;

    const allRoutePaths = createPaths().paths;

    /* Get all possible [params] values for a route */
    const routeQueryPaths = [...pagePath.matchAll(/(?<=\[).+?(?=\])/g)];
    const queryValues = routeQueryPaths.map((item) => item[0]);

    allRoutePaths.forEach((routeData) => {
      const routeContext = { params: routeData };

      const page = createPage(routeContext);

      const { template, data } = page.context;

      const generatedHTML = renderBuldTemplate({
        engine: templateEngine,
        views,
        template,
        data,
      });

      /* Generate the path for the HTML output */
      let htmlOutputPath = pagePath
        .replace(pagesPath, "")
        .replace(".ts", "index.html");

      queryValues.forEach((queryValue) => {
        if (routeData[queryValue] === "/") {
          htmlOutputPath = htmlOutputPath.replace(`[${queryValue}]`, "");
        } else {
          htmlOutputPath = htmlOutputPath.replace(
            `[${queryValue}]`,
            `${routeData[queryValue]}/`
          );
        }
      });

      /* Write the HTML file */
      const builtHTMLPath = path.join(buildPath, htmlOutputPath);

      try {
        fs.outputFileSync(builtHTMLPath, generatedHTML);
        console.log(chalk.green(`Successfully created ${htmlOutputPath}`));
      } catch (error) {
        console.log(chalk.red(`Error creating ${builtHTMLPath}: ${error}`));
      }
    });
  }
}
