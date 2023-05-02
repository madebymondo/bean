import { CreatePageParams } from "@bean/core";

const pages = [
  { post: "post-one", title: "Post one" },
  {
    post: "post-two",
    title: "post 2",
  },
];
export function createPage(ctx): CreatePageParams {
  const post = ctx.params.post;
  return {
    context: {
      path: post,
      template: "base.njk",
      data: pages.find((page) => page.post === post),
    },
  };
}

export function createPaths() {
  const paths = pages.map((page) => {
    return {
      path: `blog/${page.post}`,
    };
  });

  return {
    paths,
  };
}
