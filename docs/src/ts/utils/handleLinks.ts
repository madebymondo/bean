export function handleLinks() {
  const allLinks = document.querySelectorAll("a");

  allLinks.forEach((link) => {
    const isExternal = isExternalLink(link.href);
    if (isExternal) {
      link.setAttribute("target", "_blank");
    }
  });
}

/**
 * Checks if a url is external
 * */
function isExternalLink(url: string) {
  const tempLink = document.createElement("a");
  tempLink.href = url;
  return tempLink.host !== window.location.host;
}
