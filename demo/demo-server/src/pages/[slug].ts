import { CreatePageParams } from "@bean/core";

const pages = [
  { slug: "/", title: "Homepage" },
  {
    slug: "about",
    title: "Server About Page",
  },
  {
    slug: "work",
    title: "Server Work Page ",
  },
  { slug: "test/one", title: "Server Test one" },
];

export function createPage(ctx): CreatePageParams {
  const slug = ctx.params.slug;
  return {
    context: {
      slug,
      template: "base.njk",
      data: pages.find((page) => page.slug === slug),
    },
  };
}

export function createPaths() {
  const paths = pages.map((page) => {
    return {
      slug: page.slug,
      prerender: true,
    };
  });

  return {
    paths,
  };
}
