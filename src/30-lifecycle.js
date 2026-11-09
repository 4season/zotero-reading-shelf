// SPDX-License-Identifier: AGPL-3.0-only
let root;
let assetVersion = "dev";
let descriptionRenderer;
let observerID;
let preferenceObservers = [];
const lookupQueue = new Map();
const MAX_COVER_LOOKUPS = 4;
let activeLookups = 0;
const coverQueue = new Map();
const failedCovers = new Map();
// Thumbnails and note excerpts that were already produced, by item ID, so reopening a paper's
// notes and attachments reuses them instead of reading the cache files and parsing notes again.
const coverMemo = new Map();
const noteExcerpts = new Map();
function forgetCover(card) {
  coverMemo.delete(card.item.id);
  if (card.attachment?.id !== undefined) coverMemo.delete(card.attachment.id);
}
function remember(map, id, value) {
  map.delete(id);
  map.set(id, value);
  if (map.size > 400) map.delete(map.keys().next().value);
}
let renderingCover = false;

function install() {}
function uninstall() {}

// Settings were stored under the old "syllabus-lite" name before 1.2.4. Copy every value the user
// has set to the new name once, without overwriting anything already stored there. The old values
// are left in place so that downgrading keeps working.
function migratePreferences() {
  const flag = PREF + "migratedLegacyPreferences";
  if (readPref(flag) === true) return;
  try {
    const legacy = Services.prefs.getBranch(LEGACY_PREF);
    for (const name of legacy.getChildList("")) {
      if (!legacy.prefHasUserValue(name) || Services.prefs.prefHasUserValue(PREF + name)) continue;
      switch (legacy.getPrefType(name)) {
        case legacy.PREF_BOOL: setPref(name, legacy.getBoolPref(name)); break;
        case legacy.PREF_INT: setPref(name, legacy.getIntPref(name)); break;
        case legacy.PREF_STRING: setPref(name, legacy.getStringPref(name)); break;
      }
    }
    writePref(flag, true);
  } catch (error) {
    Zotero.logError(error);
  }
}

