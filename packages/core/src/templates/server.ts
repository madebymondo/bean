import express from "express";
import path from "path";
import fs from "fs";
//@ts-ignore
import { walkSync } from "@bean/core/dist/utils/walkSync.js";
//@ts-ignore
import { compileAndRunTS } from "@bean/core/dist/utils/compileAndRunTS.js";
//@ts-ignore
import { renderTemplateEngine } from "@bean/core/dist/utils/templateEngine.js";

const beanConfigPath = path.join(process.cwd(), "bean.config.ts");
const beanConfigFunctions = await compileAndRunTS(beanConfigPath);
const beanConfig = beanConfigFunctions.find((func) => func.key === "default");
export const beanConfigData = beanConfig.callback();

const { baseDirectory, server, templateFilters } = beanConfigData;

const viewsDirectory = beanConfigData.viewsDirectory
  ? path.join(baseDirectory, beanConfigData.viewsDirectory)
  : path.join(process.cwd(), "src/views");
const templateEngine = beanConfigData.templateEngine ?? "njk";
const buildPath = beanConfig.buildOutputPath
  ? path.join(baseDirectory, beanConfig.buildOutputPath)
  : path.join(process.cwd(), "dist");
const globalDataDirectory = beanConfigData.globalDataDirectory
  ? path.join(baseDirectory, beanConfigData.globalDataDirectory)
  : path.join(process.cwd(), "src/data");

const PORT = 3000;

const app = express();

/* Set global data for app */
const globalDataDirectoryExists = fs.existsSync(globalDataDirectory);

    if(globalDataDirectoryExists){

const globalDataFiles = fs.readdirSync(globalDataDirectory);

for (const dataFile of globalDataFiles) {
  /* Read each data file and get it's default exported function */
  const dataFileFunctions = await compileAndRunTS(
    path.join(globalDataDirectory, dataFile)
  );
  const dataFileContents = dataFileFunctions.find(
    (func) => func.key === "default"
  );

  /* Get the name of the file and the return value
    of the callback */
  const dataBasename = dataFile
    .replace(globalDataDirectory, "")
    .replace(".js", "")
    .replace(".ts", "");

  const data = await dataFileContents.callback();

  app.locals[dataBasename] = data;
}
    }

const publicPath =
  beanConfigData.publicPath ?? path.join(process.cwd(), "public");

app.use("/public", express.static(publicPath));

if (server) {
  server(app);
}

/* Render all pre-rendered HTML files before server routes */
app.use("/", express.static(path.join(buildPath, "pre-rendered")));

for (const route of walkSync(`${buildPath}/server-routes`)) {
  /* Format links from [param].ts to match :param */
  const basename = route.replace(`${buildPath}/server-routes`, "");
  const routeQueryPath = basename
    .replaceAll("[", ":")
    .replaceAll("]", "")
    .replaceAll(".js", "");

  /* Create express route for each page */
  app.get(routeQueryPath + "(*)?", async (req, res, next) => {
    const { createPage } = await import(route);
    const page = await createPage(req);

    /* Send to 404 if there is no data sent to template */
    if (page?.context?.data) {
      const html = renderTemplateEngine({
        engine: templateEngine,
        views: viewsDirectory,
        template: page.context.template,
        data: page.context.data,
        app,
        filters: templateFilters,
      });

      res.setHeader("Content-Type", "text/html");
      res.send(html);
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
  console.log(`Server started on http://localhost:${PORT}`)
);
