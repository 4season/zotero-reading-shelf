// SPDX-License-Identifier: AGPL-3.0-only
const PREF = "extensions.reading-shelf.";
const LEGACY_PREF = "extensions.syllabus-lite.";
const NAME = "Reading Shelf";
const VISIBILITY_PREFS = [
  ["hideCardButtons", "sl-hide-card-buttons"],
  ["hideChildIndicator", "sl-hide-child-indicator"],
  ["hideSizeControl", "sl-hide-size"],
  ["hideSortControl", "sl-hide-sort"],
  ["hideModeControl", "sl-hide-mode"]
];
const LEGACY_TAG = "zotero-syllabus-personal-reading-order";
const MANAGED_NOTE_TAGS = [LEGACY_TAG, "zotero-syllabus", "zotero-syllabus-pinned-collection"];
const PDF_BASE = "resource://zotero/reader/pdf/";
const CARD_GAP = 17;
const BASE_CARD_WIDTH = 176;
const MIN_CARD_SCALE = 65;
const MAX_CARD_SCALE = 150;
const windows = new Map();
// Gentle ease-in-out so motion starts and ends softly instead of jumping on the first frame.
const MOTION_EASING = "cubic-bezier(.4,0,.2,1)";
const MOTION_MS = 280;
let statusColumn;
let statusMenu;
const orderStatusCache = new Map();
const STATUS_LABELS = { "": "No status", planned: "To read", reading: "Reading", completed: "Completed" };
const UI_KO = {
  "On":"켜짐", "Off":"꺼짐", "Bookshelf":"일반 서재", "Eisenhower":"아이젠하워", "No status":"상태 없음", "To read":"읽을 예정", "Reading":"읽는 중", "Completed":"완료됨", "No completed items.":"완료한 자료가 없습니다.", "Important":"중요", "Urgent":"긴급",
  "Gallery":"갤러리", "Table":"테이블", "Reading order":"읽기 목록", "Unordered items":"미분류 자료",
  "Card size":"자료 크기", "Sort ▾":"정렬 ▾", "Table order":"테이블 순서", "Title":"제목", "Author":"저자", "Year":"연도", "Added":"추가일", "Date added":"추가일",
  "Save":"저장", "Cancel":"취소", "Child note":"부속 노트", "Note":"노트", "Preview":"미리보기",
  "No creator in Zotero":"등록된 저자 없음", "No preview":"미리보기 없음", "No attachment":"첨부파일 없음", "Web link":"웹 링크", "Web snapshot":"웹 스냅샷", "Image":"이미지", "File":"파일", "Untitled note":"제목 없는 노트",
  "Add a collection description…":"컬렉션 설명을 입력하세요…", "Add a collection description...":"컬렉션 설명을 입력하세요…",
  "Drag papers here or use + on a card.":"자료를 끌어 놓거나 + 버튼으로 추가하세요.", "No unordered items.":"미분류 자료가 없습니다.",
  "Urgent & important":"긴급하고 중요한 자료", "Important, not urgent":"중요하지만 덜 급한 자료", "Other items":"그 밖의 자료",
  "Reading queue":"읽기 대기열", "Edit description":"메모 편집", "Drop here":"여기에 놓으세요", "Empty note":"빈 노트", "Reading status":"읽기 상태", "Priority":"중요도",
  "Double-click to open":"더블클릭하여 열기", "Select item, double-click to open":"자료 선택, 더블클릭하여 열기", "Click to show notes and attachments":"클릭하여 노트와 첨부파일 보기", "Double-click or press Enter to edit":"더블클릭하거나 Enter 키로 수정", "Add to reading order":"읽기 목록에 추가", "Remove from reading order":"읽기 목록에서 제외", "Move left / right with Alt + arrow keys":"Alt + 방향키로 순서 이동", "Pages":"페이지", "Heading":"제목", "bold":"굵게", "inline math":"인라인 수식", "separate equation":"별도 수식",
  "Sort unordered items":"미분류 자료 정렬", "Collection description":"컬렉션 설명", "Reading progress":"읽기 진행률",
  "Could not load this gallery.":"갤러리를 불러오지 못했습니다.", "The gallery change could not be saved.":"변경사항을 저장하지 못했습니다."
};
function tr(text) { return Zotero.Prefs.get(PREF + "language", true) === "en" ? text : (UI_KO[text] || text); }
const WORKFLOW_COLORS = { planned: ["plannedColor", "#356b24"], reading: ["readingColor", "#1659b7"], completed: ["completedColor", "#6750a4"], important: ["importantColor", "#8a4b00"], urgent: ["urgencyColor", "#a82330"] };
function workflowColor(name) {
  const [key, fallback] = WORKFLOW_COLORS[name] || ["", "#70747a"];
  const value = key && Zotero.Prefs.get(PREF + key, true);
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
}
function createStatusPicker(doc, status, onChange) {
  const make = tag => doc.createElementNS("http://www.w3.org/1999/xhtml", tag);
  const wrapper = make("label");
  wrapper.className = "sl-status-picker sl-status-" + status;
  wrapper.style.setProperty("--sl-status-color", workflowColor(status));
  wrapper.dataset.empty = String(!status);
  wrapper.dataset.hideEmpty = String(Zotero.Prefs.get(PREF + "hideEmptyStatus", true) !== false);
  const face = make("span");
  face.className = "sl-status-face";
  face.setAttribute("aria-hidden", "true");
  face.textContent = tr(STATUS_LABELS[status] || STATUS_LABELS[""]);
  const select = make("select");
  select.className = "sl-status-control";
  select.setAttribute("aria-label", tr("Reading status"));
  for (const [value, label] of Object.entries(STATUS_LABELS)) {
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
    wrapper.className = "sl-status-picker sl-status-" + select.value;
    wrapper.style.setProperty("--sl-status-color", workflowColor(select.value));
    wrapper.dataset.empty = String(!select.value);
    onChange(select.value);
    if (pointerSelection) { pointerSelection = false; select.blur(); }
  });
  wrapper.append(face, select);
  return { wrapper, select, face };
}
function statusItem(item) { return item?.parentItemID ? (Zotero.Items.get(item.parentItemID) || item) : item; }
function itemPref(item, name) { item = statusItem(item); return PREF + name + "." + item.libraryID + "." + item.key; }
function importantOf(item) { return Zotero.Prefs.get(itemPref(item, "important"), true) === true || Zotero.Prefs.get(itemPref(item, "status"), true) === "important"; }
function urgentOf(item) { return Zotero.Prefs.get(itemPref(item, "urgent"), true) === true; }
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
    if (order.length !== data.order.length) Zotero.Prefs.set(preferenceKey(collection), JSON.stringify({ ...data, order }), true);
  }
  for (const view of windows.values()) if (view.collection && view.gallery && view.unorderedCards) {
    view.orderKeys = readingData(view.collection).order;
    view.animateLayout(() => view.layoutCards(view.orderKeys));
  }
}
function collectionModeKey(collection) { return PREF + "collectionMode." + collection.libraryID + "." + collection.key; }
function matrixModeFor(collection) {
  if (collection && Zotero.Prefs.get(PREF + "rememberCollectionMode", true) === true) {
    const saved = Zotero.Prefs.get(collectionModeKey(collection), true);
    if (typeof saved === "boolean") return saved;
  }
  return Zotero.Prefs.get(PREF + "matrixMode", true) === true;
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
  if (Zotero.Prefs.get(PREF + "clearStatusOnClose", true) !== true) return;
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
  if (items.length) setItemStatus(items, "");
}
function setItemStatus(items, status) {
  if (!Object.hasOwn(STATUS_LABELS, status)) return;
  let changed = false;
  let priorityChanged = false;
  let shelfChanged = false;
  for (let item of items) {
    item = statusItem(item);
    if (Zotero.Prefs.get(itemPref(item, "status"), true) === "important") {
      Zotero.Prefs.set(itemPref(item, "important"), true, true);
      priorityChanged = true;
    }
    shelfChanged ||= Boolean(tableStatus(item)) !== Boolean(status) || tableStatus(item) === "completed" || status === "completed";
    if (Zotero.Prefs.get(itemPref(item, "status"), true) === status) continue;
    Zotero.Prefs.set(itemPref(item, "status"), status, true); changed = true;
  }
  if (status === "" || status === "completed") removeFromReadingOrders(items);
  if (changed) refreshWorkflow(priorityChanged || shelfChanged);
}
function setPriority(items, name, value) {
  for (const item of items) {
    if (Zotero.Prefs.get(itemPref(item, "status"), true) === "important") {
      Zotero.Prefs.set(itemPref(item, "important"), true, true);
      Zotero.Prefs.set(itemPref(item, "status"), "planned", true);
    }
    Zotero.Prefs.set(itemPref(item, name), value, true);
  }
  refreshWorkflow();
}
function markReading(item) {
  if (!item || item.isNote?.()) return;
  setItemStatus([statusItem(item)], "reading");
}
function onReaderToolbar({ reader }) { rememberReader(reader); }
function tableStatus(item) {
  item = statusItem(item);
  const status = Zotero.Prefs.get(itemPref(item, "status"), true);
  if (status === "important") return "planned"; // Migrate beta.1's combined field without losing priority.
  if (typeof status === "string" && Object.hasOwn(STATUS_LABELS, status)) return status;
  for (const id of item.getCollections?.() ?? []) {
    try {
      const collection = Zotero.Collections.get(id);
      const raw = Zotero.Prefs.get(preferenceKey(collection), true);
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
  if (Zotero.Prefs.get(flag, true) === true) return;
  try {
    const legacy = Services.prefs.getBranch(LEGACY_PREF);
    for (const name of legacy.getChildList("")) {
      if (!legacy.prefHasUserValue(name) || Services.prefs.prefHasUserValue(PREF + name)) continue;
      switch (legacy.getPrefType(name)) {
        case legacy.PREF_BOOL: Zotero.Prefs.set(PREF + name, legacy.getBoolPref(name), true); break;
        case legacy.PREF_INT: Zotero.Prefs.set(PREF + name, legacy.getIntPref(name), true); break;
        case legacy.PREF_STRING: Zotero.Prefs.set(PREF + name, legacy.getStringPref(name), true); break;
      }
    }
    Zotero.Prefs.set(flag, true, true);
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
        const picker = createStatusPicker(doc, status || "", value => setItemStatus([item], value));
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
        button.dataset.hideEmpty = String(Zotero.Prefs.get(PREF + "hideEmptyStatus", true) !== false);
        button.addEventListener("click", event => {
          event.stopPropagation();
          setPriority([item], name, !(name === "important" ? importantOf(item) : urgentOf(item)));
        });
        cell.append(button);
      }
      cell.addEventListener("mousedown", event => event.stopPropagation());
      cell.addEventListener("dblclick", event => event.stopPropagation());
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
  for (const key of ["language", "matrixMode", "rememberCollectionMode", "hideEmptyStatus", "modeRevision"]) {
    preferenceObservers.push(Zotero.Prefs.registerObserver(PREF + key, () => {
      for (const view of windows.values()) view.sync();
      refreshWorkflow();
    }, true));
  }
  for (const key of ["shadowStrength", "shadowDark", "matrixBorders", "urgentColor", "laterColor", "queueColor", "plannedColor", "readingColor", "completedColor", "importantColor", "urgencyColor"]) {
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

function renderDescriptionMarkup(text) {
  if (!descriptionRenderer) {
    const scope = Components.utils.Sandbox(Services.scriptSecurityManager.getSystemPrincipal(), {
      sandboxName: NAME + " description"
    });
    for (const file of ["vendor/markdown-it.min.js", "description.js"]) {
      Services.scriptloader.loadSubScript(root + file, scope, "UTF-8");
    }
    descriptionRenderer = scope.createDescriptionRenderer(scope.markdownit, () => {
      if (!scope.katex) Services.scriptloader.loadSubScript(root + "vendor/katex.min.js", scope, "UTF-8");
      return scope.katex;
    });
  }
  return descriptionRenderer(text);
}

function preferenceKey(collection) {
  return PREF + "order." + collection.libraryID + "." + collection.key;
}

function readingData(collection) {
  const local = Zotero.Prefs.get(preferenceKey(collection), true);
  let data = null;
  try {
    data = local ? JSON.parse(local) : null;
  } catch (error) {
    Zotero.logError(error); // A damaged saved order must not break the gallery; fall back to the note.
  }
  if (data && typeof data === "object") {
    data.order = Array.isArray(data.order) ? data.order.filter(key => typeof key === "string") : [];
    // Repair old explicit-empty statuses left in the persisted reading order.
    const order = data.order.filter(key => Zotero.Prefs.get(PREF + "status." + collection.libraryID + "." + key, true) !="" && Zotero.Prefs.get(PREF + "status." + collection.libraryID + "." + key, true) !== "completed");
    if (order.length !== data.order.length) {
      const repaired = { ...data, order };
      Zotero.Prefs.set(preferenceKey(collection), JSON.stringify(repaired), true);
      return repaired;
    }
    return data;
  }

  const notes = collection.getChildItems().filter(item => item.isNote()).sort((a, b) => a.id - b.id);
  for (const note of notes) {
    if (!note.hasTag(LEGACY_TAG) &&
        !/^Personal reading order(?:$|\s)/i.test(note.getNoteTitle())) continue;
    const html = note.getNote();
    const doc = new DOMParser().parseFromString(html, "text/html");
    for (const pre of doc.querySelectorAll("pre")) {
      try {
        const data = JSON.parse(pre.textContent);
        if (data.version !== 1 || !Array.isArray(data.order)) continue;
        return {
          order: [...new Set(data.order.filter(key => typeof key === "string"))],
          description: typeof data.description === "string" ? data.description : ""
        };
      } catch {
        // Syllabus notes can also contain ordinary preformatted text.
      }
    }
  }
  return { order: [], description: "" };
}

function moveInOrder(order, key, before, ordered) {
  if (key === before) return order;
  const next = order.filter(entry => entry !== key);
  if (ordered) {
    const index = next.indexOf(before);
    next.splice(index < 0 ? next.length : index, 0, key);
  }
  return next;
}

const SORT_FIELDS = [
  ["title", "Title"],
  ["author", "Author"],
  ["year", "Year"],
  ["added", "Date added"]
];
const SORT_OPTIONS = new Set(["table", ...SORT_FIELDS.flatMap(([key]) => [key + ":asc", key + ":desc"])]);
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function creatorLabel(item) {
  const summary = item.firstCreator?.replace(/[\u2068\u2069]/g, "").trim();
  if (summary || !item.isRegularItem()) return summary || "";
  const creators = item.getCreators();
  const primaryType = Zotero.CreatorTypes.getPrimaryIDForType(item.itemTypeID);
  const primary = creators.filter(creator => creator.creatorTypeID === primaryType);
  const names = (primary.length ? primary : creators)
    .map(creator => creator.lastName?.trim() || creator.firstName?.trim())
    .filter(Boolean);
  if (names.length > 2) return names[0] + " et al.";
  return names.join(" & ");
}

function sortItems(items, option, authors) {
  if (option === "table" || !SORT_OPTIONS.has(option)) return items;
  const [field, direction] = option.split(":");
  const valueFor = {
    title: item => item.getDisplayTitle(),
    author: item => authors.get(item.id),
    year: item => item.isRegularItem() ? item.getField("year") : "",
    added: item => item.dateAdded
  }[field];
  const records = items.map(item => {
    const value = String(valueFor(item) ?? "").trim();
    return { item, value: field === "year" && value === "0000" ? "" : value };
  });
  records.sort((a, b) => {
    if (!a.value || !b.value) return Number(!a.value) - Number(!b.value);
    const order = collator.compare(a.value, b.value);
    return direction === "desc" ? -order : order;
  });
  return records.map(record => record.item);
}

class Gallery {
  constructor(win) {
    this.win = win;
    this.doc = win.document;
    this.pane = win.ZoteroPane;
    this.cards = new Map();
    this.childCards = [];
    this.enabled = Zotero.Prefs.get(PREF + "enabled", true) === true;
    this.onTreeUpdate = () => this.schedule();
  }

  element(tag, className, text) {
    const node = this.doc.createElementNS("http://www.w3.org/1999/xhtml", tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = tr(text);
    return node;
  }

  button(label, click, className) {
    const button = this.element("button", className, label);
    button.type = "button";
    button.addEventListener("click", click);
    return button;
  }

  mount() {
    this.container = this.doc.getElementById("zotero-items-pane");
    const toolbar = this.doc.getElementById("zotero-items-toolbar");
    if (!this.container || !toolbar) return false;
    this.style = this.doc.createElementNS("http://www.w3.org/1999/xhtml", "link");
    this.style.rel = "stylesheet";
    this.style.href = root + "gallery.css?v=" + encodeURIComponent(assetVersion);
    this.doc.documentElement.append(this.style);
    this.toggle = this.button("Gallery", () => {
      this.enabled = !this.enabled;
      Zotero.Prefs.set(PREF + "enabled", this.enabled, true);
      this.sync();
    }, "sl-toggle");
    this.toggle.title = NAME;
    const search = this.doc.getElementById("zotero-tb-search");
    toolbar.insertBefore(this.toggle, search?.nextElementSibling || null);
    if (!this.pane.itemsView) {
      this.treeMount = new this.win.MutationObserver(() => this.schedule());
      this.treeMount.observe(this.doc.getElementById("zotero-items-tree"), { childList: true, subtree: true });
    }
    this.sync();
    return true;
  }

  schedule() {
    if (this.frame) return;
    this.frame = this.win.requestAnimationFrame(() => {
      this.frame = null;
      this.sync();
    });
  }

  sync() {
    if (this.pane.itemsView && !this.treeUpdate) {
      this.treeMount?.disconnect();
      this.treeUpdate = this.pane.itemsView.onRefresh;
      this.treeUpdate?.addListener(this.onTreeUpdate);
    }
    const rows = this.pane.itemsView?.collectionTreeRows;
    const collection = rows?.length === 1 && rows[0].isCollection() ? rows[0].ref : null;
    this.toggle.disabled = !collection;
    const active = !!(this.enabled && collection && this.win.Zotero_Tabs?.selectedID === "zotero-pane");
    this.toggle.textContent = tr(active ? "Table" : "Gallery");
    this.toggle.setAttribute("aria-pressed", String(active));
    if (!active) {
      if (this.gallery) {
        this.lastScroll = { collectionID: this.collection.id, top: this.gallery.scrollTop };
        this.mirrorExpansionToTable();
      }
      this.clear();
      return;
    }
    // Coming from the table: remember which paper was left open there so it can be opened here too.
    const adoptID = this.gallery ? null : this.openTableSelection();
    const sameCollection = this.collection?.id === collection.id;
    const preserveScroll = sameCollection ? this.gallery.scrollTop :
      (this.lastScroll?.collectionID === collection.id ? this.lastScroll.top : 0);
    const focus = this.doc.activeElement;
    const focused = sameCollection ? [...this.cards.values()].find(card => card.node.contains(focus)) : null;
    const focusAction = focused?.cover === focus ? "cover" : "order";
    const editorFocused = !!focus && this.descriptionDraft?.editor === focus;
    const editorSelection = editorFocused ? [focus.selectionStart, focus.selectionEnd] : [];
    const sortFocused = !!focus && this.sortControl === focus;
    if (this.descriptionDraft?.collectionID !== collection.id) this.descriptionDraft = null;
    // Rebuilding replaces every card node (for example when the mode changes); remember where the
    // visible ones were so they can glide to their new places instead of jumping.
    const reduceMotion = !!this.win.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const previousRects = sameCollection && !reduceMotion ? this.visibleCardRects() : null;
    this.clear();
    this.collection = collection;
    this.gallery = this.element("section", "sl-gallery");
    this.gallery.setAttribute("aria-label", NAME + " gallery");
    this.applyVisibilitySettings();
    this.gallery.addEventListener("click", event => {
      if (event.target.matches?.(".sl-gallery, .sl-section, .sl-grid, .sl-lane-body")) {
        this.doc.activeElement?.blur?.();
        this.clearSelection();
      }
    });
    this.container.classList.add("sl-show");
    this.container.append(this.gallery);
    this.resizeObserver = new this.win.ResizeObserver(([entry]) => {
      if (entry?.target === this.gallery) this.updateColumns(entry.contentRect.width);
    });
    this.resizeObserver.observe(this.gallery);
    this.visibility = new this.win.IntersectionObserver(entries => {
      for (const entry of entries) {
        const card = this.cards.get(Number(entry.target.dataset.itemId));
        if (!card || card.node !== entry.target) continue;
        card.visible = entry.isIntersecting;
        if (card.visible && !card.item.isNote?.()) this.loadCardWhenIdle(card);
        else if (!card.visible) this.release(card);
      }
    }, { root: this.gallery, rootMargin: "240px 0px" });
    try {
      this.render();
      this.gallery.scrollTop = preserveScroll;
      if (previousRects?.size) this.animateFrom(previousRects);
      if (adoptID) this.selectCard(adoptID, false).catch(error => Zotero.logError(error));
      if (focused) this.cards.get(focused.item.id)?.[focusAction]?.focus({ preventScroll: true });
      if (sortFocused) this.sortControl?.focus({ preventScroll: true });
      if (editorFocused && this.descriptionDraft?.editor) {
        this.descriptionDraft.editor.focus({ preventScroll: true });
        this.descriptionDraft.editor.setSelectionRange(...editorSelection);
      }
    } catch (error) {
      Zotero.logError(error);
      this.gallery.append(this.element("p", "sl-muted", "Could not load this gallery."));
    }
  }

  // The table and the gallery share one "opened paper": the gallery opens one card at a time, the
  // table can have many rows open. These two methods carry it across when you switch views.
  mirrorExpansionToTable() {
    const tree = this.pane.itemsView;
    if (!tree?.rowProvider || !this.collection) return;
    try {
      const openID = this.expanded?.collectionID === this.collection.id ? this.expanded.itemID : null;
      const rowOf = id => {
        const index = id == null ? undefined : tree.getRowIndexByID(id);
        return typeof index === "number" ? index : null;
      };
      const previous = this.tableOpened != null && this.tableOpened !== openID ? rowOf(this.tableOpened) : null;
      if (previous !== null && tree.isContainerOpen(previous)) tree.rowProvider.collapseRows([previous]);
      const index = rowOf(openID);
      if (index !== null && !tree.isContainerOpen(index)) tree.rowProvider.expandRows([index]);
      this.tableOpened = openID;
    } catch (error) {
      Zotero.logError(error);
    }
  }

  openTableSelection() {
    const tree = this.pane.itemsView;
    try {
      const ids = tree?.getSelectedItems?.(true) || [];
      if (ids.length !== 1) return null;
      const item = Zotero.Items.get(ids[0]);
      if (!item || Array.isArray(item)) return null;
      const rootID = item.parentItemID || item.id;
      const index = tree.getRowIndexByID(rootID);
      return typeof index === "number" && tree.isContainerOpen(index) ? rootID : null;
    } catch (error) {
      Zotero.logError(error);
      return null;
    }
  }

  visibleCardRects() {
    const rects = new Map();
    for (const card of this.cards.values()) {
      if (!card.child && card.visible && card.node.isConnected) rects.set(card.item.id, card.node.getBoundingClientRect());
    }
    return rects;
  }

  animateFrom(previousRects) {
    const top = -200, bottom = this.win.innerHeight + 200;
    for (const card of this.cards.values()) {
      const old = previousRects.get(card.item.id);
      if (!old || card.child || typeof card.node.animate !== "function") continue;
      const now = card.node.getBoundingClientRect();
      if (now.bottom < top || now.top > bottom) continue;
      const x = old.left - now.left, y = old.top - now.top;
      const scale = now.width ? old.width / now.width : 1;
      if (Math.abs(x) + Math.abs(y) < 1 && Math.abs(scale - 1) < .005) continue;
      card.motion = card.node.animate([
        { transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "top left" },
        { transform: "none", transformOrigin: "top left" }
      ], { duration: MOTION_MS, easing: MOTION_EASING });
      this.animatingUntil = Date.now() + MOTION_MS;
    }
  }

  clear() {
    this.endDrag();
    if (this.sizeFrame != null) this.win.cancelAnimationFrame(this.sizeFrame);
    this.sizeFrame = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.layoutWidth = 0;
    this.visibility?.disconnect();
    this.visibility = null;
    for (const card of this.cards.values()) {
      card.motion?.cancel();
      this.release(card);
    }
    this.cards.clear();
    this.childCards = [];
    this.gallery?.remove();
    this.gallery = null;
    this.sortControl = null;
    this.description = null;
    if (this.descriptionDraft) this.descriptionDraft.editor = null;
    this.collection = null;
    this.sections = null;
    this.unorderedCards = null;
    this.orderedCards = null;
    this.orderKeys = null;
    this.container.classList.remove("sl-show");
  }

  dispose() {
    if (this.frame) this.win.cancelAnimationFrame(this.frame);
    this.treeMount?.disconnect();
    this.treeUpdate?.removeListener(this.onTreeUpdate);
    this.clear();
    this.toggle.remove();
    this.style.remove();
  }

  applyVisibilitySettings() {
    if (!this.gallery) return;
    const strength = Zotero.Prefs.get(PREF + "shadowStrength", true);
    this.gallery.dataset.shadow = ["off", "soft", "medium", "strong"].includes(strength) ? strength : "medium";
    this.gallery.dataset.matrixBorders = String(Zotero.Prefs.get(PREF + "matrixBorders", true) !== false);
    this.gallery.dataset.shadowDark = String(Zotero.Prefs.get(PREF + "shadowDark", true) === true);
    for (const [key, fallback] of [["urgentColor", "#c76a6a"], ["laterColor", "#638ebd"], ["queueColor", "#789866"]]) {
      const value = Zotero.Prefs.get(PREF + key, true);
      this.gallery.style.setProperty("--sl-" + key, /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback);
    }
    for (const [key, className] of VISIBILITY_PREFS) {
      const hidden = Zotero.Prefs.get(PREF + key, true) === true;
      this.gallery.classList.toggle(className, hidden);
      if (key === "hideModeControl") {
        const mode = this.gallery.querySelector(".sl-mode");
        if (mode) mode.hidden = hidden;
      }
    }
  }

  updateColumns(width = this.layoutWidth) {
    this.layoutWidth = width;
    if (!(width > 0)) return;
    const count = Math.max(1, Math.floor((width + CARD_GAP) / (this.targetCardWidth + CARD_GAP)));
    const gaps = (count - 1) * CARD_GAP;
    this.gallery.style.setProperty("--sl-column-width", `calc((100% - ${gaps}px) / ${count})`);
  }

  render() {
    const data = readingData(this.collection);
    const items = this.pane.itemsView.getSortedItems().filter(item =>
      !item.deleted && (item.isRegularItem() || (item.isTopLevelItem() && (
        item.isAttachment() || (item.isNote() && !MANAGED_NOTE_TAGS.some(tag => item.hasTag(tag))
          && !/^Personal reading order(?:$|\s)/i.test(item.getNoteTitle()))
      )))
    );
    const header = this.element("header", "sl-header");
    header.append(this.element("h1", "", this.collection.name));
    const authors = new Map(items.map(item => [item.id, creatorLabel(item)]));
    const savedSort = Zotero.Prefs.get(PREF + "sort", true);
    const sort = SORT_OPTIONS.has(savedSort) ? savedSort : "table";
    const controls = this.element("div", "sl-gallery-controls");
    const mode = this.button(matrixModeFor(this.collection) ? "Bookshelf" : "Eisenhower", () => {
      const enabled = !matrixModeFor(this.collection);
      if (Zotero.Prefs.get(PREF + "rememberCollectionMode", true) === true) {
        Zotero.Prefs.set(collectionModeKey(this.collection), enabled, true);
        // The observer below redraws every window and refreshes an open settings pane.
        Zotero.Prefs.set(PREF + "modeRevision", (Zotero.Prefs.get(PREF + "modeRevision", true) || 0) + 1, true);
      } else Zotero.Prefs.set(PREF + "matrixMode", enabled, true);
    }, "sl-edit sl-mode");
    mode.hidden = Zotero.Prefs.get(PREF + "hideModeControl", true) === true;
    controls.append(this.sizeControl(), this.sortMenu(sort), mode);
    header.append(controls);
    this.gallery.style.setProperty("--sl-card-gap", CARD_GAP + "px");
    this.gallery.append(header);

    this.description = this.element("div", "sl-description");
    this.gallery.append(this.description);
    this.renderDescription(data.description);
    // With per-collection memory on, pin the mode the first time a collection is shown so that
    // later changes elsewhere (other collections, the global default) never alter it.
    if (Zotero.Prefs.get(PREF + "rememberCollectionMode", true) === true &&
        typeof Zotero.Prefs.get(collectionModeKey(this.collection), true) !== "boolean") {
      Zotero.Prefs.set(collectionModeKey(this.collection), matrixModeFor(this.collection), true);
    }
    this.matrix = matrixModeFor(this.collection);
    this.sections = {
      ordered: this.section("Reading order", true, "Drag papers here or use + on a card."),
      unordered: this.section("Unordered items", false, "No unordered items.")
    };
    if (this.matrix) {
      const lanes = this.element("div", "sl-matrix");
      this.sections.later = this.section("Important, not urgent", true, "Drag papers here or use + on a card.");
      this.sections.ordered.section.querySelector("h2").textContent = tr("Urgent & important");
      this.sections.unordered.section.querySelector("h2").textContent = tr("Other items");
      this.sections.ordered.lane = "urgent";
      this.sections.later.lane = "later";
      this.sections.queue = this.section("Reading queue", true, "Drag papers here or use + on a card.");
      this.sections.queue.lane = "queue";
      this.sections.ordered.section.classList.add("sl-lane-urgent");
      this.sections.later.section.classList.add("sl-lane-later");
      this.sections.queue.section.classList.add("sl-lane-queue");
      for (const group of [this.sections.ordered, this.sections.later, this.sections.queue]) {
        const body = this.element("div", "sl-lane-body");
        body.append(group.grid);
        group.section.append(body);
      }
      lanes.append(this.sections.ordered.section, this.sections.later.section, this.sections.queue.section);
      this.gallery.insertBefore(lanes, this.sections.unordered.section);
    }
    this.sections.completed = this.section("Completed", false, "No completed items.");
    this.sections.completed.lane = "completed";
    this.unorderedCards = sortItems(items, sort, authors).map(item => this.makeCard(item, authors.get(item.id)));
    if (this.expanded?.collectionID === this.collection.id) {
      const parent = this.cards.get(this.expanded.itemID);
      if (parent?.canExpand) this.setChildCards(parent, this.expanded.primaryID);
      else this.expanded = null;
    }
    this.layoutCards(data.order);
  }

  sizeControl() {
    const label = this.element("label", "sl-size", "Card size");
    const slider = this.element("input");
    slider.type = "range";
    slider.min = MIN_CARD_SCALE;
    slider.max = MAX_CARD_SCALE;
    slider.setAttribute("aria-label", tr("Card size"));
    const value = this.element("span", "sl-size-value");
    value.setAttribute("aria-hidden", "true");

    const saved = Zotero.Prefs.get(PREF + "cardScale", true);
    slider.value = Number.isInteger(saved) ? Math.min(MAX_CARD_SCALE, Math.max(MIN_CARD_SCALE, saved)) : 100;
    const apply = () => {
      const percent = Number(slider.value);
      const scale = percent / 100;
      this.targetCardWidth = Math.round(BASE_CARD_WIDTH * scale);
      this.gallery.style.setProperty("--sl-card-width", this.targetCardWidth + "px");
      this.gallery.style.setProperty("--sl-card-scale", String(scale));
      this.updateColumns();
      value.textContent = percent + "%";
      slider.setAttribute("aria-valuetext", value.textContent);
    };
    slider.addEventListener("input", () => {
      if (this.sizeFrame != null) return;
      this.sizeFrame = this.win.requestAnimationFrame(() => {
        this.sizeFrame = null;
        this.animateLayout(apply, true);
      });
    });
    slider.addEventListener("change", () => {
      Zotero.Prefs.set(PREF + "cardScale", Number(slider.value), true);
    });
    apply();
    label.append(slider, value);
    return label;
  }

  sortMenu(sort) {
    const label = this.element("label", "sl-sort");
    const face = this.element("span", "", "Sort ▾");
    face.setAttribute("aria-hidden", "true");
    const select = this.element("select");
    this.sortControl = select;
    select.setAttribute("aria-label", tr("Sort unordered items"));
    const add = (value, text) => {
      const option = this.element("option", "", text);
      option.value = value;
      select.append(option);
    };
    add("table", "Table order");
    for (const [key, text] of SORT_FIELDS) {
      const [asc, desc] = ["year", "added"].includes(key) ? ["↑", "↓"] : ["A–Z", "Z–A"];
      const name = key === "added" ? "Added" : text;
      add(key + ":asc", tr(name) + " " + asc);
      add(key + ":desc", tr(name) + " " + desc);
    }
    select.value = sort;
    label.title = tr("Sort unordered items") + " · " + select.selectedOptions[0].textContent;
    select.addEventListener("change", () => {
      Zotero.Prefs.set(PREF + "sort", select.value, true);
      this.sync();
    });
    label.append(face, select);
    return label;
  }

  renderDescription(text) {
    this.description.replaceChildren();
    const draft = this.descriptionDraft;
    if (draft) {
      const editor = this.element("textarea", "sl-description-input");
      editor.rows = 4;
      editor.placeholder = "## " + tr("Heading") + " · **" + tr("bold") + "** · $" + tr("inline math") + "$ · $$" + tr("separate equation") + "$$";
      editor.value = draft.value;
      editor.setAttribute("aria-label", tr("Collection description"));
      draft.editor = editor;
      const resizeEditor = () => {
        editor.style.height = "auto";
        editor.style.height = editor.scrollHeight + "px";
      };
      editor.addEventListener("input", () => { draft.value = editor.value; resizeEditor(); });
      const save = () => {
        const source = editor.value.trim() ? editor.value : "";
        if (this.save(current => ({ ...current, description: source }), false)) {
          this.descriptionDraft = null;
          this.renderDescription(source);
          this.description.firstChild.focus();
        }
      };
      const cancel = () => {
        this.descriptionDraft = null;
        this.renderDescription(text);
        this.description.firstChild.focus();
      };
      editor.addEventListener("keydown", event => {
        if (event.isComposing) return;
        if (event.key === "Escape" || (event.key === "Enter" && (event.metaKey || event.ctrlKey))) {
          event.preventDefault();
          event.stopPropagation();
          if (event.key === "Escape") cancel();
          else save();
        }
      });
      const controls = this.element("div", "sl-description-actions");
      controls.append(this.button("Save", save, "sl-edit"), this.button("Cancel", cancel, "sl-edit"));
      this.description.append(editor, controls);
      this.win.requestAnimationFrame?.(resizeEditor);
      return;
    }
    const display = this.element("div", "sl-description-text", text || "Add a collection description…");
    display.tabIndex = 0;
    display.title = tr("Double-click or press Enter to edit");
    display.classList.toggle("sl-muted", !text);
    if (text && text.length <= 100000) {
      try {
        const markup = renderDescriptionMarkup(text);
        // Whitespace-only Markdown constructs must not leave a zero-height edit target.
        const visibleText = markup.replace(/<[^>]*>/g, "").replace(/&(?:nbsp|#160);/g, " ").trim();
        if (visibleText) {
          // Zotero's host is XML/XUL: innerHTML interprets HTML void tags as XML.
          // Parse in an HTML document, then import namespace-correct nodes instead.
          const parsed = new this.win.DOMParser().parseFromString(markup, "text/html");
          const nodes = Array.from(parsed.body.childNodes, node => this.doc.importNode(node, true));
          display.replaceChildren(...nodes);
          if (display.textContent.trim()) display.classList.add("sl-description-rich");
          else display.textContent = text;
        } else display.textContent = text;
      } catch (error) {
        display.textContent = text;
        Zotero.logError(error);
      }
      display.addEventListener("click", event => {
        const link = event.target.closest("a[href]");
        if (!link) return;
        event.preventDefault();
        const url = link.getAttribute("href");
        if (/^https?:\/\//i.test(url)) Zotero.launchURL(url);
      });
    }
    const edit = () => {
      this.descriptionDraft = { collectionID: this.collection.id, value: text };
      this.renderDescription(text);
      this.descriptionDraft.editor.focus();
    };
    display.addEventListener("dblclick", event => {
      if (!event.target.closest("a[href]")) edit();
    });
    display.addEventListener("keydown", event => {
      if (event.target !== display || event.key !== "Enter") return;
      event.preventDefault();
      edit();
    });
    this.description.append(display);

  }

  section(title, ordered, emptyText) {
    const section = this.element("section", "sl-section");
    section.append(this.element("h2", "", title));
    const grid = this.element("div", "sl-grid");
    const empty = this.element("p", "sl-muted", emptyText);
    grid.append(empty);
    const line = this.element("div", "sl-drop-line");
    line.hidden = true;
    section.append(grid, line);
    this.gallery.append(section);
    const group = { section, grid, empty, line, ordered };
    section.addEventListener("dragover", event => {
      const target = this.dropTarget(group, event);
      if (!target) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      this.showDropTarget(group, target);
    });
    section.addEventListener("dragleave", event => {
      if (!section.contains(event.relatedTarget) && this.dropGroup === group) this.clearDropTarget();
    });
    section.addEventListener("drop", event => {
      const target = this.dropTarget(group, event);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const key = this.drag.item.key;
      const lane = group.lane;
      const item = this.drag.item;
      this.endDrag();
      if (lane === "completed") {
        setItemStatus([item], "completed");
        this.animateLayout(() => this.layoutCards(readingData(this.collection).order));
        return;
      }
      if (lane === "queue") {
        if (Zotero.Prefs.get(itemPref(item, "status"), true) === "important") Zotero.Prefs.set(itemPref(item, "status"), "planned", true);
        Zotero.Prefs.set(itemPref(item, "important"), false, true);
        Zotero.Prefs.set(itemPref(item, "urgent"), false, true);
      } else if (lane) {
        Zotero.Prefs.set(itemPref(item, "important"), true, true);
        Zotero.Prefs.set(itemPref(item, "urgent"), lane === "urgent", true);
      } else if (this.matrix && !ordered) {
        if (Zotero.Prefs.get(itemPref(item, "status"), true) === "important") Zotero.Prefs.set(itemPref(item, "status"), "planned", true);
        Zotero.Prefs.set(itemPref(item, "important"), false, true);
        Zotero.Prefs.set(itemPref(item, "urgent"), false, true);
      }
      this.move(key, target.before, ordered);
      refreshWorkflow();
    });
    return group;
  }

  dropTarget(group, event) {
    if (!this.drag) return null;
    if (group.lane === "completed") return tableStatus(this.drag.item) !== "completed" ? { empty: !group.cards?.length } : null;
    if (!group.ordered) return (this.matrix ? (importantOf(this.drag.item) || this.drag.ordered || tableStatus(this.drag.item) === "completed") : (this.drag.ordered || tableStatus(this.drag.item) === "completed")) ? { remove: true } : null;
    const cards = group.cards || this.orderedCards;
    if (!cards.length) return { empty: true };
    const direct = event.target.closest?.(".sl-card");
    const overChild = !!direct && this.childCards.some(card => card.node === direct);
    let index = direct ? cards.findIndex(card => card.node === direct ||
      (overChild && card.item.id === this.expanded?.itemID)) : -1;
    let rect;
    if (index >= 0) {
      rect = cards[index].node.getBoundingClientRect();
    } else {
      let bestY = Infinity;
      let bestX = Infinity;
      for (const [i, card] of cards.entries()) {
        if (!card.visible) continue;
        const bounds = card.node.getBoundingClientRect();
        const y = Math.max(bounds.top - event.clientY, event.clientY - bounds.bottom, 0);
        const x = Math.max(bounds.left - event.clientX, event.clientX - bounds.right, 0);
        if (y < bestY || (y === bestY && x < bestX)) {
          index = i;
          rect = bounds;
          bestY = y;
          bestX = x;
        }
      }
    }
    if (!rect) return { empty: true };
    const rtl = this.win.getComputedStyle(group.grid).direction === "rtl";
    const after = overChild || event.clientY > group.grid.getBoundingClientRect().bottom ||
      ((event.clientX >= rect.left + rect.width / 2) !== rtl);
    if (after && cards[index].item.id === this.expanded?.itemID && this.childCards.length) {
      rect = this.childCards.at(-1).node.getBoundingClientRect();
    }
    return { before: cards[index + Number(after)]?.item.key, rect, right: after !== rtl };
  }

  showDropTarget(group, target) {
    if (this.dropGroup !== group) this.clearDropTarget();
    this.dropGroup = group;
    group.section.classList.toggle("sl-drop-remove", !!target.remove);
    if (target.remove) return;
    if (target.empty) {
      group.line.hidden = true;
      if (!group.placeholder) {
        group.placeholder = this.element("div", "sl-drop-placeholder", "Drop here");
        group.placeholder.style.minHeight = Math.max(160, this.drag.node.getBoundingClientRect().height) + "px";
        group.emptyWasHidden = group.empty.hidden;
        group.empty.hidden = true;
        group.grid.append(group.placeholder);
      }
      return;
    }
    const parent = group.section.getBoundingClientRect();
    const rect = target.rect ?? group.grid.getBoundingClientRect();
    const gapCenter = target.right ? rect.right + CARD_GAP / 2 : rect.left - CARD_GAP / 2;
    const edge = gapCenter - 1.5;
    group.line.style.left = (target.empty ? rect.left - parent.left : edge - parent.left) + "px";
    group.line.style.top = ((target.empty ? rect.bottom + 4 : rect.top) - parent.top) + "px";
    group.line.style.width = (target.empty ? rect.width : 3) + "px";
    group.line.style.height = (target.empty ? 3 : rect.height) + "px";
    group.line.hidden = false;
  }

  clearDropTarget() {
    if (!this.dropGroup) return;
    if (this.dropGroup.placeholder) {
      this.dropGroup.placeholder.remove();
      this.dropGroup.placeholder = null;
      this.dropGroup.empty.hidden = this.dropGroup.emptyWasHidden;
    }
    this.dropGroup.line.hidden = true;
    this.dropGroup.section.classList.remove("sl-drop-remove");
    this.dropGroup = null;
  }

  endDrag() {
    this.drag?.node.classList.remove("sl-dragging");
    this.drag = null;
    this.clearDropTarget();
  }

  layoutCards(order) {
    this.orderKeys = order;
    const byKey = new Map(this.unorderedCards.map(card => [card.item.key, card]));
    const completed = this.unorderedCards.filter(card => tableStatus(card.item) === "completed");
    const completedSet = new Set(completed);
    const activeCards = this.unorderedCards.filter(card => !completedSet.has(card));
    order = order.filter(key => !completedSet.has(byKey.get(key)));
    const statusKeys = activeCards.filter(card => tableStatus(card.item)).map(card => card.item.key);
    order = [...new Set([...order, ...statusKeys])];
    this.orderedCards = order.map(key => byKey.get(key)).filter(Boolean);
    const ordered = new Set(this.orderedCards);
    const unordered = activeCards.filter(card => !ordered.has(card));
    const groups = this.matrix ? [
      [this.sections.ordered, activeCards.filter(card => importantOf(card.item) && urgentOf(card.item))],
      [this.sections.later, activeCards.filter(card => importantOf(card.item) && !urgentOf(card.item))],
      [this.sections.queue, this.orderedCards.filter(card => !importantOf(card.item))],
      [this.sections.unordered, activeCards.filter(card => !importantOf(card.item) && !ordered.has(card))]
    ] : [[this.sections.ordered, this.orderedCards], [this.sections.unordered, unordered]];
    if (this.sections.completed) groups.push([this.sections.completed, completed]);
    if (this.matrix) {
      const ranks = new Map(order.map((key, i) => [key, i]));
      for (const [, cards] of groups.slice(0, 2)) cards.sort((a,b) => (ranks.get(a.item.key) ?? Infinity) - (ranks.get(b.item.key) ?? Infinity));
    }
    for (const [group, cards] of groups) {
      group.cards = cards;
      if (group === this.sections.completed) group.section.hidden = cards.length === 0;
      group.empty.hidden = cards.length > 0;
      let next = group.empty.nextElementSibling;
      const place = card => {
        if (card.node === next) next = next.nextElementSibling;
        else group.grid.insertBefore(card.node, next);
        if (!card.observed) {
          this.visibility.observe(card.node);
          card.observed = true;
        }
      };
      for (const card of cards) {
        place(card);
        const inOrder = this.matrix ? order.includes(card.item.key) : group.ordered;
        if (card.ordered !== inOrder) {
          card.ordered = inOrder;
          card.order.textContent = card.ordered ? "−" : "+";
          const action = (tr(card.ordered ? "Remove from reading order" : "Add to reading order") + ": ") + card.title;
          card.order.setAttribute("aria-label", action);
          card.order.title = action + (card.ordered ? " · " + tr("Move left / right with Alt + arrow keys") : "");
        }
        if (this.expanded?.collectionID === this.collection.id && this.expanded.itemID === card.item.id) {
          this.childCards.forEach(place);
        }
      }
    }
  }

  move(key, before, ordered) {
    const card = this.unorderedCards?.find(card => card.item.key === key);
    if (!ordered && card) { setItemStatus([card.item], ""); }
    if (ordered && card && (!tableStatus(card.item) || tableStatus(card.item) === "completed")) {
      Zotero.Prefs.set(itemPref(card.item, "status"), "planned", true);
    }
    const current = readingData(this.collection).order;
    const next = moveInOrder(current, key, before, ordered);
    if (current.length === next.length && current.every((value, i) => value === next[i])) {
      refreshWorkflow(false);
      this.animateLayout(() => this.layoutCards(next));
      return;
    }

    if (!this.save(data => ({ ...data, order: next }), false)) return;
    this.animateLayout(() => this.layoutCards(next));
  }

  animateLayout(change, resizing = false) {
    const focus = this.doc.activeElement;
    const animate = !this.win.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const positions = new Map();
    if (animate) {
      for (const card of this.cards.values()) {
        if (card.visible) positions.set(card, card.node.getBoundingClientRect());
      }
    }
    for (const card of positions.keys()) card.motion?.cancel();
    change();
    if (focus?.isConnected && focus !== this.doc.activeElement) focus.focus({ preventScroll: true });
    const destination = new Map([...positions.keys()].filter(card => card.node.isConnected).map(card => [card, card.node.getBoundingClientRect()]));
    for (const [card, current] of destination) {
      const old = positions.get(card);
      const x = old.left - current.left;
      const y = old.top - current.top;
      const scale = resizing && current.width ? old.width / current.width : 1;
      if (Math.abs(x) + Math.abs(y) < 1 && Math.abs(scale - 1) < .005) continue;
      card.motion = card.node.animate(
        [
          { transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "top left" },
          { transform: "none", transformOrigin: "top left" }
        ],
        { duration: resizing ? 120 : MOTION_MS, easing: MOTION_EASING }
      );
      this.animatingUntil = Date.now() + (resizing ? 120 : MOTION_MS);
    }
  }

  save(update, refresh = true) {
    try {
      const collection = this.collection;
      const next = update(readingData(collection));
      Zotero.Prefs.set(preferenceKey(collection), JSON.stringify(next), true);
      for (const view of windows.values()) {
        if (view.collection?.id === collection.id && (refresh || view !== this)) view.sync();
      }
      refreshWorkflow(false);
      for (const card of this.cards.values()) this.refreshStatus(card);
      return true;
    } catch (error) {
      Zotero.logError(error);
      Services.prompt.alert(this.win, NAME, tr("The gallery change could not be saved."));
      return false;
    }
  }

  makeCard(item, author, child = false) {
    const note = item.isNote?.() ?? false;
    const title = note ? (item.getNoteTitle() || tr("Untitled note")) : item.getDisplayTitle();
    const attachments = !child && item.isRegularItem() ? (item.getAttachments?.() ?? []) : [];
    const canExpand = !child && item.isRegularItem() && (!!item.getNotes?.().length || attachments.length > 1);
    const node = this.element("article", child ? "sl-card sl-child-card" : "sl-card");
    node.dataset.itemId = String(item.id);
    if (!child) {
      node.draggable = true;
      node.addEventListener("dragstart", event => {
        for (const card of this.cards.values()) card.motion?.cancel();
        this.drag = card;
        node.classList.add("sl-dragging");
        event.dataTransfer.setData("text/plain", title);
        event.dataTransfer.effectAllowed = "move";
      });
      node.addEventListener("dragend", () => this.endDrag());
    }
    const cover = this.element("button", "sl-cover");
    cover.type = "button";

    cover.setAttribute("aria-label", title + " · " + tr("Select item, double-click to open"));
    if (canExpand) {
      cover.setAttribute("aria-expanded", "false");

    }
    cover.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      event.stopPropagation();
      this.selectCard(item.id).catch(error => Zotero.logError(error));
      this.open(item).catch(error => Zotero.logError(error));
    });
    const placeholder = this.element("span", "sl-placeholder", note ? "Note" : "Preview");
    cover.append(placeholder);
    if (note) {
      const stamp = String(item.dateModified ?? "");
      let excerpt = stamp ? noteExcerpts.get(item.id) : null;
      if (excerpt?.stamp !== stamp) {
        const parsed = new this.win.DOMParser().parseFromString((item.getNote?.() || "").slice(0, 131072).replace(/<\/(?:p|div|li|h[1-6])>/gi, "$& "), "text/html");
        excerpt = { stamp, text: parsed.body.textContent.trim().replace(/\s+/g, " ").slice(0, 700) };
        if (stamp) remember(noteExcerpts, item.id, excerpt);
      }
      placeholder.textContent = excerpt.text || tr("Empty note");
      placeholder.className = "sl-note-excerpt";
    }
    const preview = this.element("div", "sl-preview");
    preview.append(cover);
    let order;
    if (!child) {
      order = this.button("", () => this.move(item.key, undefined, !card.ordered), "sl-order");
      order.addEventListener("keydown", event => {
        if (!card.ordered || !event.altKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        const cards = this.orderedCards;
        const index = cards.indexOf(card);
        const left = event.key === "ArrowLeft";
        if ((left && index === 0) || (!left && index === cards.length - 1)) return;
        event.preventDefault();
        this.move(item.key, cards[index + (left ? -1 : 2)]?.item.key, true);
      });
    }
    const name = this.element("div", "sl-title", title);
    name.title = title;
    const progress = this.element("div", "sl-progress");
    if (child) {
      node.append(this.element("div", "sl-child-label", note ? "Child note" : (tr("File") + " · " + tr(attachmentLabel(item)))));
    }
    node.append(preview);
    if (order) node.append(order);
    node.append(name);
    if (note) node.classList.add("sl-note-card");
    if (!child && !note) {
      const byline = this.element("div", "sl-author", author || "No creator in Zotero");
      byline.title = byline.textContent;
      node.append(byline);
    }
    if (!note) node.append(progress);
    let statusControl, statusPicker, statusFace, priorityControl, urgentControl;
    // Importance and urgency apply to every top-level card, including standalone notes and files;
    // the reading status stays limited to references.
    if (!child) {
      const row = this.element("div", "sl-workflow-controls");
      if (!note && item.isRegularItem()) {
        const picker = createStatusPicker(this.doc, tableStatus(item), value => setItemStatus([item], value));
        statusControl = picker.select;
        statusPicker = picker.wrapper;
        statusFace = picker.face;
        statusControl.setAttribute("aria-label", tr("Reading status") + ": " + title);
        row.append(statusPicker);
      }
      priorityControl = this.button("☆", event => { event.stopPropagation(); setPriority([item], "important", !importantOf(item)); }, "sl-priority");
      urgentControl = this.button("◷", event => { event.stopPropagation(); setPriority([item], "urgent", !urgentOf(item)); }, "sl-priority sl-urgency");
      priorityControl.title = tr("Important"); urgentControl.title = tr("Urgent");
      row.append(priorityControl, urgentControl);
      node.append(row);
    }
    node.addEventListener("click", event => {
      if (!order?.contains(event.target) && !statusControl?.contains(event.target) && !priorityControl?.contains(event.target) && !urgentControl?.contains(event.target)) this.selectCard(item.id).catch(error => Zotero.logError(error));
    });
    node.addEventListener("dblclick", event => {
      if (order?.contains(event.target) || statusControl?.contains(event.target) || priorityControl?.contains(event.target) || urgentControl?.contains(event.target)) return;
      this.open(item).catch(error => Zotero.logError(error));
    });
    node.addEventListener("contextmenu", event => {
      event.preventDefault();
      event.stopPropagation();
      this.openContextMenu(card, event).catch(error => Zotero.logError(error));
    });
    const card = { item, title, node, cover, preview, placeholder, order, progress, statusControl, statusPicker, statusFace, priorityControl, urgentControl, child, canExpand, attachments, visible: false };
    this.refreshStatus(card);
    this.cards.set(item.id, card);
    if (!note) this.showKnownCover(card);
    this.markSelected(card, this.selection?.collectionID === this.collection.id && this.selection.itemID === item.id);
    return card;
  }

  refreshStatus(card) {
    const hideEmpty = String(Zotero.Prefs.get(PREF + "hideEmptyStatus", true) !== false);
    if (card.statusControl) {
      const status = tableStatus(card.item);
      card.statusControl.value = status;
      card.statusControl.className = "sl-status-control sl-status-" + status;
      card.statusPicker.className = "sl-status-picker sl-status-" + status;
      card.statusPicker.style.setProperty("--sl-status-color", workflowColor(status));
      card.statusFace.textContent = tr(STATUS_LABELS[status]);
      card.statusPicker.dataset.empty = String(!status);
      card.statusPicker.dataset.hideEmpty = hideEmpty;
      card.statusControl.dataset.empty = String(!status);
      card.statusControl.dataset.hideEmpty = hideEmpty;
    }
    if (card.priorityControl) {
      const important = importantOf(card.item), urgent = urgentOf(card.item);
      card.priorityControl.textContent = important ? "★" : "☆";
      card.priorityControl.setAttribute("aria-pressed", String(important));
      card.priorityControl.dataset.hideEmpty = card.urgentControl.dataset.hideEmpty = hideEmpty;
      card.urgentControl.textContent = urgent ? "◷" : "○";
      card.urgentControl.setAttribute("aria-pressed", String(urgent));
      for (const [control, label, enabled] of [[card.priorityControl, "Important", important], [card.urgentControl, "Urgent", urgent]]) {
        control.style.setProperty("--sl-priority-color", workflowColor(label === "Important" ? "important" : "urgent"));
        control.title = tr(label) + ": " + tr(enabled ? "On" : "Off");
        control.setAttribute("aria-label", control.title);
      }
    }
  }

  markSelected(card, selected) {
    card.node.classList.toggle("sl-selected", selected);
    card.cover.setAttribute("aria-pressed", String(selected));
  }

  setChildCards(parent, primaryID, animateExit = false) {
    const oldParent = this.cards.get(this.expanded?.itemID);
    if (oldParent?.canExpand) oldParent.cover.setAttribute("aria-expanded", "false");
    for (const card of this.childCards) {
      card.motion?.cancel();
      if (animateExit && card.visible && card.node.isConnected) this.fadeChildCard(card.node);
      if (card.observed) this.visibility.unobserve(card.node);
      this.release(card);
      card.node.remove();
      this.cards.delete(card.item.id);
    }
    this.childCards = [];
    this.expanded = null;
    if (!parent?.canExpand) return;
    if (!parent.attachments.includes(primaryID)) primaryID = parent.attachments[0];
    const ids = [...parent.item.getNotes(), ...parent.attachments.filter(id => id !== primaryID)];
    if (!ids.length) return;
    this.childCards = Zotero.Items.get(ids).map(item => this.makeCard(item, "", true));
    this.expanded = { collectionID: this.collection.id, itemID: parent.item.id, primaryID };
    parent.cover.setAttribute("aria-expanded", "true");
  }

  async selectCard(itemID, selectNative = true) {
    const previous = this.cards.get(this.selection?.itemID);
    const card = this.cards.get(itemID);
    if (!card) return 0;
    if (previous) this.markSelected(previous, false);
    this.selection = { collectionID: this.collection.id, itemID };
    this.markSelected(card, true);
    const targetParent = card.canExpand ? card.item.id : null;
    const shownParent = this.expanded?.collectionID === this.collection.id ? this.expanded.itemID : null;
    if (!card.child && targetParent !== shownParent) {
      if (card.canExpand && card.attachments.length > 1 && !card.attachment) {
        const attachment = await primaryAttachment(card.item);
        if (this.cards.get(itemID) !== card || this.selection?.itemID !== itemID) return 0;
        card.attachment = attachment;
      }
      const reduceMotion = this.win.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.animateLayout(() => {
        this.setChildCards(card, card.attachment?.id, !reduceMotion);
        this.layoutCards(this.orderKeys);
      });
      if (!reduceMotion) {
        for (const child of this.childCards) {
          child.motion = child.node.animate(
            [{ opacity: 0, transform: "translateX(-6px)" }, { opacity: 1, transform: "none" }],
            { duration: 240, easing: MOTION_EASING }
          );
        }
      }
    }
    if (!selectNative) return;
    return this.pane.itemsView.selectItems([itemID], true, true);
  }

  fadeChildCard(node) {
    const rect = node.getBoundingClientRect();
    const galleryRect = this.gallery.getBoundingClientRect();
    const copy = node.cloneNode(true);
    copy.inert = true;
    copy.setAttribute("aria-hidden", "true");
    copy.classList.add("sl-child-exit");
    copy.style.left = (rect.left - galleryRect.left + this.gallery.scrollLeft) + "px";
    copy.style.top = (rect.top - galleryRect.top + this.gallery.scrollTop) + "px";
    copy.style.width = rect.width + "px";
    this.gallery.append(copy);
    const exit = copy.animate(
      [{ opacity: 1 }, { opacity: 0, transform: "translateX(-6px)" }],
      { duration: 240, easing: MOTION_EASING, fill: "forwards" }
    );
    const remove = () => copy.remove();
    exit.finished.then(remove, remove);
  }

  clearSelection() {
    if (!this.selection) return;
    const selected = this.cards.get(this.selection.itemID);
    if (selected) this.markSelected(selected, false);
    this.selection = null;
    this.pane.itemsView.selection?.clearSelection();
    if (this.childCards.length) {
      const reduceMotion = this.win.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.animateLayout(() => {
        this.setChildCards(null, undefined, !reduceMotion);
        this.layoutCards(this.orderKeys);
      });
    }
  }

  async openContextMenu(card, event) {
    const view = this.pane.itemsView;
    const itemID = card.item.id;
    const collectionID = this.collection.id;
    // Capture screen coordinates while dispatching the event, before selecting the native row.
    const rect = card.cover.getBoundingClientRect();
    const x = event.screenX || this.win.mozInnerScreenX + rect.left;
    const y = event.screenY || this.win.mozInnerScreenY + rect.bottom;
    await this.selectCard(itemID, false);
    if (this.collection?.id !== collectionID || this.selection?.itemID !== itemID) return;
    await view.selectItems([itemID], true, true);
    const selected = view.getSelectedItems(true);
    if (this.collection?.id === collectionID && this.selection?.itemID === itemID &&
        selected.length === 1 && selected[0] === itemID) {
      await this.pane.onItemsContextMenuOpen(event, x, y);
    }
  }

  async open(item) {
    if (item.isNote?.()) {
      await this.pane.viewItems([item]);
      return;
    }
    const attachment = this.cards.get(item.id)?.attachment ?? await primaryAttachment(item);
    if (attachment) {
      await this.pane.viewAttachment(attachment.id);
      markReading(item);
    } else {
      await this.pane.viewItems([item]);
      if (item.isAttachment?.()) markReading(item);
    }
  }

  release(card) {
    card.visible = false;
    if (card.request) {
      lookupQueue.delete(card.request);
      coverQueue.delete(card.request);
      card.request.abort();
      card.request = null;
    }
    card.cover.querySelector("img")?.remove();
    card.knownCover = false;
  }

  // Rendering a preview is heavy main-thread work; hold it back until a running card animation
  // has finished so the motion does not stutter.
  loadCardWhenIdle(card) {
    const wait = (this.animatingUntil || 0) - Date.now();
    if (card.knownCover || wait <= 0 || typeof this.win.setTimeout !== "function") { this.loadCard(card); return; }
    if (card.deferred) return;
    card.deferred = true;
    this.win.setTimeout(() => {
      card.deferred = false;
      if (card.visible && this.cards.get(card.item.id) === card) this.loadCard(card);
    }, wait + 20);
  }

  loadCard(card) {
    if (card.request || card.knownCover) return;
    const request = new this.win.AbortController();
    card.request = request;
    lookupQueue.set(request, () => this.prepareCover(card, request).catch(error => {
      if (request.signal.aborted) return;
      card.placeholder.textContent = tr("No preview");
      Zotero.logError(error);
    }));
    drainCoverLookups();
  }

  async prepareCover(card, request) {
    const { signal } = request;
    const attachment = card.attachment ?? await primaryAttachment(card.item);
    if (signal.aborted) return;
    if (!attachment) {
      card.placeholder.textContent = card.item.getField("url") || card.item.getField("DOI")
        ? tr("Web link") : tr("No attachment");
      return;
    }
    card.attachment = attachment;
    const type = attachmentLabel(attachment);
    card.placeholder.textContent = tr(type);
    if (!attachment.isFileAttachment()) return;

    const remembered = coverMemo.get(attachment.id);
    if (remembered) {
      this.showCover(card, request, type, remembered);
      return;
    }

    const source = await coverSource(attachment, signal);
    if (signal.aborted) return;
    if (!source) {
      this.updateCardProgress(card, request);
      this.showCover(card, request, type, null);
      return;
    }

    // A slow renderer must never block reading an existing thumbnail.
    const cached = await readCachedCover(source);
    if (signal.aborted) return;
    if (cached) {
      this.showCover(card, request, type, cached);
      return;
    }

    this.updateCardProgress(card, request);
    if (failedCovers.get(source.image) > Date.now()) {
      this.showCover(card, request, type, null);
      return;
    }
    coverQueue.set(request, async () => {
      let cover;
      try {
        // A different card or window may have generated this file while we waited.
        cover = await readCachedCover(source);
        if (!cover && !signal.aborted && !(failedCovers.get(source.image) > Date.now())) {
          cover = await generateCover(this.win, attachment, source, signal);
          if (!cover && !signal.aborted) {
            failedCovers.delete(source.image);
            failedCovers.set(source.image, Date.now() + 30 * 60 * 1000);
            if (failedCovers.size > 128) failedCovers.delete(failedCovers.keys().next().value);
          }
        }
      } catch (error) {
        if (!signal.aborted) Zotero.logError(error);
      }
      this.showCover(card, request, type, cover);
    });
    void drainCovers();
  }

  showCover(card, request, type, cover) {
    if (request.signal.aborted) return;
    if (!cover) {
      card.placeholder.textContent = tr(type) + " · " + tr("No preview");
      return;
    }

    if (card.attachment?.id !== undefined) {
      cover.attachmentID = card.attachment.id;
      remember(coverMemo, card.attachment.id, cover);
      remember(coverMemo, card.item.id, cover); // lets a rebuilt card show it before any lookup
    }
    const img = this.element("img");
    img.alt = "";
    img.draggable = false;
    img.addEventListener("load", () => {
      if (request.signal.aborted) return;
      if (img.naturalWidth && img.naturalHeight) {
        cover.ratio = `${img.naturalWidth} / ${img.naturalHeight}`;
        card.preview.style.setProperty("--sl-cover-ratio", cover.ratio);
      }
      img.classList.add("sl-loaded");
    });
    img.addEventListener("error", () => {
      forgetCover(card);
      img.remove();
      if (!request.signal.aborted) card.placeholder.textContent = tr(type) + " · " + tr("No preview");
    });
    img.src = cover.uri;
    card.cover.append(img);
    if (cover.pages) card.pages = cover.pages;
    this.updateCardProgress(card, request);
  }

  // A card rebuilt for something whose preview was already produced shows it right away, with the
  // right proportions, instead of a blank placeholder that changes shape once the image loads.
  showKnownCover(card) {
    const known = coverMemo.get(card.item.id);
    if (!known || card.cover.querySelector("img")) return;
    if (known.ratio) card.preview.style.setProperty("--sl-cover-ratio", known.ratio);
    const img = this.element("img");
    img.alt = "";
    img.draggable = false;
    img.classList.add("sl-loaded");
    img.addEventListener("error", () => { forgetCover(card); img.remove(); card.knownCover = false; });
    img.src = known.uri;
    card.cover.append(img);
    card.knownCover = true;
    if (known.pages) card.pages = known.pages;
    const attachment = known.attachmentID !== undefined ? Zotero.Items?.get?.(known.attachmentID) : null;
    if (attachment && !Array.isArray(attachment)) {
      card.attachment = attachment;
      this.updateCardProgress(card, undefined);
    }
  }

  updateCardProgress(card, request) {
    if (card.attachment.isPDFAttachment()) {
      this.setProgress(card, request).catch(error => Zotero.logError(error));
    }
  }

  refreshProgress() {
    for (const card of this.cards.values()) {
      if (card.visible && card.attachment?.isPDFAttachment()) this.setProgress(card, card.request).catch(error => Zotero.logError(error));
    }
  }

  async setProgress(card, request) {
    const pages = card.pages ?? (await Zotero.Fulltext.getPages(card.attachment.id))?.total;
    if (request?.signal.aborted || card.request !== request) return;
    if (pages > 0) card.pages = pages;
    const last = card.attachment.getAttachmentLastPageIndex();
    const page = Number.isInteger(last) && pages > 0 ? Math.min(pages, last + 1) : null;
    const progressKey = page === null ? null : page + "/" + pages;
    if (card.progressKey === progressKey) return;
    card.progressKey = progressKey;
    card.progress.replaceChildren();
    if (page === null) {
      card.progress.title = "";
      return;
    }
    const percent = Math.max(0, Math.round(100 * page / pages));
    const meter = this.element("progress");
    meter.max = 100;
    meter.value = percent;
    meter.setAttribute("aria-label", tr("Reading progress"));
    card.progress.title = page + " / " + pages + " " + tr("Pages");
    card.progress.append(meter, this.element("span", "", percent + "%"));
  }
}

function drainCoverLookups() {
  while (activeLookups < MAX_COVER_LOOKUPS && lookupQueue.size) {
    const [request, work] = lookupQueue.entries().next().value;
    lookupQueue.delete(request);
    if (request.signal.aborted) continue;
    activeLookups++;
    work().finally(() => {
      activeLookups--;
      drainCoverLookups();
    });
  }
}

async function drainCovers() {
  if (renderingCover) return;
  renderingCover = true;
  try {
    while (coverQueue.size) {
      const [request, work] = coverQueue.entries().next().value;
      coverQueue.delete(request);
      try {
        await work();
      } catch (error) {
        if (!request.signal.aborted) Zotero.logError(error);
      }
    }
  } finally {
    renderingCover = false;
  }
}

async function primaryAttachment(item) {
  if (item.isAttachment()) return item;
  const attachments = await item.getBestAttachments();
  const rank = attachment => {
    if (attachment.isPDFAttachment()) return 0;
    if (attachment.isEPUBAttachment()) return 1;
    return attachment.attachmentContentType === "text/html" ? 3 : 2;
  };
  attachments.sort((a, b) => rank(a) - rank(b));
  for (const attachment of attachments) {
    if (await attachment.getFilePathAsync()) return attachment;
  }
  return attachments[0] ?? Zotero.Items.get(item.getAttachments())[0];
}

function attachmentLabel(attachment) {
  if (!attachment.isFileAttachment()) return "Web link";
  if (attachment.isPDFAttachment()) return "PDF";
  if (attachment.isEPUBAttachment()) return "EPUB";
  const type = attachment.attachmentContentType || "";
  if (type.startsWith("image/")) return "Image";
  if (type === "text/html") return "Web snapshot";
  const filename = attachment.attachmentFilename || "";
  const extension = filename.split(".").pop();
  return filename.includes(".") && /^[a-z0-9]{1,8}$/i.test(extension) ? extension.toUpperCase() : "File";
}

async function coverSource(attachment, signal) {
  const path = await attachment.getFilePathAsync();
  if (!path || signal.aborted) return null;
  const stat = await IOUtils.stat(path);
  const dir = PathUtils.join(Zotero.DataDirectory.dir, "reading-shelf-thumbnails");
  const cacheKey = [attachment.libraryID, attachment.key, stat.size, stat.lastModified].join("-");
  const image = PathUtils.join(dir, cacheKey + ".jpg");
  const info = PathUtils.join(dir, cacheKey + ".json");
  return { path, stat, dir, image, info };
}

async function readCachedCover({ image, info }) {
  if (await IOUtils.exists(image)) {
    try {
      const { pages } = await IOUtils.readJSON(info);
      if (pages === null || (Number.isInteger(pages) && pages > 0)) {
        return { uri: Zotero.File.pathToFileURI(image), pages };
      }
    } catch {
      // A damaged cache entry can be regenerated from the attachment.
    }
  }
  return null;
}

async function generateCover(win, attachment, { path, stat, dir, image, info }, signal) {
  let result;
  if (attachment.isPDFAttachment()) {
    try {
      result = await renderCover(win, path, stat.size, signal);
    } catch (error) {
      if (!signal.aborted) Zotero.debug("Reading Shelf PDF preview: " + error);
    }
  } else {
    try {
      const bytes = attachment.isEPUBAttachment() ? epubCoverBytes(path)
        : attachment.attachmentContentType?.startsWith("image/") && stat.size <= 12 * 1024 * 1024
          ? await IOUtils.read(path) : null;
      if (bytes && !signal.aborted) result = await rasterCover(win, bytes);
    } catch (error) {
      if (!signal.aborted) Zotero.debug("Reading Shelf image preview: " + error);
    }
  }
  if (!result && !signal.aborted && Zotero.isMac) {
    result = await systemCover(win, path, dir, attachment.isPDFAttachment(), signal);
  }
  if (!result || signal.aborted) return null;

  await IOUtils.makeDirectory(dir, { ignoreExisting: true });
  await IOUtils.write(image, result.bytes, { tmpPath: image + ".tmp" });
  const pages = result.pages ?? null;
  await IOUtils.writeJSON(info, { pages }, { tmpPath: info + ".tmp" });
  return { uri: Zotero.File.pathToFileURI(image), pages };
}

function coverDimensions(width, height) {
  const scale = Math.min(240 / width, 360 / height);
  return [Math.max(1, Math.ceil(width * scale)), Math.max(1, Math.ceil(height * scale))];
}

function canvasBytes(canvas) {
  const encoded = canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
  return Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
}

function isBlank(context, width, height) {
  const pixels = context.getImageData(0, 0, width, height).data;
  let marks = 0;
  const minimum = Math.max(3, width * height / 5000);
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] > 16 && Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 242) {
      if (++marks >= minimum) return false;
    }
  }
  return true;
}

async function rasterCover(win, bytes, rejectBlank = false) {
  const bitmap = await win.createImageBitmap(new win.Blob([bytes]));
  let canvas;
  try {
    canvas = win.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    [canvas.width, canvas.height] = coverDimensions(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (rejectBlank && isBlank(context, canvas.width, canvas.height)) return null;
    return { bytes: canvasBytes(canvas) };
  } finally {
    bitmap.close();
    if (canvas) canvas.width = canvas.height = 0;
  }
}

function epubCoverBytes(path) {
  const zip = Components.classes["@mozilla.org/libjar/zip-reader;1"]
    .createInstance(Components.interfaces.nsIZipReader);
  zip.open(Zotero.File.pathToFile(path));
  try {
    const read = (entry, limit) => {
      if (!zip.hasEntry(entry)) return null;
      const size = zip.getEntry(entry).realSize;
      if (!size || size > limit) return null;
      const stream = Components.classes["@mozilla.org/binaryinputstream;1"]
        .createInstance(Components.interfaces.nsIBinaryInputStream);
      stream.setInputStream(zip.getInputStream(entry));
      try {
        return Uint8Array.from(stream.readByteArray(size));
      } finally {
        stream.close();
      }
    };
    const parse = entry => {
      const bytes = read(entry, 2 * 1024 * 1024);
      if (!bytes) return null;
      const xml = new TextDecoder().decode(bytes);
      if (/<!DOCTYPE/i.test(xml)) return null;
      return new DOMParser().parseFromString(xml, "application/xml");
    };
    const container = parse("META-INF/container.xml");
    const packagePath = container?.getElementsByTagNameNS("*", "rootfile")[0]?.getAttribute("full-path");
    if (!packagePath) return null;
    const doc = parse(packagePath);
    if (!doc) return null;
    const coverID = Array.from(doc.getElementsByTagNameNS("*", "meta"))
      .find(meta => meta.getAttribute("name") === "cover")?.getAttribute("content");
    const items = Array.from(doc.getElementsByTagNameNS("*", "item"));
    const cover = items.find(item => item.getAttribute("properties")?.split(/\s+/).includes("cover-image"))
      ?? items.find(item => coverID && item.getAttribute("id") === coverID);
    const href = cover?.getAttribute("href");
    if (!href) return null;
    const slash = packagePath.lastIndexOf("/");
    const base = new URL("https://epub.invalid/" + packagePath.slice(0, slash + 1));
    const imageURL = new URL(href, base);
    if (imageURL.origin !== base.origin) return null;
    return read(decodeURIComponent(imageURL.pathname.slice(1)), 12 * 1024 * 1024);
  } finally {
    zip.close();
  }
}

async function runPreviewCommand(command, args, signal) {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  if (signal.aborted) return false;
  const process = await Subprocess.call({ command, arguments: args });
  const stop = () => { process.kill(0).catch(error => Zotero.debug(String(error))); };
  signal.addEventListener("abort", stop, { once: true });
  if (signal.aborted) stop();
  const timer = setTimeout(stop, 10000);
  try {
    const { exitCode } = await process.wait();
    return exitCode === 0 && !signal.aborted;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", stop);
  }
}

async function systemCover(win, path, cacheDir, isPDF, signal) {
  const temp = PathUtils.join(cacheDir, ".preview-" + crypto.randomUUID());
  await IOUtils.makeDirectory(temp, { createAncestors: true });
  try {
    if (isPDF) {
      // GUI apps do not necessarily inherit the user's Homebrew PATH.
      for (const executable of ["/opt/homebrew/bin/pdftoppm", "/usr/local/bin/pdftoppm", "/opt/local/bin/pdftoppm"]) {
        if (signal.aborted) return null;
        if (!await IOUtils.exists(executable)) continue;
        const prefix = PathUtils.join(temp, "cover");
        const ok = await runPreviewCommand(executable, [
          "-cropbox", "-f", "1", "-l", "1", "-singlefile", "-scale-to", "360", "-jpeg", path, prefix
        ], signal);
        const output = prefix + ".jpg";
        if (ok && await IOUtils.exists(output)) {
          const cover = await rasterCover(win, await IOUtils.read(output, { maxBytes: 2 * 1024 * 1024 }), true);
          if (cover) return cover;
        }
        break;
      }
    }
    if (signal.aborted) return null;
    if (await runPreviewCommand("/usr/bin/qlmanage", ["-t", "-s", "360", "-o", temp, path], signal)) {
      const png = (await IOUtils.getChildren(temp)).find(file => file.endsWith(".png"));
      if (png) return await rasterCover(win, await IOUtils.read(png, { maxBytes: 2 * 1024 * 1024 }), isPDF);
    }
    return null;
  } catch (error) {
    if (!signal.aborted) Zotero.debug("Reading Shelf system preview: " + error);
    return null;
  } finally {
    await IOUtils.remove(temp, { recursive: true, ignoreAbsent: true });
  }
}

async function renderCover(win, path, size, signal) {
  const pdfjs = win.ChromeUtils.importESModule(PDF_BASE + "build/pdf.mjs", { global: "current" });
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = PDF_BASE + "build/pdf.worker.mjs";
  }
  const chunk = 64 * 1024;
  const initial = await IOUtils.read(path, size > 512 * 1024 ? { maxBytes: chunk } : {});
  if (signal.aborted) return null;
  const viewerBytes = bytes => {
    const result = new win.Uint8Array(bytes.byteLength);
    result.set(bytes);
    return result;
  };
  let stopped = false;
  let fail;
  const interrupted = new Promise((_resolve, reject) => { fail = reject; });
  const abort = () => fail(new Error("Cover no longer visible"));
  signal.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => fail(new Error("PDF cover timed out")), 12000);
  const options = {
    verbosity: 0,
    cMapUrl: PDF_BASE + "web/cmaps/",
    standardFontDataUrl: PDF_BASE + "web/standard_fonts/",
    wasmUrl: PDF_BASE + "web/wasm/",
    useWorkerFetch: false
  };
  let task;
  let painting;
  let canvas;
  try {
    if (initial.byteLength < size) {
      const range = new pdfjs.PDFDataRangeTransport(size, viewerBytes(initial), true);
      range.requestDataRange = (begin, end) => {
        if (stopped) return;
        IOUtils.read(path, { offset: begin, maxBytes: end - begin }).then(bytes => {
          if (stopped) return;
          if (bytes.byteLength !== end - begin) throw new Error("PDF changed while generating the cover");
          range.onDataRange(begin, viewerBytes(bytes));
        }).catch(fail);
      };
      Object.assign(options, { range, rangeChunkSize: chunk, disableAutoFetch: true, disableStream: true });
    } else {
      options.data = viewerBytes(initial);
    }
    task = pdfjs.getDocument(options);
    const pdf = await Promise.race([task.promise, interrupted]);
    for (let number = 1; number <= Math.min(3, pdf.numPages); number++) {
      const page = await Promise.race([pdf.getPage(number), interrupted]);
      const dimensions = page.getViewport({ scale: 1 });
      const [width, height] = coverDimensions(dimensions.width, dimensions.height);
      const viewport = page.getViewport({ scale: Math.min(width / dimensions.width, height / dimensions.height) });
      canvas ??= win.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      painting = page.render({ canvasContext: context, viewport });
      await Promise.race([painting.promise, interrupted]);
      if (!isBlank(context, width, height)) {
        return { bytes: canvasBytes(canvas), pages: pdf.numPages };
      }
    }
    return null;
  } finally {
    stopped = true;
    clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
    painting?.cancel();
    if (canvas) canvas.width = canvas.height = 0;
    try {
      if (task) await task.destroy();
    } catch (error) {
      if (!signal.aborted) Zotero.logError(error);
    }
  }
}
