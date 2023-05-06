import { ServeAppParams } from "@bean/core";
import chalk from "chalk";
import express from "express";
import path from "path";
import { compileAndRunTS } from "./utils/compileAndRunTs.js";
import { renderTemplateEngine } from "./utils/templateEngine.js";
import chokidar from "chokidar";
import { walkSync } from "./utils/walkSync.js";

const PORT = 3000;

export async function serveApp(params: ServeAppParams) {
  const { pagesDirectory, templateEngine, viewsDirectory } = params;

  const app = express();

  const watcher = chokidar.watch(params.watchTargets, { ignoreInitial: true });

  watcher.on("all", async () => {
    //TODO: Implement server reload
    console.log(chalk.blue(`Change detected restarting server`));
  });

  /* Initialize the template engine for the express app */
  renderTemplateEngine({
    engine: templateEngine,
    views: viewsDirectory,
    app,
  });

  /* Redirect if path has a trailing slash */
  app.use(function (req, res, next) {
    if (req.path.substr(-1) == "/" && req.path.length > 1) {
      let query = req.url.slice(req.path.length);
      res.redirect(301, req.path.slice(0, -1) + query);
    } else {
      next();
    }
  });

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
    const routeQueryPath = basename
      .replaceAll("[", ":")
      .replaceAll("]", "")
      .replaceAll(".ts", "");

    /* Create express route for each page */
    app.get(`${routeQueryPath}(*)?`, async (req, res, next) => {
      /* Run createPage function and pass it the context */
      const page = await createPage(req);
      console.log(routeQueryPath, page);

      /* Send to 404 if there is no data sent to template */
      if (page?.context?.data) {
        res.render(page.context.template, page.context.data);
      } else {
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
