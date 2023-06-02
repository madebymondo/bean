import { BeanConfig } from "@bean/core";
import { marked } from "marked";

export default function config(): BeanConfig {
  return {
    baseDirectory: "src",
    pagesDirectory: "pages",
    viewsDirectory: "views",
    templateFilters: [markdownFilter],
  };
}

function markdownFilter(engine) {
  engine.addFilter("md", (value) => {
    if (!value) return;

    return marked.parse(value.trim());
  });
}
