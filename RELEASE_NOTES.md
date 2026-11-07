# Reading Shelf 1.3.4 — Smoother animations

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Dragging papers between lanes and switching modes in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## What's improved

- **Switching between the bookshelf and Eisenhower layouts now animates.** Cards glide to their new places instead of jumping.
- **Opening and closing a paper's notes and attachments is smoother.** The motion is a little longer (about 0.28 s) with a gentler start and finish, so it no longer looks abrupt.
- **No more stutter when the extra cards appear.** Rendering the preview images for newly shown cards now waits until the animation has finished, instead of competing with it.
- **★, ◷ and the reading status fade in** when you hover over a card, instead of popping in.

All motion respects the system's "reduce motion" setting.

## Update

Same add-on ID as 1.3.0, so Zotero updates it automatically when automatic plugin updates are on. Coming from 1.2.x? Remove the old Reading Shelf in **Tools → Plugins** first, then install **zotero-reading-shelf-1.3.4.xpi** via **⚙ → Install Plugin From File…**.

## Known limits

Checked on macOS with Zotero 10.0.8. Windows and Linux with the installed Zotero app have not been checked. The causes were found by analysing a screen recording and the changes are covered by automated tests; how smooth it feels on your machine may still vary.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
