import fs from "node:fs";
import path from "node:path";

async function writeFile(
  basePath: string,
  file: string,
  content: string,
): Promise<boolean> {
  if (!fs.existsSync(basePath)) {
    try {
      fs.mkdirSync(basePath);
    } catch (e) {
      return false;
    }
  }
  try {
    fs.writeFileSync(path.join(basePath, file), content);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * check if given path exist and created it if node
 *
 * @async
 * @param {string[]} paths [paths=[]] array of paths to check
 * @returns Promise<boolean>
 * @example ```javascript
 * const ok = await ensurePaths([path1, path2])
 * ```
 */
async function ensurePaths(paths: string[] = []) {
  for (const path in paths) {
    if (!fs.existsSync(path)) {
      try {
        fs.mkdirSync(path);
      } catch (e) {
        return false;
      }
    }
  }
  return true;
}

export { writeFile, ensurePaths };
