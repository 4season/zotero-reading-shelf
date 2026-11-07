# Reading Shelf 1.2.2 — Fixes for per-collection modes and reading status

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Core Article in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-tour.gif)

## Fixes

- **Per-collection mode no longer leaks between collections.** With **Remember Eisenhower / bookshelf mode per collection** on, each collection keeps the mode you chose. A collection you have not chosen for yet is fixed to the current mode the first time you open it, so changing another collection or the default later does not change it.
- **The global "Eisenhower mode" checkbox is disabled while per-collection memory is on.** It used to overwrite the open collection's saved mode. Use the mode button next to **Sort** instead.
- **Reading status is no longer reset when you switch back to an open reader tab.** Switching tabs used to set the paper to *Reading* again, undoing a *Completed* or cleared status you had just set.
- **The "could not be saved" message now appears in Korean** when the plugin language is Korean.
- **A damaged saved reading order no longer breaks the gallery.** The plugin falls back to the collection's reading-order note.

Also: the add-on description in Zotero's plugin list now describes what Reading Shelf does.

## Install and update

Install **zotero-reading-shelf-1.2.2.xpi** via **Tools → Plugins → ⚙ → Install Plugin From File…**. Your settings, notes and reading order are kept. If you use 1.2.1 and automatic plugin updates are on, Zotero offers this update by itself. On 1.2.0 or earlier, install manually once.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
