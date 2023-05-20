import { CreatePageParams } from "@bean/core";

const pages = [
  { slug: "/", title: "Homepage" },
  {
    slug: "about",
    title: `Server About Page`,
    content:
      "## this is the content test\n content goes here\n - item one\n - item two",
  },
  {
    slug: "work",
    title: "Server Work Page ",
  },
  { slug: "test/one", title: "Server Test one" },
];

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
        return pageSlug === page.slug;
      }),
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
