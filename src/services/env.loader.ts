import { existsSync, readFileSync } from "fs";
try {
  if (existsSync("./.env")) {

    const jsonContent = readFileSync("./.env", { encoding: "utf8", flag: "r" });
    if (jsonContent) {
      const jsonObject = JSON.parse(jsonContent);
      for (let key of Object.keys(jsonObject)) {
        process.env[key] = jsonObject[key];
      }
    }
  }
} catch (err) {
  // ignored
}