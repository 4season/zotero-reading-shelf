# Reading Shelf 1.2.1 — Fixes for status, colors and updates

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Core Article in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-tour.gif)

## What's new

- **Completed status.** Mark a paper *Completed* to move it to its own *Completed* section, with its own color. It leaves your reading queue but keeps its importance and urgency. Drag it back to the reading list to make it *To read* again.
- **Reading status follows your reading list.** Putting a paper in the reading list sets it to *To read* (a paper marked *Reading* stays that way). Moving it to *Other items* clears its status. Papers left in an inconsistent state by older versions are repaired automatically.
- **Mode button.** It now sits right of **Sort**, and the setting to hide it works.
- **Color settings.** The color picker updates live and has a matching `#RRGGBB` field. Settings are grouped into preview shadows, reading-status colors, ★/◷ button colors and Eisenhower borders. You can reset one group or all colors without touching other settings.
- **Consistent empty-lane text.** Empty lanes now show the same hint instead of a mix of "Drop here" and other messages.

## Fixes

- Saved colors and hidden controls now appear after a plugin update; Zotero was reusing old styles.

## Install and update

Install **zotero-reading-shelf-1.2.1.xpi** via **Tools → Plugins → ⚙ → Install Plugin From File…**. Your settings, notes and reading order are kept.

From this version on, Zotero can update the plugin from GitHub Releases when automatic plugin updates are on. **If you are on 1.2.0 or earlier, install 1.2.1 manually once**; those versions contain a placeholder update address.

![Changing and resetting status colors in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-colors.gif)

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
