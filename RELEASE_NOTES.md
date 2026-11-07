# Reading Shelf 1.2.4 — Settings renamed to Reading Shelf

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Dragging papers between lanes and switching modes in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## What's changed

- **Settings are now stored under the Reading Shelf name** (`extensions.reading-shelf.*`) instead of the name of the plugin Reading Shelf is based on. This avoids clashes with other plugins.
- **Your existing settings carry over automatically.** The first time 1.2.4 starts, it copies what you had saved: language, card size, colors, reading statuses, importance and urgency, reading order and per-collection modes. Nothing already saved under the new name is overwritten.
- The old values are left in place, so going back to an earlier version still finds your settings.

No action is needed. If something looks reset after updating, tell us on the issue tracker; your old values are still stored.

## Install and update

Install **zotero-reading-shelf-1.2.4.xpi** via **Tools → Plugins → ⚙ → Install Plugin From File…**. If you use 1.2.1 or later and automatic plugin updates are on, Zotero offers this update by itself. On 1.2.0 or earlier, install manually once.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked. The copy of old settings is covered by automated tests; it has not been run against many real libraries yet.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
