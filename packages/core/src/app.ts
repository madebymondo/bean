import { ServeAppParams } from "@bean/core";
import chalk from "chalk";
import express from "express";
import fs from "fs";
import path from "path";
import { compileAndRunTS } from "./utils/compileAndRunTs.js";

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
  const { pagesDirectory, templateEngine } = params;

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

    /*
    TODO: Create a router for each nested directory.
    Is router best way or just straight dynamic routes?
    */

    /* 
    TODO: Parse the value of the .ts page file. Check
    whether or not it's dynamic or not ([slug].ts)
    */

    /* TODO: Pass the context into createPage when called  */
  }

  app.get("/", (req, res, next) => {
    res.send({ message: "Server working" });
  });

  app.listen(PORT, () =>
    console.log(chalk.green(`Server started on http://localhost:${PORT}`))
  );
}
