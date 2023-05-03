import fs from "fs-extra";
import path from "path";

/**
 * Walks thorugh a directory and finds all available paths
 *
 * @param dir Path to directory
 */
export function* walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}
