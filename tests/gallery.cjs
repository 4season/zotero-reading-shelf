const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class Element {
  children = [];
  dataset = {};
  attrs = new Map();
  classes = new Set();
  handlers = new Map();
  classList = {
    toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name),
    add: name => this.classes.add(name),
    remove: name => this.classes.delete(name)
  };
  scrollLeft = 0;
  scrollTop = 0;
  style = { setProperty: (key, value) => { this.style[key] = value; } };
  addEventListener(event, listener) { this.handlers.set(event, listener); }
  append(...children) { children.forEach(child => this.insertBefore(child, null)); }
  insertBefore(child, next) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.splice(next ? this.children.indexOf(next) : this.children.length, 0, child);
    child.parent = this;
  }
  get isConnected() { return !!this.parent; }
  remove() {
    if (!this.parent) return;
    this.parent.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null;
  }
  querySelector() { return null; }
  closest() { return null; }
  get nextElementSibling() { return this.parent?.children[this.parent.children.indexOf(this) + 1] ?? null; }
  getBoundingClientRect() {
    const left = Math.max(0, (this.parent?.children.indexOf(this) ?? 1) - 1) * 177;
    return { left, right: left + 160, width: 160, top: 0, bottom: 200, height: 200 };
  }
  animate(frames, options) {
    this.lastAnimation = { frames, options };
    return { cancel() {}, finished: Promise.resolve() };
  }
  replaceChildren() { this.children = []; }
  get firstChild() { return this.children[0]; }
  get selectedOptions() { return this.children.filter(child => child.value === this.value); }
  cloneNode() { return new Element(); }
  setAttribute(name, value) { this.attrs.set(name, value); }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  focus() { this.focused = true; }
  fire(name, event = {}) {
    this.handlers.get(name)({ target: this, preventDefault() {}, stopPropagation() {}, ...event });
  }
}
const project = path.resolve(__dirname, "..");
const prefs = new Map([["extensions.syllabus-lite.language", "en"]]);
const loadedScripts = [];
const ctx = vm.createContext({
  Components: { utils: { Sandbox: () => vm.createContext({}) } },
  Services: {
    scriptSecurityManager: { getSystemPrincipal: () => ({}) },
    scriptloader: {
      loadSubScript: (file, scope) => {
        loadedScripts.push(file);
        vm.runInContext(fs.readFileSync(path.join(project, file), "utf8"), scope);
      }
    }
  },
  Zotero: {
  ItemTreeManager: { refreshColumns() {} },
  Prefs: { get: key => prefs.get(key), set: (key, value) => prefs.set(key, value) },
  CreatorTypes: { getPrimaryIDForType: () => 1 },
  logError: error => { throw error; }
} });
vm.runInContext(fs.readFileSync(path.join(project, "bootstrap.js"), "utf8"), ctx);
vm.runInContext('root = ""', ctx);
const Gallery = vm.runInContext("Gallery", ctx);
const collection = { id: 17, libraryID: 1, key: "ABCDE" };
prefs.set(ctx.preferenceKey(collection), JSON.stringify({ order: ["A"], description: "Original" }));
const selected = [];
let selectedRows = [];
const view = new Gallery({
  document: { createElementNS: () => new Element() },
  ZoteroPane: { itemsView: {
    async selectItems(ids) { selected.push(ids[0]); selectedRows = ids; return ids.length; },
    getSelectedItems: () => selectedRows,
    selection: { clearSelection() { selectedRows = []; } }
  } }
});
view.collection = collection;
view.description = new Element();
view.renderDescription("Original");
assert.ok(!loadedScripts.includes("vendor/katex.min.js"));
view.description.firstChild.fire("dblclick");
const editor = view.description.firstChild;
editor.value = "## Updated\nSecond line with $x_i$";
editor.fire("input");
assert.equal(view.descriptionDraft.value, editor.value);
editor.fire("keydown", { key: "Enter", metaKey: true });
assert.match(view.description.firstChild.innerHTML, /<h2>Updated<\/h2>/);
assert.match(view.description.firstChild.innerHTML, /<math[\s>]/);
assert.ok(loadedScripts.includes("vendor/katex.min.js"));
assert.equal(ctx.readingData(collection).order.join(","), "A");
assert.equal(ctx.readingData(collection).description, "## Updated\nSecond line with $x_i$");
view.description.firstChild.fire("dblclick");
view.description.firstChild.value = "Discard";
view.description.firstChild.fire("keydown", { key: "Escape" });
assert.match(view.description.firstChild.innerHTML, /<h2>Updated<\/h2>/);
const render = ctx.renderDescriptionMarkup;
assert.match(render("- **Bold**\n- *Italic*"), /<ul>[\s\S]*<strong>Bold<\/strong>[\s\S]*<em>Italic<\/em>/);
assert.match(render("$$\n\\frac{1}{2}\n$$"), /display="block"[\s\S]*<mfrac>/);
assert.match(render(String.raw`\[ \frac{1}{2} \]`), /display="block"[\s\S]*<mfrac>/);
assert.match(render(String.raw`Inline \(x_i\)`), /<msub>/);
assert.match(render("[Source](https://example.org)"), /href="https:\/\/example.org"/);
assert.doesNotMatch(render("`$x$`\n\nPrices $5 and $10"), /<math/);
assert.doesNotMatch(render('<script>alert(1)</script> [unsafe](javascript:alert(1))'), /<script>|href=/);
assert.doesNotMatch(render(String.raw`$\includegraphics{https://example.org/image.png}$`), /<img|src=/);
assert.match(render(String.raw`$\unknownCommand{x}$`), /sl-math-source/);
const example = render("# Collection topic\n## Reading plan\n\nText before $V_m(t)$ text after.");
assert.match(example, /<h1>Collection topic<\/h1>\s*<h2>Reading plan<\/h2>/);
assert.match(example, /<p>Text before <span class="katex"><math [^>]*>.*<\/math><\/span> text after\.<\/p>/);
assert.doesNotMatch(example, /display="block"/);
console.log("Description Markdown, LaTeX, safe links, source editing and cancel passed");

