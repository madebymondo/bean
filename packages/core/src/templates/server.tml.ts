import express from "express";
import fs from "fs";
import path from "path";

import manifest from "./site-maifest.js";
const { routes } = manifest;
/* [[Template Engine Import]] */

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

const app = express();

const PORT = 3000;

/* [[Template Engine Configuration]] */

/* Render all pre-rendered HTML files before server routes */
app.use("*", express.static("pre-rendered"));

for (const route of walkSync(routes)) {
  const { filePath, pagesDirectory, views, page } = route;

  /* Format links from [param].ts to match :param */
  const basename = filePath.replace(pagesDirectory, "");
  const routeQueryPath = basename
    .replaceAll("[", ":")
    .replaceAll("]", "")
    .replaceAll(".ts", "");

  /* Create express route for each page */
  app.get(`${routeQueryPath}(*)?`, (req, res, next) => {
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
  console.log(`Server started on http://localhost:${PORT}`)
);
