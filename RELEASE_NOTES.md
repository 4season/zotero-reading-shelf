# Reading Shelf 1.2.3 — Own preview cache folder

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Dragging papers between lanes and switching modes in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## What's changed

- **Preview images are now cached in `reading-shelf-thumbnails`** inside your Zotero data folder, instead of a folder named after the plugin Reading Shelf is based on. This keeps it from sharing a folder with other plugins.
- Previews are rebuilt the first time you open a collection after updating, so the first view may be a little slower.
- The old `syllabus-lite-thumbnails` folder is no longer used. You can delete it to free disk space; Reading Shelf does not delete it for you because another plugin may use the same name.
- The README now shows separate bookshelf and Eisenhower demos.

Your settings, notes, reading order and modes are unchanged.

## Install and update

Install **zotero-reading-shelf-1.2.3.xpi** via **Tools → Plugins → ⚙ → Install Plugin From File…**. If you use 1.2.1 or later and automatic plugin updates are on, Zotero offers this update by itself. On 1.2.0 or earlier, install manually once.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
