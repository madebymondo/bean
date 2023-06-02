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
  { slug: "test/one", title: "Test one page" },
];

export function createPage(ctx): CreatePageParams {
  const slug = ctx.params.slug;
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
    };
  });

  return {
    paths,
  };
}
