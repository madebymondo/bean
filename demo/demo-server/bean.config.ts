import { BeanConfig } from "@bean/core";
import { walkSync } from "@bean/core/dist/utils/walkSync.js";

export default function config(): BeanConfig {
  return {
    baseDirectory: "src",
    pagesDirectory: "pages",
    viewsDirectory: "views",
    watchTargets: ["**/*", "./bean.config.ts"],
    renderMode: "server",
    server: (app) => {
      app.use("/blog/*", (req, res, next) => {
        console.log("this is a blog post rendered on the server");

        next();
      });
    },
  };
}
