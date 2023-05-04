import { PageContext } from "@bean/core";

/**
 *  Generates an output path by replacing '[params]'
with the context value with the same key 
*/
export function generateHTMLOutputPath(params: {
  /**  Path of the page file */
  path: string;
  /** Directory path where all page files are located  */
  pagesPath: string;
  /** Context of page  */
  context: PageContext;
}): string {
  const { path, pagesPath, context } = params;
  /* Get all possible [params] values for a route */
  const routeQueryPaths = [...params.path.matchAll(/(?<=\[).+?(?=\])/g)];
  const queryValues = routeQueryPaths.map((item) => item[0]);

  /* Generate the path for the HTML output */
  let htmlOutputPath = path.replace(pagesPath, "").replace(".ts", "index.html");

  queryValues.forEach((queryValue) => {
    if (context[queryValue] === "/") {
      htmlOutputPath = htmlOutputPath.replace(`[${queryValue}]`, "");
    } else {
      htmlOutputPath = htmlOutputPath.replace(
        `[${queryValue}]`,
        `${context[queryValue]}/`
      );
    }
  });

  return htmlOutputPath;
}
