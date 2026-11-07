// SPDX-License-Identifier: AGPL-3.0-only
(() => {
  const prefix = "extensions.syllabus-lite.";
  const initialize = () => {
    const root = document.getElementById("sl-settings");
    if (!root) return;
    const language = Zotero.Prefs.get(prefix + "language", true) === "en" ? "en" : "ko";
    for (const node of root.querySelectorAll("[data-sl-en]")) {
      const text = node.getAttribute("data-sl-" + language);
      if (["checkbox", "menuitem", "menulist"].includes(node.localName)) node.setAttribute("label", text);
      else if (node.localName === "label" && node.hasAttribute("value")) node.setAttribute("value", text);
      else node.textContent = text;
    }
    for (const menu of root.querySelectorAll("menulist")) {
      if (menu.selectedItem) menu.setAttribute("label", menu.selectedItem.getAttribute("label"));
    }
    for (const node of root.querySelectorAll("[data-sl-color]")) {
      const value = Zotero.Prefs.get(prefix + node.getAttribute("data-sl-color"), true);
      if (/^#[0-9a-f]{6}$/i.test(value || "")) node.value = value;
    }
  };
  // Zotero loads pane scripts before inserting the fragment, then dispatches load/showing.
  document.addEventListener("load", event => { if (event.target.id === "sl-settings") initialize(); }, true);
  document.addEventListener("showing", event => { if (event.target.id === "sl-settings") initialize(); }, true);
  document.addEventListener("command", event => { if ((event.target.id === "sl-language" || event.target.closest?.("#sl-language"))) setTimeout(initialize, 0); }, true);
  document.addEventListener("change", event => {
    const key = event.target.getAttribute?.("data-sl-color");
    if (["urgentColor", "laterColor", "queueColor"].includes(key) && /^#[0-9a-f]{6}$/i.test(event.target.value)) {
      Zotero.Prefs.set(prefix + key, event.target.value, true);
    }
  }, true);
  initialize();
})();
