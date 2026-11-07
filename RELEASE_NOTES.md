# Reading Shelf 1.3.0 — New add-on ID (reinstall required)

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Dragging papers between lanes and switching modes in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## Action required when updating from 1.2.x

Reading Shelf now has its own add-on ID, `reading-shelf@4season.github.io`, instead of the one inherited from the plugin it is based on. Zotero treats this as a different plugin, so **it will not be offered as an automatic update**:

1. In Zotero, open **Tools → Plugins** and remove the old **Reading Shelf**.
2. Install **zotero-reading-shelf-1.3.0.xpi** via **⚙ → Install Plugin From File…** and restart if asked.

Do not keep both installed; their gallery buttons and settings would overlap.

## What carries over

Your settings, reading statuses, importance and urgency, reading order, per-collection modes and collection notes are kept. On first start 1.3.0 copies the settings saved by earlier versions into the new `extensions.reading-shelf.*` names (since 1.2.4); nothing already saved is overwritten, and the old values stay in place. Preview images are rebuilt on first view.

## Also in this release

- Settings are stored under the Reading Shelf name (`extensions.reading-shelf.*`) instead of the name of the plugin Reading Shelf is based on.
- Previews are cached in `reading-shelf-thumbnails` (since 1.2.3). The old `syllabus-lite-thumbnails` folder can be deleted.

Release 1.2.4 was not published as an update; 1.3.0 includes everything in it.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked. The carry-over of old settings is covered by automated tests; it has not been run against many real libraries yet.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
