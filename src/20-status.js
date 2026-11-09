// SPDX-License-Identifier: AGPL-3.0-only
let statusColumn;
let statusMenu;
const orderStatusCache = new Map();
const STATUS_LABELS = { "": "No status", planned: "To read", selected: "Selected", reading: "Reading", completed: "Completed" };
// Presentation mode adds a lane (and the "Selected" status) for the paper being presented.
// The "Selected" status exists while presentation mode is on, or on for some collections (per-collection memory).
function journalMode() { return getPref("journalClubMode") === true || getPref("rememberCollectionMode") === true; }
function statusEntries() { return Object.entries(STATUS_LABELS).filter(([value]) => value !== "selected" || journalMode()); }
const WORKFLOW_COLORS = { planned: ["plannedColor", "#356b24"], selected: ["selectedColor", "#f08c00"], reading: ["readingColor", "#1659b7"], completed: ["completedColor", "#6750a4"], important: ["importantColor", "#e0a100"], urgent: ["urgencyColor", "#a82330"] };
function workflowColor(name) {
  const [key, fallback] = WORKFLOW_COLORS[name] || ["", "#70747a"];
  const value = key && getPref(key);
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
}
// `sized` (table cells) adds invisible copies of every label, so the picker is as wide as the longest
// label while the pill itself stays at its own width, aligned to the left edge of that slot.
function createStatusPicker(doc, status, onChange, sized = false) {
  const make = tag => doc.createElementNS("http://www.w3.org/1999/xhtml", tag);
  const wrapper = make("label");
  wrapper.className = "sl-status-picker sl-status-" + status;
  wrapper.style.setProperty("--sl-status-color", workflowColor(status));
  wrapper.dataset.empty = String(!status);
  wrapper.dataset.hideEmpty = String(getPref("hideEmptyStatus") !== false);
  // When the table column is too narrow for the text, the pill shrinks to a colored dot; the title names it.
  wrapper.title = tr(STATUS_LABELS[status] || STATUS_LABELS[""]);
  const face = make("span");
  face.className = "sl-status-face";
  face.setAttribute("aria-hidden", "true");
  face.textContent = tr(STATUS_LABELS[status] || STATUS_LABELS[""]);
  // Stands in for the text when a table column is too narrow (see watchCompact).
  const dot = make("span");
  dot.className = "sl-status-dot";
  dot.setAttribute("aria-hidden", "true");
  const select = make("select");
  select.className = "sl-status-control";
  select.setAttribute("aria-label", tr("Reading status"));
  for (const [value, label] of statusEntries()) {
    const option = make("option");
    option.value = value;
    option.textContent = tr(label);
    select.append(option);
  }
  select.value = status;
  select.addEventListener("click", event => event.stopPropagation());
  select.addEventListener("dblclick", event => event.stopPropagation());
  let pointerSelection = false;
  select.addEventListener("pointerdown", () => { pointerSelection = true; });
  select.addEventListener("keydown", event => { pointerSelection = false; if (event.key === "Escape") select.blur(); });
  select.addEventListener("change", () => {
    face.textContent = tr(STATUS_LABELS[select.value]);
    wrapper.title = face.textContent;
    wrapper.className = "sl-status-picker sl-status-" + select.value;
    wrapper.style.setProperty("--sl-status-color", workflowColor(select.value));
    wrapper.dataset.empty = String(!select.value);
    onChange(select.value);
    if (pointerSelection) { pointerSelection = false; select.blur(); }
  });
  wrapper.append(face, select, dot);
  if (sized) {
    const sizer = make("span");
    sizer.className = "sl-status-sizer";
    sizer.setAttribute("aria-hidden", "true");
    for (const [, label] of statusEntries()) {
      const copy = make("span");
      copy.textContent = tr(label);
      sizer.append(copy);
    }
    wrapper.append(sizer);
  }
  return { wrapper, select, face };
}
// When a table cell is too narrow for the status text, the pill turns into a colored dot rather than
// clipping its label. The cell is measured for real (is the text cut?), so the switch happens exactly
// when needed for any label length and column width.
function watchCompact(cell, win) {
  if (!win?.ResizeObserver) return;
  const update = () => {
    cell.dataset.compact = "false"; // measure with the full text
    const face = cell.querySelector(".sl-status-face");
    cell.dataset.compact = String(!!face && cell.clientWidth > 0 && face.scrollWidth > face.clientWidth);
  };
  new win.ResizeObserver(update).observe(cell);
  update();
}
function statusItem(item) { return item?.parentItemID ? (Zotero.Items.get(item.parentItemID) || item) : item; }
function itemPref(item, name) { item = statusItem(item); return PREF + name + "." + item.libraryID + "." + item.key; }
// Option: a "Selected" paper counts as important and urgent while it is selected (nothing is stored, so
// the marks it had before come back on their own when it is no longer selected).
function impliedBySelected(item) { return getPref("selectedImpliesUrgent") === true && tableStatus(item) === "selected"; }
function importantOf(item) { return readPref(itemPref(item, "important")) === true || readPref(itemPref(item, "status")) === "important" || impliedBySelected(item); }
function urgentOf(item) { return readPref(itemPref(item, "urgent")) === true || impliedBySelected(item); }
function refreshWorkflow(relayout = true) {
  // Refresh row values, not column definitions: native columns otherwise cache stale cell data.
  for (const view of windows.values()) {
    const tree = view.pane.itemsView;
    tree?.invalidateRowCache?.(true);
    tree?.tree?.invalidate?.();
    for (const card of view.cards.values()) view.refreshStatus(card);
    if (relayout && view.gallery) view.animateLayout(() => view.layoutCards(view.orderKeys));
  }
  if (infoRow) Zotero.ItemPaneManager.refreshInfoRow(infoRow);
}
function removeFromReadingOrders(items) {
  const keys = new Set(items.map(item => statusItem(item).libraryID + "." + statusItem(item).key));
  const collections = new Map();
  for (const item of items) for (const id of statusItem(item).getCollections?.() || []) {
    const collection = Zotero.Collections.get(id);
    if (collection) collections.set(collection.id, collection);
  }
  for (const view of windows.values()) if (view.collection) collections.set(view.collection.id, view.collection);
  for (const collection of collections.values()) {
    const data = readingData(collection);
    const order = data.order.filter(key => !keys.has(collection.libraryID + "." + key));
    if (order.length !== data.order.length) writePref(preferenceKey(collection), JSON.stringify({ ...data, order }));
  }
  for (const view of windows.values()) if (view.collection && view.gallery && view.unorderedCards) {
    view.orderKeys = readingData(view.collection).order;
    view.animateLayout(() => view.layoutCards(view.orderKeys));
  }
}
function collectionModeKey(collection) { return PREF + "collectionMode." + collection.libraryID + "." + collection.key; }
function matrixModeFor(collection) {
  if (collection && getPref("rememberCollectionMode") === true) {
    const saved = readPref(collectionModeKey(collection));
    if (typeof saved === "boolean") return saved;
  }
  return getPref("matrixMode") === true;
}
function presentationKey(collection) { return PREF + "presentationMode." + collection.libraryID + "." + collection.key; }
// Whether the presentation lane is shown for this collection: remembered per collection when that option is on.
function presentationModeFor(collection) {
  if (collection && getPref("rememberCollectionMode") === true) {
    const saved = readPref(presentationKey(collection));
    if (typeof saved === "boolean") return saved;
  }
  return getPref("journalClubMode") === true;
}
const readerTabs = new Map();
function rememberReader(reader, tabID = reader.tabID) {
  // Switching back to an already-tracked tab must not override a status the user changed meanwhile.
  if (tabID && readerTabs.get(tabID) === reader.itemID) return;
  if (tabID) readerTabs.set(tabID, reader.itemID);
  markReading(Zotero.Items.get(reader.itemID));
}
function closeReaderTabs(ids) {
  const closed = new Set(ids.flat(Infinity));
  const itemIDs = new Set();
  for (const id of closed) { const itemID = readerTabs.get(id); if (itemID) itemIDs.add(itemID); readerTabs.delete(id); }
  if (getPref("clearStatusOnClose") !== true) return;
  const items = [];
  for (const id of itemIDs) {
    const item = statusItem(Zotero.Items.get(id));
    if (!item || tableStatus(item) !== "reading") continue;
    const stillOpen = [...readerTabs.values()].some(other => {
      const parent = statusItem(Zotero.Items.get(other));
      return parent?.libraryID === item.libraryID && parent?.key === item.key;
    });
    if (!stillOpen) items.push(item);
  }
  // Return to the status the paper had before it was opened, rather than clearing it.
  for (const item of items) {
    const previous = readPref(itemPref(item, "statusBeforeReading"));
    setItemStatus([item], Object.hasOwn(STATUS_LABELS, previous) && previous !== "reading" ? previous : "");
  }
}

