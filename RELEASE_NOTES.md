# Reading Shelf 1.2.1 — Workflow and preferences fixes

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Core Article captured in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-tour.gif)

- Synchronize reading order and reading status when moving references. Entering a reading lane sets an empty or Completed status to To read; Reading is preserved during sorting. Moving to Other items clears reading status. Repair old explicit-empty queue entries.
- Unify empty-lane instructions instead of the inconsistent Drop here label.
- Add **Completed**, with a separate section and configurable color. Completing a reference removes active queue membership while preserving importance and urgency; it can be returned to the reading queue.
- Place the mode switch after Sort and add a working hide option, applied through both the DOM and CSS.
- Version stylesheet URLs to prevent Zotero from reusing old styles after plugin updates. This fixes saved color/visibility changes failing to appear.
- Add live color-picker input and synchronized `#RRGGBB` text fields. Separate settings into preview shadows, reading-status colors, priority-button colors and Eisenhower box borders. Reset individual color groups or all colors without resetting unrelated preferences.
- Add Zotero update metadata pointing to versioned GitHub Release XPIs with SHA-256 verification. **1.2.0 and earlier need one manual 1.2.1 installation** because their embedded update URL was a placeholder. Later stable updates can use the repository feed with automatic plugin updates enabled.

![State colors and reset captured in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-colors.gif)

The GIFs show captured steps from the actual **Core Article** collection in Zotero 10.0.8, cropped to the gallery; no other collection or sidebar is included.

## Install and update

Install **zotero-reading-shelf-1.2.1.xpi** via **Tools → Plugins → ⚙ → Install Plugin From File…**. Existing local preferences, descriptions and order are retained. This update repairs stale queue entries and uses a stable GitHub update feed; it does not require a separate server.

## Verification

Portable regression tests and builds run on Windows, macOS and Linux. Added checks cover previously cleared-state drags, completed grouping/requeueing, priority preservation, explicit checkbox writes, live color input, scoped color resets, versioned preference stylesheets and the update manifest's exact XPI hash. The installed Zotero PDF.js test passed. Browser layout checks cover both languages, 65/100/150% card scales, long Markdown/LaTeX notes and fixed table slots.

On macOS, the candidate was installed and tested in Zotero 10.0.8: mode/priority transitions, mode hiding, Hex color changes and reset behavior were checked. The existing palette was restored after color verification. Automated drag regression checks passed; native drag automation did not produce a reliable drop result, so a native drag end-to-end pass is not claimed. Windows/Linux installed-Zotero UI, RAM and frame-time measurements remain unverified.

## License and acknowledgements

AGPL-3.0-only. Major references remain [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3; Zotero's COPYING is also AGPLv3. Matching source, original notices and dependency source archives accompany the release. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
