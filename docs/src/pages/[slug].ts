import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { CreatePageParams } from "@bean/core";

const pagesContentDirectory = path.join(process.cwd(), "src/content/pages");

const allPages = fs.readdirSync(pagesContentDirectory);

const pages = allPages.map((page) => {
  const pagePath = path.join(pagesContentDirectory, page);
  const pageData = fs.readFileSync(pagePath, { encoding: "utf-8" });
  return yaml.load(pageData);
});

export function createPage(ctx): CreatePageParams {
  const slug = ctx.params.slug.endsWith("/")
    ? ctx.params.slug.slice(0, -1)
    : ctx.params.slug;

  return {
    context: {
      slug,
      template: "base.njk",
      data: pages.find((page) => {
        let pageSlug = slug ? slug : "/";
        return pageSlug === page.permalink;
      }),
    },
  };
}

export function createPaths() {
  const paths = pages.map((page) => {
    return {
      slug: page.permalink,
    };
  });
  return {
    paths,
  };
}
