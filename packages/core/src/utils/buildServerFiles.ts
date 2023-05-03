import { BeanConfig } from "@bean/core";
import fs from "fs-extra";
import path from "path";

interface BuildServerFilesParams {
  pagesDirectory: BeanConfig["pagesDirectory"];
  outputPath: BeanConfig["buildOutputPath"];
  templateEngine: BeanConfig["templateEngine"];
  views: BeanConfig["viewsDirectory"];
}

/**
 * Creates the server.js, manifest and generates
 * HTML for all pre-rendered routes
 */
export async function buildServerFiles(params: BuildServerFilesParams) {
  const { pagesDirectory, outputPath, templateEngine, views } = params;

  // TODO: Implement this - use buildStaticFiles and point output to 'prerendered'
  /* Generate static files for all pre-rendered routes */

  // TODO: Implement this
  /* Create the manifest.js contains route information for the app */

  // TODO: Implement this
  /* Parse the server.tmpl.ts file and fill in the neccessary values */
}
