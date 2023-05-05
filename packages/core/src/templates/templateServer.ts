import { GenerateServerTemplateParams } from "@bean/core";

/**
 * Generates the contents of the server template
 * */
export function generateServerTemplate(params: GenerateServerTemplateParams) {
  const { templateEngine, viewsDirectory, pagesDirectory, port } = params;

  const templateImports = `
    import express from "express";
    import fs from "fs";
    import path from "path";`;

  let templateEngineImport = `
    import nunjucks from "nunjucks"
    `;

  if (templateEngine === "preact") {
    templateEngineImport = `import { render } from "preact-render-to-string"`;
  }

  const walkSync = `
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
    `;

  const app = `
    const app = express();
  `;

  let templateEngineConfiguration = ``;

  if (templateEngine === "njk") {
    templateEngineConfiguration = `
    nunjucks.configure(${viewsDirectory}, {
        autoescape: true,
        express: app,
    });
  `;
  }

  const appRoutes = `
    /* Render all pre-rendered HTML files before server routes */
    app.use("*", express.static("pre-rendered"));

    for (const route of walkSync(${pagesDirectory})) {
      const { filePath, pagesDirectory, views, page } = route;

      /* Format links from [param].ts to match :param */
      const basename = filePath.replace(pagesDirectory, "");
      const routeQueryPath = basename
        .replaceAll("[", ":")
        .replaceAll("]", "")
        .replaceAll(".ts", "");

      /* Create express route for each page */
      app.get(routeQueryPath + "(*)?", (req, res, next) => {
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
  `;

  const appListen = `
    app.listen(PORT, () =>
      console.log('Server started on http://localhost:${port}')
    );
  `;

  const serverTemplate = templateImports.concat(
    templateEngineImport,
    walkSync,
    app,
    templateEngineConfiguration,
    appRoutes,
    appListen
  );

  return serverTemplate;
}
