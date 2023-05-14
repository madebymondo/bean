import { BeanConfig } from "@bean/core";

export default function config(): BeanConfig {
  return {
    baseDirectory: "src",
    pagesDirectory: "pages",
    viewsDirectory: "views",
    watchTargets: ["**/*", "./bean.config.ts"],
    renderMode: "server",
    server: (app) => {
      app.use("/about", (res, req, next) => {
        console.log("this is the homepage");
        next();
      });

      app.use("*", (req, res, next) => {
        console.log("this is a page");
        next();
      });
    },
  };
}