// Presentation mode turned off with the "return to previous status" option: every Selected paper (of the
// collection, or all when the mode is global) goes back to the status it had before it was selected.
function revertSelectedStatuses(collection) {
  if (getPref("presentationRevert") !== true) return;
  const branch = Services.prefs.getBranch(PREF + "status.");
  const items = [];
  for (const name of branch.getChildList("")) {
    if (branch.getStringPref(name, "") !== "selected") continue;
    const dot = name.indexOf(".");
    const item = Zotero.Items.getByLibraryAndKey(Number(name.slice(0, dot)), name.slice(dot + 1));
    if (item && !item.deleted && (!collection || item.inCollection?.(collection.id))) items.push(item);
  }
  for (const item of items) {
    const previous = readPref(itemPref(item, "statusBeforeSelected"));
    setItemStatus([item], Object.hasOwn(STATUS_LABELS, previous) && previous !== "selected" ? previous : "");
  }
}
// "lib.key" of a collection (or "*" for everything) plus a time stamp, so repeating it still notifies observers.
function requestRevert(collection) {
  setPref("pendingRevert", (collection ? collection.libraryID + "." + collection.key : "*") + "@" + Date.now());
}
// A paper that becomes "Selected" goes to the end of the presentation order of its collections, so it lands
// after the papers already there instead of wherever the table order (or an old position) would put it.
function addToPresentationOrders(items) {
  const collections = new Map();
  for (const item of items) for (const id of statusItem(item).getCollections?.() || []) {
    const collection = Zotero.Collections.get(id);
    if (collection) collections.set(collection.id, collection);
  }
  for (const view of windows.values()) if (view.collection) collections.set(view.collection.id, view.collection);
  const keys = items.map(item => statusItem(item).key);
  for (const collection of collections.values()) {
    const data = readingData(collection);
    const journal = [...data.journal.filter(key => !keys.includes(key)), ...keys];
    writePref(preferenceKey(collection), JSON.stringify({ ...data, journal }));
  }
}
function setItemStatus(items, status) {
  if (!Object.hasOwn(STATUS_LABELS, status)) return;
  let changed = false;
  let priorityChanged = false;
  let shelfChanged = false;
  const picked = [];
  for (let item of items) {
    item = statusItem(item);
    if (readPref(itemPref(item, "status")) === "important") {
      writePref(itemPref(item, "important"), true);
      priorityChanged = true;
    }
    shelfChanged ||= Boolean(tableStatus(item)) !== Boolean(status) || tableStatus(item) === "completed" || status === "completed" || tableStatus(item) === "selected" || status === "selected";
    if (readPref(itemPref(item, "status")) === status) continue;
    if (status === "reading" || status === "selected") {
      // Remember where the paper came from, so it can go back there later.
      const before = tableStatus(item);
      if (before !== status) writePref(itemPref(item, status === "reading" ? "statusBeforeReading" : "statusBeforeSelected"), before);
    }
    if (status === "selected") picked.push(item);
    writePref(itemPref(item, "status"), status); changed = true;
  }
  if (picked.length) addToPresentationOrders(picked);
  if (status === "" || status === "completed") removeFromReadingOrders(items);
  if (changed) refreshWorkflow(priorityChanged || shelfChanged);
}
function setPriority(items, name, value) {
  for (const item of items) {
    if (readPref(itemPref(item, "status")) === "important") {
      writePref(itemPref(item, "important"), true);
      writePref(itemPref(item, "status"), "planned");
    }
    writePref(itemPref(item, name), value);
  }
  refreshWorkflow();
}
function markReading(item) {
  if (!item || item.isNote?.()) return;
  // Opening the paper chosen for presentation must not move it out of its lane.
  if (tableStatus(item) === "selected") return;
  setItemStatus([statusItem(item)], "reading");
}
function onReaderToolbar({ reader }) { rememberReader(reader); }
function tableStatus(item) {
  item = statusItem(item);
  const status = readPref(itemPref(item, "status"));
  if (status === "important") return "planned"; // Migrate beta.1's combined field without losing priority.
  if (status === "selected" && !journalMode()) return "planned"; // Kept stored, shown as "To read" while the mode is off.
  if (typeof status === "string" && Object.hasOwn(STATUS_LABELS, status)) return status;
  for (const id of item.getCollections?.() ?? []) {
    try {
      const collection = Zotero.Collections.get(id);
      const raw = readPref(preferenceKey(collection));
      if (!raw) continue;
      let cached = orderStatusCache.get(id);
      if (cached?.raw !== raw) {
        cached = { raw, keys: new Set(JSON.parse(raw).order || []) };
        if (orderStatusCache.size >= 128) orderStatusCache.delete(orderStatusCache.keys().next().value);
        orderStatusCache.set(id, cached);
      }
      if (cached.keys.has(item.key)) return "planned";
    } catch (_) {}
  }
  return "";
}
let infoRow;
