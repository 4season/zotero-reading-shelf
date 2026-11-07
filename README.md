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

A local bookshelf and Eisenhower reading planner for Zotero collections. Browse attachment previews, arrange reading order, keep Markdown/LaTeX collection notes and change reading status without leaving the library.

## Install

Download `zotero-reading-shelf-1.2.1.xpi` from [Releases](https://github.com/4season/zotero-reading-shelf/releases/tag/v1.2.1). In Zotero, choose **Tools → Plugins → ⚙ → Install Plugin From File…**. Select a collection and click **Gallery**. Click **Table** to return to the native table. Starting with 1.2.1, Zotero can fetch updates from GitHub Releases. Users on 1.2.0 or earlier must install 1.2.1 manually once to activate the new update URL.

Targets Zotero 10.x; existing Syllabus Lite/Reading Shelf preferences retain the same add-on ID. Switch off other gallery plugins when their controls overlap.

## Features

### Bookshelf, status and reading order

![Core Article in Zotero: bookshelf, importance and Eisenhower mode](docs/images/core-article-tour.gif)

The bookshelf groups queued or actively reading references above unordered items. Completed references have a separate Completed section; importance and urgency are preserved. Returning a completed reference to a reading lane sets it to To read. Drag cards to reorder, or use the optional +/− buttons. Clearing reading status removes the reference from saved reading queues while retaining importance and urgency. Table status labels use native menus; star and pie/clock controls toggle importance and urgency independently. Clicking outside a status control releases its focus.

Double-click a collection note to edit Markdown and LaTeX. Use `$…$` or `\(…\)` inline, and separate `$$…$$` or `\[…\]` blocks for equations. Save with Ctrl/Cmd+Enter; cancel with Escape. Long notes and the editor grow with content. Very large sources above 100,000 characters display as plain text while preserving the original source.

### Eisenhower planner

Put urgent/important and important/not-urgent references in two top lanes, with a full-width reading queue below. Labels sit above the boxes; horizontal and vertical gaps match. Use the gallery's mode switch to return to a normal bookshelf. Enable **Remember mode per collection** to keep separate modes; otherwise the global mode applies.

### Reader and appearance options

![Reading-status colors and reset in Zotero](docs/images/core-article-colors.gif)

The GIFs were captured from the Core Article collection in Zotero 10.0.8 and cropped to the gallery area.

- Native Zotero reader opening marks the reference as Reading. Optionally clear that status when its last tracked reader tab closes; keep importance and urgency. The option is off by default. External applications are not tracked.
- Optionally remember bookshelf/Eisenhower mode per collection. This is off by default; disabling it retains stored per-collection choices for later reuse.
- Resize cards, sort unordered items and hide optional controls, including the mode switch to the right of Sort. Empty status labels remain hidden until hover or keyboard access.
- Set reading-status colors (To read, Reading, Completed) and separate importance/urgency button colors. Use the color picker or enter a `#RRGGBB` value. Reset a color group or all colors to defaults; Eisenhower box borders have their own clearly labeled group.
- Choose preview-only shadow strength; dark-mode shadows are opt-in. Set lane border colors or turn borders off. Dependent settings disable without clearing saved values.
- Click cards to select; open related child notes/attachments and use Zotero's native context menu. Double-click to open a reference's attachment or note.

## Storage and platform coverage

Reading order, collection notes, modes and workflow state are local Zotero preferences; they are not synced by this plugin. Thumbnail cache files are stored under `syllabus-lite-thumbnails` in the Zotero data directory. The plugin does not upload reference files.

Portable tests and XPI builds passed on **Windows, macOS and Linux** in [GitHub Actions](https://github.com/4season/zotero-reading-shelf/actions). macOS also passed tests with the installed Zotero PDF.js. Native Zotero 10.0.8 checks verified mode/priority controls, mode visibility, custom color application and color resets. Browser checks cover multiline XML-host notes, Markdown/MathML, layout and status interactions. These tests do **not** launch the installed Zotero UI on all three systems. Windows/Linux native UI, RAM and frame-time measurements remain unverified. This release is published with that coverage boundary explicitly disclosed.

PDF.js, EPUB and image previews use host APIs. Quick Look and optional Homebrew/MacPorts Poppler fallbacks are guarded by `Zotero.isMac`; Windows/Linux do not invoke those paths. Preview availability can differ for unsupported/encrypted documents. No external preview software is installed automatically.

## Build and test

Python 3 and Node.js are needed. Runtime libraries are vendored; the plugin adds no npm runtime dependency or polling service.

```sh
python scripts/test.py
python scripts/build.py
```

Build outputs go to `dist/`. Optional installed-Zotero PDF test on macOS:

```sh
python scripts/test.py --zotero-omni /Applications/Zotero.app/Contents/Resources/app/omni.ja
```

For a browser regression fixture, run `python -m http.server 8767` and open `http://127.0.0.1:8767/tests/layout.html`. For the feature screens, open `docs/demo.html?lang=ko&mode=matrix` or `docs/demo.html?lang=en&mode=shelf` through the same server.

## Licenses and reference plugins

Reading Shelf is **AGPL-3.0-only**. Full license text, attribution, modification notices, dependency notices and matching source accompany the XPI. The major reference plugins are explicitly:

| Project | License | Relationship |
| --- | --- | --- |
| [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) — Jan Baykara and contributors | [AGPLv3](https://github.com/janbaykara/zotero-syllabus/blob/main/LICENSE) | Gallery implementation lineage and personal reading-order note format |
| [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary) — Guillaume Chapron | [AGPLv3](https://github.com/gchapron/ZoteroThumbLibrary/blob/main/LICENSE) | Cover browsing, card size and gallery usability reference |
| [Zotero](https://github.com/zotero/zotero) — host application | [AGPLv3](https://github.com/zotero/zotero/blob/main/COPYING) | Host APIs and PDF.js supplied by Zotero |

The two major reference plugins and Zotero's original license files were checked on 2026-11-07. Bundled markdown-it, KaTeX and their dependency notices remain MIT. `vendor/upstream/` contains matching dependency source archives, not user data or temporary files. See [NOTICE.md](NOTICE.md) for exact license blob identifiers and full provenance. Zotero is a registered trademark of the Corporation for Digital Scholarship; this is an independent third-party plugin with its own icon.

## Updating a release

`scripts/build.py` writes the XPI, SHA-256 checksum and `updates.json`. Publish the XPI as a GitHub Release asset first, then commit the generated `updates.json` at the repository root. Its versioned download URL, compatibility bounds and exact XPI hash are validated by `tests/updates.py`. The feed serves stable releases; no separate hosting service is required. Zotero's automatic plugin updates must be enabled.
