<p align="center">
  <img src="icons/reading-shelf.svg" width="96" height="96" alt="Reading Shelf icon">
</p>
<h1 align="center">Reading Shelf</h1>
<p align="center">
  <a href="https://github.com/4season/zotero-reading-shelf/releases/latest"><img src="https://img.shields.io/github/v/release/4season/zotero-reading-shelf?label=version&amp;color=287d76" alt="Latest release"></a>
  <a href="https://github.com/4season/zotero-reading-shelf/releases/tag/v1.2.1"><img src="https://img.shields.io/badge/released-2026--11--07-64748b" alt="Released on 2026-11-07"></a>
  <a href="https://www.zotero.org/"><img src="https://img.shields.io/badge/Zotero-10.x-bf3d47" alt="Zotero 10.x"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-385c8e" alt="AGPLv3 license"></a>
  <a href="https://github.com/4season/zotero-reading-shelf/actions/workflows/ci.yml"><img src="https://github.com/4season/zotero-reading-shelf/actions/workflows/ci.yml/badge.svg" alt="Portable checks"></a>
</p>
<p align="center"><strong>English</strong> · <a href="README.ko.md">한국어</a></p>

Reading Shelf turns a Zotero collection into a bookshelf. See each paper's preview, put papers in the order you plan to read them, track what you are reading, and sort them with an Eisenhower (urgent/important) layout. Everything stays inside Zotero.

## Install

1. Download `zotero-reading-shelf-1.2.1.xpi` from the [latest release](https://github.com/4season/zotero-reading-shelf/releases/latest).
2. In Zotero, choose **Tools → Plugins → ⚙ → Install Plugin From File…** and select the file.
3. Select a collection and click **Gallery**. Click **Table** to go back to the normal list.

Requires Zotero 10.x. Your settings from earlier versions are kept.

**Updating:** From 1.2.1 on, Zotero can update the plugin automatically if automatic plugin updates are turned on. If you use 1.2.0 or earlier, install 1.2.1 manually once; updates are automatic after that.

**Language:** The plugin starts in Korean. To switch to English, open Zotero's settings, choose **Reading Shelf**, and set **Language** to English.

If another gallery plugin is installed and the two overlap, turn one of them off.

## What you can do

### Arrange your reading list

![Core Article in Zotero: bookshelf, importance and Eisenhower mode](docs/images/core-article-tour.gif)

- **Bookshelf:** papers you plan to read or are reading appear first, in your order. Other papers appear under *Unordered items*, and finished ones under *Completed*.
- **Reorder:** drag a card, press Alt + ←/→ on a selected card, or use the optional + / − buttons on the card.
- **Reading status:** *No status*, *To read*, *Reading* or *Completed*. Change it from the card or from the status column in the table. Clearing the status removes the paper from your reading list.
- **Importance and urgency:** ★ marks importance and ◷ marks urgency. They are separate from status, so they stay as they are when you change a paper's status.
- Putting a paper in the reading list sets it to *To read* (a paper already marked *Reading* stays that way). Moving it to *Unordered items* clears its status. Moving a *Completed* paper back to the reading list sets it to *To read*.
- Opening a paper in Zotero's own reader marks it *Reading*. Optionally, the status can be cleared when you close its last reader tab (off by default; PDF readers outside Zotero are not detected).

### Eisenhower layout

Use the mode button next to **Sort** to switch the bookshelf to an Eisenhower layout: *Urgent & important* and *Important, not urgent* sit side by side, with the *Reading queue* below. Drag papers between them. Switch the same button back to return to the bookshelf.

By default the layout you pick applies to all collections. To remember a separate layout for each collection, turn on **Remember Eisenhower / bookshelf mode per collection** in the settings.

### Collection notes

Double-click the note at the top of a collection to edit it. Markdown and LaTeX are supported:

- Inline math: `$…$` or `\(…\)`
- Equations on their own lines: `$$…$$` or `\[…\]`
- Save with Ctrl/Cmd + Enter; cancel with Esc.

Notes longer than 100,000 characters are shown as plain text so Zotero stays responsive; the text itself is never changed.

### Customize

Open Zotero's settings and choose **Reading Shelf** to:

- change card size, sorting, and which buttons and controls are shown (including the mode button);
- set colors for *To read*, *Reading* and *Completed*, the ★ and ◷ buttons, and the Eisenhower borders, by color picker or `#RRGGBB` code, and reset one group or all colors;
- adjust preview shadows (off, soft, medium, strong; dark mode optional).

Settings that depend on another option are greyed out but keep their values.

![Reading-status colors and reset in Zotero](docs/images/core-article-colors.gif)

You can also click a card to select it, double-click it to open its attachment or note, and right-click for Zotero's usual menu.

## Your data and privacy

- Reading order, collection notes, modes and statuses are saved on your computer in Zotero's preferences. This plugin does not sync them to other computers.
- Preview images are cached in a `syllabus-lite-thumbnails` folder inside your Zotero data folder.
- Your files are never uploaded anywhere.

## Known limits

- Tested on macOS with Zotero 10.0.8. Windows and Linux have not been tried with the installed Zotero app.
- Previews work for PDFs, EPUBs and images. Encrypted or unsupported files may show no preview. On macOS, Quick Look (and Poppler, if you have installed it) is used as a fallback.
- Dragging cards has not been checked by hand in the installed Zotero app.

## License and credits

Reading Shelf is free software under **AGPL-3.0-only**. It builds on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) by Jan Baykara and contributors, and was inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary) by Guillaume Chapron; both are AGPLv3. Bundled markdown-it and KaTeX are MIT-licensed. See [NOTICE.md](NOTICE.md) for details.

Reading Shelf is an independent plugin and is not affiliated with Zotero. Zotero is a registered trademark of the Corporation for Digital Scholarship.

Developers: see [CONTRIBUTING.md](CONTRIBUTING.md) for building, testing and releasing.
