import { BeanConfig } from "@bean/core";

export default function config(): BeanConfig {
  return {
    baseDirectory: "src",
    pagesDirectory: "pages",
    viewsDirectory: "views",
  };
}
