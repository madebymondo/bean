import { CreatePageParams } from "@bean/core";

const pages = [
  { slug: "/", title: "Homepage" },
  {
    slug: "about",
    title: "About Page",
  },
  {
    slug: "work",
    title: "Work Page 2",
  },
];

export function createPage(ctx): CreatePageParams {
  const slug = ctx.params.slug;
  return {
    context: {
      path: slug,
      template: "base.njk",
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
