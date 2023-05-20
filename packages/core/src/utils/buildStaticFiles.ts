import path from "path";
import fs from "fs-extra";
import { walkSync } from "./walkSync.js";
import { BeanConfig, BuildSiteParams } from "@bean/core";
import { compileAndRunTS } from "./compileAndRunTs.js";
import { renderBuildTemplate } from "./templateEngine.js";
import chalk from "chalk";
import { generateHTMLOutputPath } from "./generateHTMLOutputPath.js";

export async function buildStaticFiles(params: BuildSiteParams) {
  console.log(chalk.blue(`Building static files...`));
  const { pagesDirectory, outputPath, views, templateEngine, filters } = params;

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

    allRoutePaths.forEach(async (routeData) => {
      const routeContext = { params: routeData };

      const page = await createPage(routeContext);

      const { template, data } = page.context;

      const generatedHTML = renderBuildTemplate({
        engine: templateEngine,
        views,
        template,
        data,
        filters,
      });

      const htmlOutputPath = generateHTMLOutputPath({
        path: pagePath,
        pagesPath: pagesPath,
        context: page.context,
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
