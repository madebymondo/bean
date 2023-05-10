import * as ts from "typescript";
import fs from "fs-extra";

/**
 * Compiles the contents of a TypeScript file into JavaScript
 *
 * @param source File contents to compile
 * @param options TypeScript configuration options
 * @returns
 */
export function tsCompile(
  source: string,
  options: ts.TranspileOptions = null
): string {
  // Default options -- you could also perform a merge, or use the project tsconfig.json
  if (null === options) {
    options = {
      compilerOptions: {
        //@ts-ignore
        module: "ESNext",
        //@ts-ignore
        moduleResolution: "NodeNext",
        esModuleInterop: true,
      },
    };
  }
  return ts.default.transpileModule(source, options).outputText;
}

/**
 * Gets the content of a TypeScript file
 *
 * @param path Path of TypeScript file to compile
 * @returns An object with the return value of each function in the file
 */
export async function compileAndRunTS(path: string): Promise<any> {
  const fileContents = fs.readFileSync(path, {
    encoding: "utf-8",
  });

  const transpiledFile = tsCompile(fileContents);
  const convertedJSPath = path.replace(".ts", ".js");

  /* 
  Write the compiled file contents to a temp .js file.
  Import the file contents with top level await and 
  return the values of each function in the file. 
  */
  try {
    await fs.writeFile(convertedJSPath, transpiledFile);
    const importedJSFile = await import(convertedJSPath);
    const functionsToRun = Object.keys(importedJSFile).map(async (key) => {
      return { key, callback: await importedJSFile[key] };
    });

    const content = await Promise.all(functionsToRun);

    /* Remove the temp .js file after getting the content */
    await fs.unlink(convertedJSPath);

    return content;
  } catch (e) {
    console.error(e);
  }
}
