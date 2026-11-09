// SPDX-License-Identifier: AGPL-3.0-only
(() => {
  const prefix = "extensions.reading-shelf.";
  const colorDefaults = {plannedColor:"#356b24",readingColor:"#1659b7",completedColor:"#6750a4",selectedColor:"#f08c00",presentationColor:"#f08c00",importantColor:"#e0a100",urgencyColor:"#a82330",urgentColor:"#c76a6a",laterColor:"#638ebd",queueColor:"#789866"};
  const resetGroups = {status:["plannedColor","readingColor","completedColor","selectedColor"],priority:["importantColor","urgencyColor"],borders:["urgentColor","laterColor","queueColor"],presentation:["presentationColor"],all:Object.keys(colorDefaults)};
  // The Eisenhower checkbox mirrors the gallery's mode button. With per-collection memory on, both
  // act on the collection selected in Zotero; otherwise they share the global mode.
  const selectedCollection = () => {
    try {
      const collection = Zotero.getMainWindow?.()?.ZoteroPane?.getSelectedCollection?.();
      return collection && collection.key ? collection : null;
    } catch (_) { return null; }
  };
  const rememberOn = () => Zotero.Prefs.get(prefix + "rememberCollectionMode", true) === true;
  // Two mirrored mode checkboxes: Eisenhower (matrix) and presentation. With per-collection memory on,
  // both act on the collection selected in Zotero; otherwise they share the global value.
  const modes = {
    matrix: { global: "matrixMode", folder: "collectionMode.", attribute: "data-sl-mode" },
    presentation: { global: "journalClubMode", folder: "presentationMode.", attribute: "data-sl-presentation" }
  };
  const modeKey = (collection, mode = modes.matrix) => prefix + mode.folder + collection.libraryID + "." + collection.key;
  const currentMode = (mode = modes.matrix) => {
    const collection = rememberOn() ? selectedCollection() : null;
    if (collection) {
      const saved = Zotero.Prefs.get(modeKey(collection, mode), true);
      if (typeof saved === "boolean") return saved;
    }
    return Zotero.Prefs.get(prefix + mode.global, true) === true;
  };
  const refreshModeCheckbox = () => {
    const root = document.getElementById("sl-settings");
    for (const mode of Object.values(modes)) {
      const box = root?.querySelectorAll?.("[" + mode.attribute + "]")?.[0];
      if (box && box.localName === "checkbox") box.checked = currentMode(mode);
    }
  };
  const applyModeChoice = (enabled, mode = modes.matrix) => {
    const collection = rememberOn() ? selectedCollection() : null;
    if (collection) {
      Zotero.Prefs.set(modeKey(collection, mode), enabled, true);
      // Tells the plugin to redraw; the per-collection key itself is not observed.
      Zotero.Prefs.set(prefix + "modeRevision", (Zotero.Prefs.get(prefix + "modeRevision", true) || 0) + 1, true);
    } else {
      Zotero.Prefs.set(prefix + mode.global, enabled, true);
    }
    if (mode === modes.presentation && !enabled) {
      // Asks the plugin to return "Selected" papers to their previous status (if that option is on).
      Zotero.Prefs.set(prefix + "pendingRevert", (collection ? collection.libraryID + "." + collection.key : "*") + "@" + Date.now(), true);
    }
  };
  const updateDependencies = () => {
    const root = document.getElementById("sl-settings");
    if (!root) return;
    // Follow the mode actually in effect (selected collection when memory is on), not the memory toggle.
    const matrix = currentMode(modes.matrix);
    const presentation = currentMode(modes.presentation);
    const borders = matrix && Zotero.Prefs.get(prefix + "matrixBorders", true) !== false;
    const shadows = Zotero.Prefs.get(prefix + "shadowStrength", true) !== "off";
    for (const node of root.querySelectorAll("[data-sl-depends]")) {
      const dependency = node.getAttribute("data-sl-depends");
      node.disabled = !(dependency === "matrixMode" ? matrix : dependency === "matrixBorders" ? borders :
        dependency === "presentationMode" ? presentation : shadows);
      node.setAttribute("aria-disabled", String(node.disabled));
      const row = node.closest?.(".sl-setting-row");
      if (row) row.setAttribute("data-disabled", String(node.disabled));
    }
  };
  const initialize = () => {
    const root = document.getElementById("sl-settings");
    if (!root) return;
    const language = Zotero.Prefs.get(prefix + "language", true) === "ko" ? "ko" : "en";
    for (const node of root.querySelectorAll("[data-sl-en]")) {
      const text = node.getAttribute("data-sl-" + language);
      if (["checkbox", "menuitem", "menulist", "button"].includes(node.localName)) node.setAttribute("label", text);
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
    updateDependencies();
    refreshModeCheckbox();
  };
  // Zotero loads pane scripts before inserting the fragment, then dispatches load/showing.
  document.addEventListener("load", event => { if (event.target.id === "sl-settings") initialize(); }, true);
  document.addEventListener("showing", event => { if (event.target.id === "sl-settings") initialize(); }, true);
  const persistColor = event => {
    const key = event.target.getAttribute?.("data-sl-color");
    if (Object.hasOwn(colorDefaults, key) && /^#[0-9a-f]{6}$/i.test(event.target.value)) {
      Zotero.Prefs.set(prefix + key, event.target.value, true);
      const root = document.getElementById("sl-settings");
      for (const field of root?.querySelectorAll("[data-sl-color]") || []) {
        if (field !== event.target && field.getAttribute("data-sl-color") === key) field.value = event.target.value;
      }
    }
  };
  // macOS color panels emit input while open and change only on close.
  document.addEventListener("input", persistColor, true);
  document.addEventListener("command", event => {
    const reset = event.target.closest?.("[data-sl-reset-colors]") || event.target;
    const group = reset.getAttribute?.("data-sl-reset-colors");
    if (resetGroups[group]) {
      for (const key of resetGroups[group]) Zotero.Prefs.set(prefix + key, colorDefaults[key], true);
      initialize();
      return;
    }
    const modeBox = event.target.closest?.("checkbox[data-sl-mode]");
    if (modeBox?.localName === "checkbox" && modeBox.hasAttribute?.("data-sl-mode") === true) {
      applyModeChoice(modeBox.checked === true);
      setTimeout(() => { updateDependencies(); refreshModeCheckbox(); }, 0);
      return;
    }
    const presentationBox = event.target.closest?.("checkbox[data-sl-presentation]");
    if (presentationBox?.localName === "checkbox" && presentationBox.hasAttribute?.("data-sl-presentation") === true) {
      applyModeChoice(presentationBox.checked === true, modes.presentation);
      setTimeout(() => { updateDependencies(); refreshModeCheckbox(); }, 0);
      return;
    }
    const control = event.target.closest?.("checkbox[preference], menulist[preference]");
    const pref = control?.getAttribute?.("preference");
    if (pref?.startsWith(prefix)) {
      const value = control.localName === "checkbox" ? control.checked : control.value;
      if (typeof value === "boolean" || typeof value === "string") Zotero.Prefs.set(pref, value, true);
    }
    if (event.target.id === "sl-language" || event.target.closest?.("#sl-language")) setTimeout(initialize, 0);
    else if (event.target.closest?.("#sl-settings")) setTimeout(() => { updateDependencies(); refreshModeCheckbox(); }, 0);
  }, true);
  document.addEventListener("change", event => {
    if (event.target.closest?.("#sl-settings")) setTimeout(updateDependencies, 0);
    persistColor(event);
  }, true);
  // Keep the checkbox current when the gallery's mode button is used while this pane is open.
  if (Zotero.Prefs.registerObserver) {
    const observers = ["matrixMode", "journalClubMode", "rememberCollectionMode", "modeRevision"].map(key =>
      Zotero.Prefs.registerObserver(prefix + key, () => { updateDependencies(); refreshModeCheckbox(); }, true));
    document.defaultView?.addEventListener("unload", () => observers.forEach(id => Zotero.Prefs.unregisterObserver(id)), { once: true });
  }
  initialize();
})();