const sample = (id, title, dateAdded, year) => ({
  id, key: id === 1 ? "A" : "B", dateAdded, isRegularItem: () => true, itemTypeID: 12,
  getDisplayTitle: () => title, getField: () => year,
  getCreators: () => [{ firstName: "Kim", creatorTypeID: 1 }, { lastName: "Contributor", creatorTypeID: 5 }]
});
const a = sample(1, "Paper 12", "2026-10-03", "0000");
const b = sample(2, "Paper 2", "2026-10-05", "2015");
assert.equal(ctx.creatorLabel(a), "Kim");
assert.equal(ctx.creatorLabel({ ...a, firstCreator: "\u2068ACME\u2069" }), "ACME");
const authors = new Map([[a.id, "Kim"], [b.id, ""]]);
assert.equal(ctx.sortItems([a, b], "title:asc", authors).map(x => x.id).join(","), "2,1");
assert.equal(ctx.sortItems([a, b], "year:desc", authors).map(x => x.id).join(","), "2,1");
assert.equal(ctx.sortItems([a, b], "added:desc", authors).map(x => x.id).join(","), "2,1");
assert.equal(ctx.sortItems([a, b], "author:desc", authors).map(x => x.id).join(","), "1,2");

const opened = [];
view.open = async item => { opened.push(item.id); };
const first = view.makeCard(a, "Kim");
const second = view.makeCard(b, "");
first.node.fire("click");
assert.equal(first.cover.attrs.get("aria-pressed"), "true");
assert.equal(opened.length, 0);
second.node.fire("click", { target: second.order });
assert.equal(second.cover.attrs.get("aria-pressed"), "false");
second.node.fire("click");
assert.equal(first.cover.attrs.get("aria-pressed"), "false");
assert.equal(second.cover.attrs.get("aria-pressed"), "true");
assert.deepEqual(selected, [1, 2]);
second.node.fire("dblclick", { target: second.cover });
assert.deepEqual(opened, [2]);
assert.equal(ctx.coverDimensions(1600, 900).join(","), "240,135");
assert.equal(ctx.coverDimensions(800, 1200).join(","), "240,360");
assert.equal(ctx.isBlank({ getImageData: () => ({ data: new Uint8Array(100).fill(255) }) }, 5, 5), true);

