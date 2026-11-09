// SPDX-License-Identifier: AGPL-3.0-only
const PREF = "extensions.reading-shelf.";
const LEGACY_PREF = "extensions.syllabus-lite.";
const NAME = "Reading Shelf";
const VISIBILITY_PREFS = [
  ["hideCardButtons", "sl-hide-card-buttons"],
  ["hideChildIndicator", "sl-hide-child-indicator"],
  ["hideSizeControl", "sl-hide-size"],
  ["hideSortControl", "sl-hide-sort"],
  ["hideModeControl", "sl-hide-mode"],
  ["hidePresentationControl", "sl-hide-presentation"]
];
const LEGACY_TAG = "zotero-syllabus-personal-reading-order";
const MANAGED_NOTE_TAGS = [LEGACY_TAG, "zotero-syllabus", "zotero-syllabus-pinned-collection"];
const PDF_BASE = "resource://zotero/reader/pdf/";
const CARD_GAP = 17;
const BASE_CARD_WIDTH = 176;
const MIN_CARD_SCALE = 65;
const MAX_CARD_SCALE = 150;
// Preference access: readPref/writePref take a full key, getPref/setPref a name under PREF.
function readPref(key) { return Zotero.Prefs.get(key, true); }
function writePref(key, value) { Zotero.Prefs.set(key, value, true); }
function getPref(name) { return readPref(PREF + name); }
function setPref(name, value) { writePref(PREF + name, value); }
const windows = new Map();
// Gentle ease-in-out so motion starts and ends softly instead of jumping on the first frame.
const MOTION_EASING = "cubic-bezier(.4,0,.2,1)";
const MOTION_MS = 280;
// "system" follows the OS "reduce motion" setting; "always" and "off" override it. On Windows, that OS
// setting is often off (power saving, remote desktop, virtual machines), which would otherwise hide
// every animation without any hint.
function motionMode() {
  const mode = getPref("motion");
  return mode === "always" || mode === "off" ? mode : "system";
}
function motionReduced(win) {
  const mode = motionMode();
  if (mode === "always") return false;
  if (mode === "off") return true;
  return !!win.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}
