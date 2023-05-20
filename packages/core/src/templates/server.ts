import express from "express";
import path from "path";
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

const { baseDirectory, server } = beanConfigData;

const viewsDirectory = beanConfigData.viewsDirectory
  ? path.join(baseDirectory, beanConfigData.viewsDirectory)
  : "src/views";
const templateEngine = beanConfigData.templateEngine ?? "njk";
const buildPath = beanConfig.buildOutputPath
  ? path.join(baseDirectory, beanConfig.buildOutputPath)
  : path.join(process.cwd(), "dist");

const PORT = 3000;

const app = express();

server(app);

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
