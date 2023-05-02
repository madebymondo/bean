import { BeanConfig } from "@bean/core";

export default function config(): BeanConfig {
  return {
    pagesDirectory: "src/pages",
    viewsDirectory: "src/views",
    watchTargets: ["src/**/*"],
  };
}
