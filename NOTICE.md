# Credits and third-party software

Reading Shelf began as a gallery-focused experiment based on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) by Jan Baykara and contributors. It retains compatibility with the Syllabus personal reading order note format. This modified implementation, prepared on 2026-11-07, focuses on the gallery and adapts the PDF thumbnail loading and macOS fallback from the earlier gallery patch. Zotero Syllabus is distributed under the GNU Affero General Public License version 3.

[ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary) by Guillaume Chapron was a usability reference for the card size control and gallery interactions.

The XPI bundles [markdown-it 14.2.0](https://www.npmjs.com/package/markdown-it/v/14.2.0) and [KaTeX 0.16.47](https://www.npmjs.com/package/katex/v/0.16.47) under the MIT License. Their licenses and notices for dependencies bundled with markdown-it are in `vendor/`. The release source package also includes the cached upstream npm source archives in `vendor/upstream/`.

PDF.js is loaded from the running Zotero installation. Quick Look and Poppler are optional system tools and are supplied by the operating system or the user.

Reading Shelf is an independent third-party plugin. Zotero is a registered trademark of the Corporation for Digital Scholarship. References to Zotero indicate compatibility. See the [Zotero trademark policy](https://www.zotero.org/support/terms/trademark).

The preferred form for modifying Reading Shelf, its build instructions, and the third-party source archives are in the source distribution accompanying this XPI on the [GitHub Releases page](https://github.com/4season/zotero-reading-shelf/releases).
