# Reading Shelf 1.2.0 — First stable release

**English** · [한국어 릴리즈 노트](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

A bookshelf and Eisenhower reading planner for Zotero 10.x. This is the first release published without the prerelease flag; earlier releases were previews.

## Features

![Bookshelf and Markdown/LaTeX collection note](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/bookshelf-en.jpg)

- Browse local attachment previews, resize cards and arrange reading order. Change status directly in the gallery or table; importance and urgency remain separate.
- Read/edit long Markdown and LaTeX collection notes without losing the original source. XML-host multiline insertion, inline math and block fractions have regression checks.
- Clearing reading status also removes saved reading-queue membership. Pointer selections release focus; background clicks can dismiss a focused control.

![Eisenhower planner with headings above boxes](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/matrix-ko.jpg)

- Two important-material lanes and a full-width reading queue. Headings sit above the boxes; both grid axes use 12px spacing.
- Optional per-collection bookshelf/Eisenhower mode memory, with a mode switch in the gallery.
- Optional reading-status reset when the last tracked reader tab closes, preserving importance and urgency. Both new options default to off.
- Preview-only shadows, colored lane borders, compact status controls and dependent settings. No new runtime dependency or polling service.

## Installation

Download **zotero-reading-shelf-1.2.0.xpi** → **Tools → Plugins → ⚙ → Install Plugin From File…**. Existing add-on ID, local order, notes and settings remain compatible. Updates are manual.

## Verification and compatibility

**Windows, macOS and Linux portable tests and XPI builds passed in GitHub Actions.** macOS also passed tests with Zotero 10.0.7's bundled PDF.js. Browser tests verified Markdown/MathML, multiline XML-host notes, status clearing and shelf movement, transparent controls, fixed table slots and lane layout. Matching source was extracted afresh to reproduce the XPI; uploaded asset hashes were checked.

**Native Zotero UI on Windows/Linux remains untested.** Portable tests are not native UI tests. No RAM/frame-time benchmark or universal document-format guarantee is claimed. Quick Look/optional Poppler fallbacks are macOS-only; core PDF.js/EPUB/image preview paths use host APIs. External reader applications are not tracked by the close-status option. These coverage limits are disclosed for this stable release.

## Licenses and major references

Checked original license files on 2026-11-07

| Project | License | Relationship |
| --- | --- | --- |
| [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) — Jan Baykara and contributors | [AGPLv3](https://github.com/janbaykara/zotero-syllabus/blob/main/LICENSE) | Gallery implementation lineage and personal reading-order note format |
| [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary) — Guillaume Chapron | [AGPLv3](https://github.com/gchapron/ZoteroThumbLibrary/blob/main/LICENSE) | Cover browsing, card size and gallery usability reference |
| [Zotero](https://github.com/zotero/zotero) — host application | [AGPLv3](https://github.com/zotero/zotero/blob/main/COPYING) | Host APIs and PDF.js supplied by Zotero |

Reading Shelf remains **AGPL-3.0-only**. Matching source, build instructions and license/attribution notices are provided. Bundled markdown-it and KaTeX retain their MIT notices. Dependency source archives are deliberately retained; stale illustration files were replaced with the feature screenshots. No personal library, PDFs, credentials, build cache or node_modules are included. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
