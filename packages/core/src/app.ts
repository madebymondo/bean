import { ServeAppParams } from "@bean/core";
import chalk from "chalk";
import express from "express";
import fs from "fs";
import path from "path";
import { compileAndRunTS } from "./utils/compileAndRunTs.js";
import { renderTemplateEngine } from "./utils/templateEngine.js";
import chokidar from "chokidar";

const PORT = 3000;

/**
 * Walks thorugh a directory and finds all available paths
 *
 * @param dir Path to directory
 */
function* walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

export async function serveApp(params: ServeAppParams) {
  const { pagesDirectory, templateEngine, viewsDirectory } = params;

  const app = express();

  const watcher = chokidar.watch(params.watchTargets, { ignoreInitial: true });

  watcher.on("all", async () => {
    //TODO: Implement server reload
    console.log(chalk.blue(`Change detected restarting server`));
  });

  /* Initialize the template engine for the express app */
  renderTemplateEngine(templateEngine, viewsDirectory, app);

  /* Logic for file based routing */
  for (const filePath of walkSync(pagesDirectory)) {
    const pageContentPath = path.join(process.cwd(), filePath);
    const pageContent = await compileAndRunTS(pageContentPath);

    /* Get the createPage and createPaths callback */
    const createPage = pageContent.find(
      (item) => item.key === "createPage"
    )?.callback;
    const createPaths = pageContent.find(
      (item) => item.key === "createPaths"
    )?.callback;

    /* Format links from [param].ts to match :param */
    const basename = filePath.replace(pagesDirectory, "");
    const routeQueryPath = basename.replaceAll("[", ":").replaceAll("].ts", "");

    /* Create express route for each page */
    app.get(routeQueryPath, (req, res, next) => {
      /* Check if the current route exits in the generated paths */
      const availablePaths = createPaths();
      const routeExists = availablePaths.paths.find(
        (item) =>
          item.path.replace(/^\/|\/$/g, "") === req.path.replace(/^\/|\/$/g, "")
      );

      if (routeExists) {
        /* Run createPage function and pass it the context */
        const page = createPage(req);
        res.render(page.context.template, page.context.data);
      } else {
        /* If the route doesn't exist go to the 404 catch all route */
        next();
      }
    });
  }

  /* 404 catch-all */
  app.get("*", (req, res, next) => {
    res.status(404);
    res.send("Page not found");
  });

  app.listen(PORT, () =>
    console.log(chalk.green(`Server started on: ${PORT}`))
  );
}