view.win.DOMParser = class { parseFromString(text) { return { body: { textContent: text.replace(/<[^>]*>/g, "") } }; } };
view.win.getComputedStyle = () => ({ direction: "ltr" });
view.win.matchMedia = () => ({ matches: false });
let animationFrame;
view.win.requestAnimationFrame = callback => { animationFrame = callback; return 1; };
view.gallery = new Element();
for (const [key, className] of [
  ["hideCardButtons", "sl-hide-card-buttons"],
  ["hideChildIndicator", "sl-hide-child-indicator"],
  ["hideSizeControl", "sl-hide-size"],
  ["hideSortControl", "sl-hide-sort"]
]) {
  prefs.set("extensions.syllabus-lite." + key, true);
  view.applyVisibilitySettings();
  assert.ok(view.gallery.classes.has(className));
  prefs.set("extensions.syllabus-lite." + key, false);
  view.applyVisibilitySettings();
  assert.ok(!view.gallery.classes.has(className));
}
const sortControl = view.sortMenu("table");
assert.equal(sortControl.firstChild.textContent, "Sort ▾");
assert.match(sortControl.title, /Table order/);
assert.equal(view.sortControl.children.length, 9);
const size = view.sizeControl().firstChild;
assert.equal(view.gallery.style["--sl-card-width"], "176px");
assert.equal(view.gallery.style["--sl-card-scale"], "1");
view.updateColumns(1000);
assert.equal(view.gallery.style["--sl-column-width"], "calc((100% - 68px) / 5)");
size.value = 75;
size.fire("input");
assert.equal(view.gallery.style["--sl-card-width"], "176px");
animationFrame();
assert.equal(view.gallery.style["--sl-card-width"], "132px");
assert.equal(view.gallery.style["--sl-card-scale"], "0.75");
assert.equal(view.gallery.style["--sl-column-width"], "calc((100% - 85px) / 6)");
assert.equal(prefs.has("extensions.syllabus-lite.cardScale"), false);
size.fire("change");
assert.equal(prefs.get("extensions.syllabus-lite.cardScale"), 75);
view.sizeControl();
assert.equal(view.gallery.style["--sl-card-width"], "132px");
view.visibility = { observe() {} };
const orderedGroup = view.section("Reading order", true, "Empty");
const unorderedGroup = view.section("Unordered", false, "Empty");
view.sections = { ordered: orderedGroup, unordered: unorderedGroup };
view.unorderedCards = [first, second];
view.layoutCards(["A"]);
first.visible = second.visible = true;
const firstRect = first.node.getBoundingClientRect.bind(first.node);
first.node.getBoundingClientRect = () => ({ ...firstRect(), width: parseInt(view.gallery.style["--sl-card-width"], 10) });
size.value = 90;
size.fire("input");
animationFrame();
assert.equal(first.node.lastAnimation.options.duration, 120);
assert.match(first.node.lastAnimation.frames[0].transform, /scale\(0\./);
first.node.getBoundingClientRect = firstRect;

const dataTransfer = { setData() {} };
second.node.fire("dragstart", { dataTransfer });
const point = { target: { closest: () => first.node }, dataTransfer, clientX: 20, clientY: 90 };
orderedGroup.section.fire("dragover", point);
assert.equal(orderedGroup.line.hidden, false);
assert.equal(orderedGroup.line.style.left, "-10px");
assert.equal(view.dropTarget(orderedGroup, point).before, "A");
assert.equal(view.dropTarget(orderedGroup, { ...point, clientX: 140 }).before, undefined);
orderedGroup.section.fire("drop", point);
assert.equal(orderedGroup.line.hidden, true);
assert.equal(view.drag, null);
assert.equal(ctx.readingData(collection).order.join(","), "B,A");
assert.equal(orderedGroup.grid.children[1], second.node);
assert.equal(orderedGroup.grid.children[2], first.node);
assert.equal(first.node.lastAnimation.options.duration, 180);
assert.equal(second.order.textContent, "−");

second.node.fire("dragstart", { dataTransfer });
unorderedGroup.section.fire("dragover", point);
assert.ok(unorderedGroup.section.classes.has("sl-drop-remove"));
unorderedGroup.section.fire("drop", point);
assert.equal(ctx.readingData(collection).order.join(","), "A");
assert.equal(unorderedGroup.grid.children[1], second.node);
assert.equal(second.order.textContent, "+");
assert.ok(!unorderedGroup.section.classes.has("sl-drop-remove"));
console.log("Drop indicators, in-place reordering, animation and unpinning passed");

// Status is local, shared between views, and explicit clearing overrides inferred queue membership.
ctx.Zotero.Collections = { get: () => collection };
const queued = { ...a, libraryID: 1, getCollections: () => [collection.id] };
prefs.set(ctx.preferenceKey(collection), JSON.stringify({ order: [queued.key] }));
assert.equal(ctx.tableStatus(queued), "planned");
ctx.setItemStatus([queued], "reading");
assert.equal(ctx.tableStatus(queued), "reading");
ctx.setItemStatus([queued], "");
assert.equal(ctx.tableStatus(queued), "");
ctx.setItemStatus([queued], "invalid");
assert.equal(ctx.tableStatus(queued), "");
view.layoutCards([]);
second.node.fire("dragstart", { dataTransfer });
orderedGroup.section.fire("dragover", point);
assert.ok(orderedGroup.placeholder);
assert.equal(orderedGroup.line.hidden, true);
assert.equal(orderedGroup.empty.hidden, true);
view.endDrag();
assert.equal(orderedGroup.placeholder, null);
assert.equal(orderedGroup.empty.hidden, false);
console.log("Local status persistence, queue fallback and empty-list drop reservation passed");

// Matrix lanes are independent of the queue and urgency; moving a card updates both classification and order.
view.matrix = true;
const later = view.section("Important, not urgent", true, "Drop here");
later.lane = "later";
orderedGroup.lane = "urgent";
view.sections.later = later;
ctx.setPriority([a], "important", true);
ctx.setPriority([a], "urgent", true);
ctx.setPriority([b], "important", true);
ctx.setPriority([b], "urgent", false);
view.layoutCards(["A"]);
assert.equal(orderedGroup.cards[0].item.key, "A");
assert.equal(later.cards[0].item.key, "B");
assert.equal(second.ordered, false);
second.node.fire("dragstart", {dataTransfer});
orderedGroup.section.fire("drop", point);
assert.equal(ctx.urgentOf(b), true);
assert.equal(ctx.importantOf(b), true);
view.layoutCards(["A", "B"]);
assert.equal(later.cards.length, 0);
assert.equal(orderedGroup.cards.length, 2);
view.matrix = false;
view.layoutCards(["A"]);
console.log("Two-lane matrix grouping and drag classification passed");

const attachment = (type, available) => ({
  attachmentContentType: type,
  isAttachment: () => true,
  isFileAttachment: () => true,
  isPDFAttachment: () => type === "application/pdf",
  isEPUBAttachment: () => type === "application/epub+zip",
  getFilePathAsync: async () => available ? "/file" : false
});
(async () => {
  const pdf = attachment("application/pdf", false);
  const epub = attachment("application/epub+zip", true);
  const snapshot = attachment("text/html", true);
  const note = {
    id: 31, key: "NOTE", isNote: () => true, isRegularItem: () => false,
    getNote: () => "<p>Reading notes</p><p>Review the learning rule.</p>",
    getNoteTitle: () => "Reading notes"
  };
  const file = { ...epub, id: 32, key: "FILE", isRegularItem: () => false, getDisplayTitle: () => "Appendix" };
  const coverPDF = { ...pdf, id: 34, getFilePathAsync: async () => "/file.pdf" };
  const book = {
    ...a, id: 33, key: "BOOK", isAttachment: () => false,
    getNotes: () => [note.id], getAttachments: () => [file.id, coverPDF.id],
    getBestAttachments: async () => [file, coverPDF]
  };
  ctx.Zotero.Items = { get: ids => Array.from(ids, id => [note, file, coverPDF].find(item => item.id === id)) };
  view.visibility.unobserve = () => {};
  const parentCard = view.makeCard(book, "Kim");
  view.unorderedCards.push(parentCard);
  view.layoutCards(["A", "BOOK"]);
  await view.selectCard(book.id);
  assert.equal(parentCard.cover.attrs.get("aria-expanded"), "true");
  assert.equal(orderedGroup.grid.children[3], view.cards.get(note.id).node);
  assert.equal(orderedGroup.grid.children[4], view.cards.get(file.id).node);
  assert.equal(view.cards.has(coverPDF.id), false);
  assert.equal(view.cards.get(note.id).node.firstChild.textContent, "Child note");
  const onlyPrimary = view.makeCard({
    ...book, id: 35, key: "ONLY", getNotes: () => [], getAttachments: () => [coverPDF.id]
  }, "Kim");
  assert.equal(onlyPrimary.cover.attrs.has("aria-expanded"), false);
  assert.equal(view.cards.get(note.id).node.lastAnimation.options.duration, 160);
  const menus = [];
  view.pane.onItemsContextMenuOpen = async (_event, x, y) => menus.push([selectedRows[0], x, y]);
  await view.openContextMenu(view.cards.get(note.id), { screenX: 80, screenY: 90 });
  assert.deepEqual(menus, [[note.id, 80, 90]]);
  assert.equal(parentCard.cover.attrs.get("aria-expanded"), "true");
  assert.equal(view.cards.get(note.id).cover.attrs.get("aria-pressed"), "true");
  let openedNote;
  view.pane.viewItems = async items => { openedNote = items[0]; };
  await Gallery.prototype.open.call(view, note);
  assert.equal(openedNote, note);
  view.cards.get(note.id).visible = true;
  view.clearSelection();
  const exiting = view.gallery.children.find(node => node.classes.has("sl-child-exit"));
  assert.equal(exiting.inert, true);
  assert.equal(exiting.lastAnimation.options.duration, 120);
  await Promise.resolve();
  assert.ok(!view.gallery.children.includes(exiting));
  assert.equal(view.selection, null);
  assert.equal(selectedRows.length, 0);
  assert.equal(parentCard.cover.attrs.get("aria-expanded"), "false");
  assert.equal(view.cards.has(note.id), false);
  console.log("Child note and attachment expansion, native context menu routing and note opening passed");
  const parent = { isAttachment: () => false, getBestAttachments: async () => [snapshot, pdf, epub] };
  assert.equal(await ctx.primaryAttachment(parent), epub);
  assert.equal(await ctx.primaryAttachment(snapshot), snapshot);
  assert.equal(ctx.attachmentLabel(snapshot), "Web snapshot");
  assert.equal(ctx.attachmentLabel(epub), "EPUB");
  let openedItem;
  epub.id = 30;
  view.pane.viewAttachment = async id => { openedItem = id; };
  await Gallery.prototype.open.call(view, parent);
  assert.equal(openedItem, 30);
  console.log("Gallery actions, preview geometry, blank detection and attachment routing passed");

  ctx.PathUtils = { join: (...parts) => parts.join("/") };
  ctx.Zotero.DataDirectory = { dir: "/data" };
  ctx.Zotero.File = { pathToFileURI: path => "file://" + path };
  ctx.IOUtils = {
    stat: async () => ({ size: 42, lastModified: 123 }),
    exists: async path => path.includes("-CACHED-"),
    readJSON: async () => ({ pages: null })
  };
  let startRender;
  const renderStarted = new Promise(resolve => { startRender = resolve; });
  let finishRender;
  const renderPending = new Promise(resolve => { finishRender = resolve; });
  ctx.generateCover = async () => {
    startRender();
    return renderPending;
  };
  view.win.AbortController = AbortController;
  const displayed = [];
  view.showCover = (card, request, type, cover) => {
    if (!request.signal.aborted) displayed.push([card.attachment.key, cover?.uri]);
  };
  const card = key => ({
    attachment: { ...epub, key, libraryID: 1 }, placeholder: {},
    cover: { querySelector: () => null }
  });
  const slow = card("SLOW");
  view.loadCard(slow);
  await renderStarted;
  // Simulate leaving a collection while its slow thumbnail is still being released.
  view.release(slow);
  const returning = card("CACHED");
  view.loadCard(returning);
  await new Promise(setImmediate);
  assert.deepEqual(displayed, [["CACHED", "file:///data/syllabus-lite-thumbnails/1-CACHED-42-123.jpg"]]);
  finishRender(null);
  await new Promise(setImmediate);
  assert.equal(displayed.length, 1);
  console.log("Returning to cached thumbnails bypassed a still-busy renderer");
  const pending = [];
  const lookupsStarted = [];
  view.prepareCover = (card, request) => {
    lookupsStarted.push(card.attachment.key);
    return new Promise(resolve => pending.push(resolve));
  };
  const queued = Array.from({ length: 6 }, (_, index) => card("QUEUED" + index));
  queued.forEach(entry => view.loadCard(entry));
  assert.equal(lookupsStarted.length, 4);
  view.release(queued[4]);
  pending.shift()();
  await new Promise(setImmediate);
  assert.deepEqual(lookupsStarted, ["QUEUED0", "QUEUED1", "QUEUED2", "QUEUED3", "QUEUED5"]);
  pending.forEach(resolve => resolve());
  await new Promise(setImmediate);
  assert.equal(vm.runInContext("activeLookups", ctx), 0);
  console.log("Thumbnail lookup concurrency and pending cancellation passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
