// SPDX-License-Identifier: AGPL-3.0-only
(() => {
  const apply = () => {
    const language = Zotero.Prefs.get("extensions.syllabus-lite.language", true) === "en" ? "en" : "ko";
    for (const node of document.querySelectorAll("#sl-settings [data-sl-en]")) {
      const text = node.getAttribute("data-sl-" + language);
      if (node.localName === "checkbox") node.setAttribute("label", text);
      else node.textContent = text;
    }
  };
  // Preference fragments are inserted before pane scripts are evaluated.
  apply();
  document.getElementById("sl-language")?.addEventListener("command", () => setTimeout(apply, 0));
})();