async function startup({ id, rootURI, version }) {
  migratePreferences();
  root = rootURI;
  assetVersion = version || "dev";
  statusColumn = await Zotero.ItemTreeManager.registerColumn({
    pluginID: id, dataKey: "readingStatus", label: "Reading Shelf", width: "190",
    dataProvider: item => [tableStatus(item), importantOf(item) ? "important" : "", urgentOf(item) ? "urgent" : ""].join("|"),
    renderCell: function(index, data, column, _first, doc) {
      const cell = doc.createElementNS("http://www.w3.org/1999/xhtml", "span");
      cell.className = "cell sl-table-workflow " + (column.className || "");
      const item = doc.defaultView?.ZoteroPane?.itemsView?.getRow(index)?.ref;
      // Notes get only importance and urgency; notes nested under a reference are left alone.
      if (!item || (item.isNote?.() && item.parentItemID)) return cell;
      const [status, important, urgent] = String(data).split("|");
      if (!item.isNote?.()) {
        const picker = createStatusPicker(doc, status || "", value => setItemStatus([item], value), true);
        cell.append(picker.wrapper);
      } else {
        // Notes have no status; an empty slot keeps ★ and ◷ in the same columns as the other rows.
        cell.append(doc.createElementNS("http://www.w3.org/1999/xhtml", "span"));
      }
      for (const [name, enabled, symbol, label] of [
        ["important", !!important, "★", "Important"], ["urgent", !!urgent, "◷", "Urgent"]
      ]) {
        const button = doc.createElementNS("http://www.w3.org/1999/xhtml", "button");
        button.className = "sl-table-priority sl-status-" + name;
        button.style.setProperty("--sl-priority-color", workflowColor(name));
        button.textContent = name === "important" ? (enabled ? "★" : "☆") : (enabled ? "◷" : "○");
        button.title = tr(label) + ": " + tr(enabled ? "On" : "Off");
        button.setAttribute("aria-label", button.title);
        button.setAttribute("aria-pressed", String(enabled));
        button.dataset.hideEmpty = String(getPref("hideEmptyStatus") !== false);
        button.addEventListener("click", event => {
          event.stopPropagation();
          setPriority([item], name, !(name === "important" ? importantOf(item) : urgentOf(item)));
        });
        cell.append(button);
      }
      cell.addEventListener("mousedown", event => event.stopPropagation());
      cell.addEventListener("dblclick", event => event.stopPropagation());
      watchCompact(cell, doc.defaultView);
      return cell;
    }
  });
  statusMenu = await Zotero.MenuManager.registerMenu({
    pluginID: id, menuID: "reading-shelf-status", target: "main/library/item",
    menus: [{ menuType: "submenu", onShowing: (_event, context) => {
      context.menuElem.setAttribute("label", "Reading Shelf · " + tr("Reading status"));
      context.setEnabled(!!context.items?.length);
    }, menus: Object.entries(STATUS_LABELS).map(([status, label]) => ({
      menuType: "menuitem",
      onShowing: (_event, context) => {
        context.menuElem.setAttribute("label", tr(label));
        context.menuElem.hidden = status === "selected" && !journalMode();
        context.menuElem.setAttribute("type", "checkbox");
        context.menuElem.setAttribute("checked", String(context.items?.length > 0 &&
          context.items.every(item => tableStatus(item) === status)));
      },
      onCommand: (_event, context) => setItemStatus(context.items || [], status)
    })).concat(["important", "urgent"].map(name => ({
      menuType: "menuitem", onShowing: (_event, context) => {
        context.menuElem.setAttribute("label", tr(name === "important" ? "Important" : "Urgent"));
        context.menuElem.setAttribute("type", "checkbox");
        context.menuElem.setAttribute("checked", String(context.items?.every(name === "important" ? importantOf : urgentOf)));
      }, onCommand: (_event, context) => setPriority(context.items || [], name,
        !context.items?.every(name === "important" ? importantOf : urgentOf))
    }))) }]
  });
  infoRow = await Zotero.ItemPaneManager.registerInfoRow({
    pluginID: id, rowID: "reading-shelf-workflow", position: "start", editable: false,
    label: { l10nID: "", text: "Reading Shelf" },
    onGetData: ({ item }) => [tableStatus(item) ? tr(STATUS_LABELS[tableStatus(item)]) : "", importantOf(item) ? tr("Important") : "", urgentOf(item) ? tr("Urgent") : ""].filter(Boolean).join(" · "),
    onItemChange: ({ item, setEnabled }) => setEnabled(!!item && !item.isNote?.())
  });
  Zotero.Reader.registerEventListener("renderToolbar", onReaderToolbar, id);
  await Zotero.PreferencePanes.register({
    pluginID: id,
    src: "settings.xhtml",
    scripts: ["settings.js"],
    stylesheets: ["settings.css?v=" + encodeURIComponent(assetVersion)],
    image: "icons/reading-shelf.svg",
    label: "Reading Shelf"
  }).catch(error => Zotero.logError(error));
  preferenceObservers = VISIBILITY_PREFS.map(([key]) => Zotero.Prefs.registerObserver(PREF + key, () => {
    for (const view of windows.values()) view.applyVisibilitySettings();
  }, true));
  preferenceObservers.push(Zotero.Prefs.registerObserver(PREF + "motion", () => {
    for (const view of windows.values()) view.applyMotion();
  }, true));
  preferenceObservers.push(Zotero.Prefs.registerObserver(PREF + "pendingRevert", () => {
    const [scope] = String(getPref("pendingRevert") || "").split("@");
    if (!scope) return;
    const dot = scope.indexOf(".");
    const collection = scope === "*" ? null : Zotero.Collections.getByLibraryAndKey(Number(scope.slice(0, dot)), scope.slice(dot + 1));
    if (scope === "*" || collection) revertSelectedStatuses(collection);
  }, true));
  for (const key of ["language", "matrixMode", "rememberCollectionMode", "hideEmptyStatus", "modeRevision", "journalClubMode", "journalGlow", "sortReadingOrder", "selectedImpliesUrgent", "expandChildren"]) {
    preferenceObservers.push(Zotero.Prefs.registerObserver(PREF + key, () => {
      for (const view of windows.values()) view.sync();
      refreshWorkflow();
    }, true));
  }
  for (const key of ["shadowStrength", "shadowDark", "matrixBorders", "matrixEqualHeight", "presentationColor", "urgentColor", "laterColor", "queueColor", "plannedColor", "readingColor", "completedColor", "selectedColor", "importantColor", "urgencyColor"]) {
    preferenceObservers.push(Zotero.Prefs.registerObserver(PREF + key, () => {
      for (const view of windows.values()) view.applyVisibilitySettings();
      if (Object.values(WORKFLOW_COLORS).some(([pref]) => pref === key)) refreshWorkflow(false);
    }, true));
  }
  observerID = Zotero.Notifier.registerObserver({
    notify(event, type, ids) {
      if (type === "item") {
        for (const id of ids) {
          coverMemo.delete(Number(id));
          noteExcerpts.delete(Number(id));
          const parentID = Zotero.Items?.get?.(Number(id))?.parentItemID;
          if (parentID) coverMemo.delete(parentID);
        }
      }
      if (type === "tab" && ["add", "select"].includes(event)) {
        for (const id of ids) {
          const reader = Zotero.Reader.getByTabID(id);
          if (reader) rememberReader(reader, id);
        }
      }
      if (type === "tab" && event === "close") closeReaderTabs(ids);
      for (const view of windows.values()) {
        if (type === "tab" && event === "select") view.sync();
        if (type === "collection" && view.collection && ids.includes(view.collection.id)) view.schedule();
        if (type === "item" && view.collection) {
          const parentID = view.expanded?.itemID ?? view.selection?.itemID;
          const parent = view.cards.get(parentID)?.item;
          if (parent?.isRegularItem() && ids.some(id => {
            const itemID = Number(id);
            return itemID === parentID || view.cards.get(itemID)?.child ||
              parent.getNotes().includes(itemID) || parent.getAttachments().includes(itemID);
          })) view.schedule();
        }
        if (type === "setting" && ids.some(id => String(id).includes("/lastPageIndex_"))) {
          view.refreshProgress();
        }
      }
    }
  }, ["tab", "setting", "collection", "item"], "reading-shelf");
  Zotero.uiReadyPromise.then(() => {
    if (!observerID) return;
    for (const window of Zotero.getMainWindows()) onMainWindowLoad({ window });
  }).catch(error => Zotero.logError(error));
}

