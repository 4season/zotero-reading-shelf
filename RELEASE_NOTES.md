# Reading Shelf 1.3.6 — Previews appear instantly when you reopen

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Opening a paper's notes and attachments right under it, then right-clicking one in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-attachments.gif)

## What's improved

- **A preview you have already seen shows up the moment its card appears.** Reopening a paper's notes and attachments no longer starts with an empty box that changes shape and fills in a moment later; the picture is there at once, with its proper proportions, together with the reading-progress bar for PDFs.
- Previews that were already made no longer wait for an animation to finish. Only previews that still have to be created are held back until the motion is over.
- If an attachment changes, its remembered preview and its paper's are dropped so an outdated picture is never shown.

The README now also has a short demo and a section about seeing a paper's notes and attachments at a glance and using the right-click menu on them.

## Update

Same add-on ID as 1.3.0, so Zotero updates it automatically when automatic plugin updates are on. Coming from 1.2.x? Remove the old Reading Shelf in **Tools → Plugins** first, then install **zotero-reading-shelf-1.3.6.xpi** via **⚙ → Install Plugin From File…**.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked. The first time a preview is shown it still has to be created, so that one can take a moment.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
