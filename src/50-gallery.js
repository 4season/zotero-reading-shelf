// SPDX-License-Identifier: AGPL-3.0-only
class Gallery {
  constructor(win) {
    this.win = win;
    this.doc = win.document;
    this.pane = win.ZoteroPane;
    this.cards = new Map();
    this.childCards = [];
    this.enabled = getPref("enabled") === true;
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
    this.applyMotion();
    this.toggle = this.button("Gallery", () => {
      this.enabled = !this.enabled;
      setPref("enabled", this.enabled);
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
    // Coming from the table: the table is the truth. Open here the paper that is open there, and
    // forget what the gallery had open before (it may have been closed in the table since).
    const comingFromTable = !this.gallery;
    const adoptID = comingFromTable ? this.openTableRow() : null;
    if (comingFromTable) this.expanded = null;
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
    const reduceMotion = motionReduced(this.win);
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

  // The paper whose row is open in the table: the selected one (or the one a selected note or
  // attachment belongs to) if it is open, otherwise the first open top-level row.
  openTableRow() {
    const tree = this.pane.itemsView;
    try {
      const ids = tree?.getSelectedItems?.(true) || [];
      if (ids.length === 1) {
        const item = Zotero.Items.get(ids[0]);
        if (item && !Array.isArray(item)) {
          const rootID = item.parentItemID || item.id;
          const index = tree.getRowIndexByID(rootID);
          if (typeof index === "number" && tree.isContainerOpen(index)) return rootID;
        }
      }
      const provider = tree?.rowProvider;
      for (let index = 0; index < (provider?.rowCount ?? 0); index++) {
        if (provider.getLevel(index) === 0 && provider.isContainerOpen(index)) {
          const ref = provider.getRow(index)?.ref;
          if (ref?.id) return ref.id;
        }
      }
    } catch (error) {
      Zotero.logError(error);
    }
    return null;
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
    this.lanes = null;
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

  applyMotion() {
    this.doc.documentElement?.setAttribute?.("data-sl-motion", motionMode());
  }

  applyVisibilitySettings() {
    this.applyMotion();
    if (!this.gallery) return;
    const strength = getPref("shadowStrength");
    this.gallery.dataset.shadow = ["off", "soft", "medium", "strong"].includes(strength) ? strength : "medium";
    this.gallery.dataset.equalLanes = String(getPref("matrixEqualHeight") === true);
    this.gallery.dataset.matrixBorders = String(getPref("matrixBorders") !== false);
    this.gallery.dataset.shadowDark = String(getPref("shadowDark") === true);
    for (const [key, fallback] of [["urgentColor", "#c76a6a"], ["laterColor", "#638ebd"], ["queueColor", "#789866"], ["presentationColor", "#f08c00"]]) {
      const value = getPref(key);
      this.gallery.style.setProperty("--sl-" + key, /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback);
    }
    for (const [key, className] of VISIBILITY_PREFS) {
      const hidden = getPref(key) === true;
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
    this.applyLaneColumns();
  }

  // Lane layout. Side by side, a lane is as wide as its papers (the journal lane exactly fits them).
  // When a lane could not show up to three of its papers in one row although the full width could (or
  // when the lanes simply do not fit), the lanes stack instead.
  applyLaneColumns() {
    const lanes = this.lanes, sections = this.sections;
    const width = this.layoutWidth;
    if (!lanes || !sections?.ordered?.cards || !sections.later?.cards || !(width > 0)) return;
    const card = this.targetCardWidth || BASE_CARD_WIDTH;
    const pad = 30, gap = 12; // lane border + padding; gap between lanes
    const perRow = available => Math.floor((available - pad + CARD_GAP) / (card + CARD_GAP));
    const journal = sections.journal;
    // While a paper is dragged over the lane, make room for its drop box beside the papers already there.
    const dropping = journal && this.dropGroup === journal && journal.placeholder ? 1 : 0;
    // Notes and files opened under a paper sit in its lane too, so they count as papers for the width.
    const opened = this.expanded ? this.cards.get(this.expanded.itemID) : null;
    const size = group => group.cards.length + (opened && group.cards.includes(opened) ? this.childCards?.length ?? 0 : 0);
    const journalCards = Math.max(1, Math.min((journal ? size(journal) : 0) + dropping, 6));
    const journalWidth = journalCards * card + (journalCards - 1) * CARD_GAP + pad;
    const lane = card + pad;
    const count = journal ? 3 : 2;
    const free = width - (count - 1) * gap - (journal ? journalWidth : 0);
    // The two main lanes share the space 1:1. One only takes more when its papers do not fit in half and
    // the other lane has room to spare; it never takes what the other lane needs.
    const neededFor = group => {
      const cards = Math.max(1, Math.min(size(group), 6));
      return cards * card + (cards - 1) * CARD_GAP + pad;
    };
    const [needOrdered, needLater] = [neededFor(sections.ordered), neededFor(sections.later)];
    const half = free / 2;
    let widthOrdered = half, widthLater = half;
    if (needLater > half && needOrdered < half) {
      widthLater = Math.min(needLater, free - Math.max(lane, needOrdered));
      widthOrdered = free - widthLater;
    } else if (needOrdered > half && needLater < half) {
      widthOrdered = Math.min(needOrdered, free - Math.max(lane, needLater));
      widthLater = free - widthOrdered;
    }
    const crowded = [[sections.ordered, widthOrdered], [sections.later, widthLater]]
      .some(([group, w]) => perRow(Math.max(lane, w)) < Math.min(size(group), 3));
    const stacked = width < (journal ? journalWidth : lane) + 2 * lane + (count - 1) * gap ||
      (crowded && perRow(width) >= 3);
    lanes.dataset.stacked = String(stacked);
    lanes.style.setProperty("--sl-journal-width", journalWidth + "px");
    lanes.style.gridTemplateColumns = stacked ? "minmax(0, 1fr)" :
      (journal ? `minmax(0, min(${journalWidth}px, 45%)) ` : "") +
      (widthOrdered === widthLater ? `minmax(${lane}px, 1fr) minmax(${lane}px, 1fr)` :
        `minmax(${lane}px, ${Math.round(widthOrdered)}fr) minmax(${lane}px, ${Math.round(widthLater)}fr)`);
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
    const savedSort = getPref("sort");
    const sort = SORT_OPTIONS.has(savedSort) ? savedSort : "table";
    const controls = this.element("div", "sl-gallery-controls");
    const mode = this.button(matrixModeFor(this.collection) ? "Bookshelf" : "Eisenhower", () => {
      const enabled = !matrixModeFor(this.collection);
      if (getPref("rememberCollectionMode") === true) {
        writePref(collectionModeKey(this.collection), enabled);
        // The observer below redraws every window and refreshes an open settings pane.
        setPref("modeRevision", (getPref("modeRevision") || 0) + 1);
      } else setPref("matrixMode", enabled);
    }, "sl-edit sl-mode");
    mode.hidden = getPref("hideModeControl") === true;
    const presentation = this.button("Presentation", () => {
      const enabled = !presentationModeFor(this.collection);
      if (getPref("rememberCollectionMode") === true) {
        writePref(presentationKey(this.collection), enabled);
        setPref("modeRevision", (getPref("modeRevision") || 0) + 1);
      } else setPref("journalClubMode", enabled);
      if (!enabled) requestRevert(getPref("rememberCollectionMode") === true ? this.collection : null);
    }, "sl-edit sl-presentation");
    presentation.setAttribute("aria-pressed", String(presentationModeFor(this.collection)));
    presentation.hidden = getPref("hidePresentationControl") === true;
    controls.append(this.sizeControl(), this.sortMenu(sort), mode, presentation);
    header.append(controls);
    this.gallery.style.setProperty("--sl-card-gap", CARD_GAP + "px");
    this.gallery.append(header);

    this.description = this.element("div", "sl-description");
    this.gallery.append(this.description);
    this.renderDescription(data.description);
    // With per-collection memory on, pin the mode the first time a collection is shown so that
    // later changes elsewhere (other collections, the global default) never alter it.
    if (getPref("rememberCollectionMode") === true &&
        typeof readPref(collectionModeKey(this.collection)) !== "boolean") {
      writePref(collectionModeKey(this.collection), matrixModeFor(this.collection));
    }
    if (getPref("rememberCollectionMode") === true &&
        typeof readPref(presentationKey(this.collection)) !== "boolean") {
      writePref(presentationKey(this.collection), presentationModeFor(this.collection));
    }
    this.matrix = matrixModeFor(this.collection);
    this.sections = {
      ordered: this.section("Reading order", true, "Drag papers here or use + on a card."),
      unordered: this.section("Unordered items", false, "No unordered items.")
    };
    if (presentationModeFor(this.collection)) {
      this.sections.journal = this.section("Presentation", false, "Drag the paper to present here.");
      this.sections.journal.lane = "journal";
      this.sections.journal.section.classList.add("sl-lane-journal");
    }
    if (this.matrix) {
      const lanes = this.element("div", "sl-matrix");
      this.lanes = lanes;
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
      for (const group of [this.sections.journal, this.sections.ordered, this.sections.later, this.sections.queue].filter(Boolean)) {
        const body = this.element("div", "sl-lane-body");
        body.append(group.grid);
        group.section.append(body);
      }
      if (this.sections.journal) {
        lanes.classList.add("sl-journal");
        lanes.append(this.sections.journal.section);
      }
      lanes.append(this.sections.ordered.section, this.sections.later.section, this.sections.queue.section);
      this.gallery.insertBefore(lanes, this.sections.unordered.section);
    } else if (this.sections.journal) {
      this.gallery.insertBefore(this.sections.journal.section, this.sections.ordered.section);
    }
    this.sections.completed = this.section("Completed", false, "No completed items.");
    this.sections.completed.lane = "completed";
    this.sortOption = sort;
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

    const saved = getPref("cardScale");
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
      setPref("cardScale", Number(slider.value));
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
    const what = getPref("sortReadingOrder") === true ? "Sort all items" : "Sort unordered items";
    select.setAttribute("aria-label", tr(what));
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
    label.title = tr(what) + " · " + select.selectedOptions[0].textContent;
    select.addEventListener("change", () => {
      setPref("sort", select.value);
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
      if (lane === "journal") {
        // A paper already in the lane is placed where it was dropped; a new one joins at the end.
        this.moveInJournal(key, tableStatus(item) === "selected" ? target.before : undefined);
        setItemStatus([item], "selected");
        this.animateLayout(() => this.layoutCards(readingData(this.collection).order));
        return;
      }
      if (lane === "queue") {
        if (readPref(itemPref(item, "status")) === "important") writePref(itemPref(item, "status"), "planned");
        writePref(itemPref(item, "important"), false);
        writePref(itemPref(item, "urgent"), false);
      } else if (lane) {
        writePref(itemPref(item, "important"), true);
        writePref(itemPref(item, "urgent"), lane === "urgent");
      } else if (this.matrix && !ordered) {
        if (readPref(itemPref(item, "status")) === "important") writePref(itemPref(item, "status"), "planned");
        writePref(itemPref(item, "important"), false);
        writePref(itemPref(item, "urgent"), false);
      }
      this.move(key, target.before, ordered);
      refreshWorkflow();
    });
    return group;
  }

  dropTarget(group, event) {
    if (!this.drag) return null;
    if (group.lane === "completed") return tableStatus(this.drag.item) !== "completed" ? { empty: !group.cards?.length } : null;
    const sorted = this.sortsLanes();
    if (group.lane === "journal") {
      if (!this.drag.item.isRegularItem?.()) return null;
      if (tableStatus(this.drag.item) !== "selected") return { empty: true }; // a box at the end, like the first paper
      if (sorted) return null;
    } else {
      const leaving = ["completed", "selected"].includes(tableStatus(this.drag.item));
      if (!group.ordered) return (this.matrix ? (importantOf(this.drag.item) || this.drag.ordered || leaving) : (this.drag.ordered || leaving)) ? { remove: true } : null;
      // While a sort is applied to the lanes, positions follow the sort: no manual placement.
      if (sorted) return group.cards?.includes(this.drag) ? null : { empty: true };
    }
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
        if (group === this.sections.journal) this.applyLaneColumns();
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
    const left = this.dropGroup;
    this.dropGroup = null;
    if (left === this.sections?.journal) this.applyLaneColumns();
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
    const journal = this.sections.journal ? this.unorderedCards.filter(card => tableStatus(card.item) === "selected") : [];
    if (this.sections.journal) {
      const rank = new Map(readingData(this.collection).journal.map((key, i) => [key, i]));
      journal.sort((a, b) => (rank.get(a.item.key) ?? 1e9) - (rank.get(b.item.key) ?? 1e9));
    }
    const completedSet = new Set([...completed, ...journal]);
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
    if (this.sections.journal) {
      groups.push([this.sections.journal, journal]);
      // Drives the empty-lane glow, the one-paper centering and the fade-out when a paper arrives.
      const lane = this.sections.journal.section;
      const wasEmpty = lane.dataset.empty === "true";
      const glow = getPref("journalGlow") !== false;
      lane.dataset.empty = String(!journal.length);
      // Notes and files opened under a paper in this lane count too: only a lone paper is centered.
      const opened = this.expanded?.collectionID === this.collection.id ? this.cards.get(this.expanded.itemID) : null;
      lane.dataset.count = String(journal.length + (opened && journal.includes(opened) ? this.childCards.length : 0));
      lane.dataset.glow = String(glow);
      if (wasEmpty && journal.length && glow && !motionReduced(this.win)) {
        lane.classList.add("sl-glow-off");
        this.win.setTimeout(() => lane.classList.remove("sl-glow-off"), 900);
      }
    }
    if (this.sections.completed) groups.push([this.sections.completed, completed]);
    const sortedLanes = this.sortsLanes();
    if (sortedLanes) {
      // Display-only: the saved manual orders are untouched, so turning the sort off brings them back.
      const position = new Map(this.unorderedCards.map((card, i) => [card, i]));
      for (const [group, cards] of groups) {
        if (group.ordered || group === this.sections.journal) cards.sort((a, b) => position.get(a) - position.get(b));
      }
    } else if (this.matrix) {
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
        const inOrder = group === this.sections.journal ? false : this.matrix ? order.includes(card.item.key) : group.ordered;
        if (card.order) card.order.hidden = group === this.sections.journal;
        // In the Eisenhower layout a paper marked ★/◷ sits in its lane because of those marks, so
        // taking it off the reading order does not move it; the tooltip says so.
        const keepsLane = this.matrix && inOrder && importantOf(card.item);
        if (card.ordered !== inOrder || card.keepsLane !== keepsLane) {
          card.ordered = inOrder;
          card.keepsLane = keepsLane;
          card.order.textContent = card.ordered ? "−" : "+";
          const action = (tr(card.ordered ? "Remove from reading order" : "Add to reading order") + ": ") + card.title;
          card.order.setAttribute("aria-label", action);
          card.order.title = action + (card.ordered ? " · " + tr("Move left / right with Alt + arrow keys") : "") +
            (keepsLane ? " · " + tr("Stays in this lane while marked ★/◷") : "");
        }
        if (this.expanded?.collectionID === this.collection.id && this.expanded.itemID === card.item.id) {
          this.childCards.forEach(place);
        }
      }
    }
    this.applyLaneColumns();
  }

  // True while the sort menu is applied to the reading lanes and the presentation lane as well.
  sortsLanes() {
    return getPref("sortReadingOrder") === true && !!this.sortOption && this.sortOption !== "table";
  }

  // Saves the order of the presentation lane (shown order first, then remembered keys not shown).
  moveInJournal(key, before) {
    const shown = this.sections.journal.cards.map(card => card.item.key);
    const stored = readingData(this.collection).journal;
    const current = [...shown, ...stored.filter(entry => !shown.includes(entry))];
    const next = moveInOrder(current, key, before, true);
    if (next.length === current.length && next.every((value, i) => value === current[i])) return;
    this.save(data => ({ ...data, journal: next }), false);
  }

  move(key, before, ordered) {
    const card = this.unorderedCards?.find(card => card.item.key === key);
    if (!ordered && card) { setItemStatus([card.item], ""); }
    if (ordered && card && (!tableStatus(card.item) || ["completed", "selected"].includes(tableStatus(card.item)))) {
      writePref(itemPref(card.item, "status"), "planned");
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
    const animate = !motionReduced(this.win);
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
      writePref(preferenceKey(collection), JSON.stringify(next));
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
    const canExpand = !child && getPref("expandChildren") !== false && item.isRegularItem() && (!!item.getNotes?.().length || attachments.length > 1);
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
    const hideEmpty = String(getPref("hideEmptyStatus") !== false);
    if (card.statusControl) {
      const status = tableStatus(card.item);
      card.statusControl.value = status;
      card.statusControl.className = "sl-status-control sl-status-" + status;
      card.statusPicker.className = "sl-status-picker sl-status-" + status;
      card.statusPicker.style.setProperty("--sl-status-color", workflowColor(status));
      card.statusFace.textContent = tr(STATUS_LABELS[status]);
      card.statusPicker.title = card.statusFace.textContent;
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
      const reduceMotion = motionReduced(this.win);
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
      const reduceMotion = motionReduced(this.win);
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

}
