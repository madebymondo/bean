import { CreatePageParams } from "@bean/core";

const pages = [
  { slug: "/", title: "Homepage" },
  {
    slug: "about",
    title: "About Page",
  },
  {
    slug: "Work",
    title: "Work Page",
  },
];

export function createPage(ctx): CreatePageParams {
  const slug = ctx.params.slug;
  return {
    context: {
      path: slug,
      template: "page.njk",
      data: pages.find((page) => page.slug === slug),
    },
  };
}

export function createPaths() {
  const paths = pages.map((page) => {
    return {
      path: page.slug,
    };
  });

  return {
    paths,
  };
}
