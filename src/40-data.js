// SPDX-License-Identifier: AGPL-3.0-only
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
  const local = readPref(preferenceKey(collection));
  let data = null;
  try {
    data = local ? JSON.parse(local) : null;
  } catch (error) {
    Zotero.logError(error); // A damaged saved order must not break the gallery; fall back to the note.
  }
  if (data && typeof data === "object") {
    data.order = Array.isArray(data.order) ? data.order.filter(key => typeof key === "string") : [];
    data.journal = Array.isArray(data.journal) ? data.journal.filter(key => typeof key === "string") : [];
    // Repair old explicit-empty statuses left in the persisted reading order.
    const order = data.order.filter(key => getPref("status." + collection.libraryID + "." + key) !="" && getPref("status." + collection.libraryID + "." + key) !== "completed");
    if (order.length !== data.order.length) {
      const repaired = { ...data, order };
      writePref(preferenceKey(collection), JSON.stringify(repaired));
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
          description: typeof data.description === "string" ? data.description : "",
          journal: []
        };
      } catch {
        // Syllabus notes can also contain ordinary preformatted text.
      }
    }
  }
  return { order: [], description: "", journal: [] };
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
