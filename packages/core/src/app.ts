import chalk from "chalk";
import express from "express";
import path from "path";
import { compileAndRunTS } from "./utils/compileAndRunTs.js";
import { renderTemplateEngine } from "./utils/templateEngine.js";
import { walkSync } from "./utils/walkSync.js";

const PORT = 3000;

const beanConfigPath = path.join(process.cwd(), "bean.config.ts");
const beanConfigFunctions = await compileAndRunTS(beanConfigPath);
const beanConfig = beanConfigFunctions.find((func) => func.key === "default");
export const beanConfigData = beanConfig.callback();

const pagesDirectory = beanConfigData.pagesDirectory ?? "pages";
const viewsDirectory = beanConfigData.viewsDirectory ?? "views";
const templateEngine = beanConfigData.templateEngine ?? "njk";
const watchTargets = beanConfigData.watchTargets ?? [];

const app = express();

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

    const template = renderTemplateEngine({
      engine: templateEngine,
      views: viewsDirectory,
      template: page.context.template,
      data: page.context.data,
      app,
    });

    /* Add the Browser Sync refresh client to the generated HTML */
    const outputHTML = template.replace(
      "</body>",
      `${BROWSER_SYNC_CLIENT}</body>`
    );

    /* Send to 404 if there is no data sent to template */
    if (page?.context?.data) {
      res.setHeader("Content-Type", "text/html");
      res.send(outputHTML);
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

app.listen(PORT, () => console.log(chalk.green(`Server started on: ${PORT}`)));

const BROWSER_SYNC_CLIENT = `<script id="__bs_script__">//<![CDATA[
  (function() {
  try {
  var script = document.createElement('script');
  if ('async') {
      script.async = true;
  }
  script.src = 'http://HOST:3001/browser-sync/browser-sync-client.js?v=2.29.1'.replace("HOST", location.hostname);
  if (document.body) {
      document.body.appendChild(script);
  }
  } catch (e) {
  console.error("Browsersync: could not append script tag", e);
  }
})()
//]]></script>`;
