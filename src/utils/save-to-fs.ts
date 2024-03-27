import path from "path";
import fs from "fs";

/**
 * Save data to the data directory at the project's root.
 */
export const saveToFs = (fileName: string, data: string) => {
  const dir = path.join(__dirname, "../..", "data");

  const file = path.join(dir, fileName);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(file, data);
};
