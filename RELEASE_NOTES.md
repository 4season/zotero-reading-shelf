# Reading Shelf 1.2.0-beta.5

This prerelease softens preview shadows and improves workflow controls and preferences.

- Apply a much lighter shadow only around the attachment preview. Titles, authors and controls have no surrounding shadow. Keep configurable strengths and opt-in dark-mode shadows.
- Hide empty table status labels by default, revealing them on row hover or keyboard focus. The existing Hide empty status preference controls both views.
- Distinguish importance and urgency by shape, background and border: ☆ → ★ and ○ → ◷. Add localized on/off tooltips. The pie/clock control remains urgency, independent of reading status.
- Increase settings section spacing and heading size in both languages, align color rows, and load a scoped settings stylesheet through Zotero's preferences API.
- Add a switch for colored Eisenhower borders. Disabling borders preserves lane geometry and saved colors.
- Add a lightweight SVG icon with books, a bookmark and a shelf, used by the plugin manager and preferences sidebar.
- Avoid matrix relayout when only reading status changes; retain relayout for priority changes and legacy priority migration. Reuse per-card importance/urgency lookups during control refresh.

## Install

Download **zotero-reading-shelf-1.2.0-beta.5.xpi** and use **Tools → Plugins → ⚙ → Install Plugin From File…**. Existing add-on ID and saved settings/order/descriptions remain compatible. Updates remain manual.

## Verification and limits

Regression tests cover hidden-empty status metadata, distinct toggle symbols, table edits, border preference propagation, independent status/priority updates, queue drag removal, settings lifecycle/localization and thumbnail cancellation/concurrency. Installed Zotero PDF.js passed bounded-read and cancellation checks. A browser fixture verified preview-only shadows, active toggle backgrounds, border disabling, six language/card-size combinations and long memo growth. Preview rendering, the SVG icon and an HTML approximation of the settings layout were visually inspected.

Native Zotero UI interaction and Windows/Linux execution remain unverified. No RAM or frame-time benchmark is claimed. Existing offscreen rendering and bounded thumbnail queues remain; no runtime dependency, background polling or animated shadow was added.

## License

AGPL-3.0-only. Matching source includes build instructions, the editable SVG icon, upstream acknowledgements and bundled dependency sources.
