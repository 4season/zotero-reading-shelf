# Reading Shelf 1.4.0 — Presentation mode and cleaner settings

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Switching to the Eisenhower layout and moving papers between lanes in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## What's new

- **Presentation mode.** A lane for the paper you will present at a journal club, lab meeting or seminar, plus a *Selected* status. Turn it on in the settings or with the button next to the mode switch; it can be remembered per collection. Optional: treat *Selected* papers as important and urgent, and return them to their previous status when the mode is turned off.
- **Cleaner settings.** The Eisenhower and presentation options now share one layout, with a single short description under each. The Eisenhower border options are now disabled while Eisenhower mode is off; before, they stayed enabled whenever per-collection memory was on.
- **Reading status in the table.** In a narrow column the status shows as a colored dot instead of clipped text. Closing the last reader tab now returns a paper to the status it had before it was opened.
- **Layout options.** Optional equal lane heights, a presentation lane color, a hide option for the presentation button, and sorting that can also apply to the reading lanes.
- **Internals.** The plugin source is split into modules under `src/` (bootstrap.js is generated from them), and preference access is centralized. No behavior change.

## Update

Same add-on ID, so Zotero updates it automatically when automatic plugin updates are on. Otherwise install **zotero-reading-shelf-1.4.0.xpi** via **⚙ → Install Plugin From File…**. Your settings are kept.

## Known limits

Automated tests pass on the project's checks, and the plugin was checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app were not rechecked for this version.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
