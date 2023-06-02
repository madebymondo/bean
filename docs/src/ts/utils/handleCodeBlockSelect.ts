export function handleCodeBlockSelect() {
  const allCodeBlocks = document.querySelectorAll(".code-block__pre__code");

  allCodeBlocks.forEach((codeBlock) => {
    codeBlock.addEventListener("click", async (e) => {
      codeBlock.classList.add("code-block__pre__code--selected");
      await copyContent(codeBlock.textContent).then(() => {
          setTimeout(() => {

        codeBlock.classList.remove("code-block__pre__code--selected");
          }, 400)
      });
    });
  });
}

async function copyContent(content) {
  try {
    await navigator.clipboard.writeText(content);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
}