function onMainWindowLoad({ window }) {
  if (windows.has(window)) return;
  const view = new Gallery(window);
  if (view.mount()) windows.set(window, view);
  // Reconcile readers already open before this plugin update, including background tabs/windows.
  for (const reader of Zotero.Reader._readers || []) rememberReader(reader);
}

function onMainWindowUnload({ window }) {
  windows.get(window)?.dispose();
  windows.delete(window);
}

function shutdown(_data, reason) {
  if (reason === APP_SHUTDOWN) return;
  Zotero.Reader.unregisterEventListener("renderToolbar", onReaderToolbar);
  if (infoRow) Zotero.ItemPaneManager.unregisterInfoRow(infoRow);
  if (statusColumn) Zotero.ItemTreeManager.unregisterColumn(statusColumn);
  if (statusMenu) Zotero.MenuManager.unregisterMenu(statusMenu);
  if (observerID) Zotero.Notifier.unregisterObserver(observerID);
  observerID = null;
  for (const observer of preferenceObservers) Zotero.Prefs.unregisterObserver(observer);
  preferenceObservers = [];
  orderStatusCache.clear();
  readerTabs.clear();
  coverMemo.clear();
  noteExcerpts.clear();
  for (const window of windows.keys()) onMainWindowUnload({ window });
}
