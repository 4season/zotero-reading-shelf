# Reading Shelf 1.2.0-beta.1

A prerelease focused on reading workflow and gallery layout.

- Move the Gallery / Table toggle to the left of quick search.
- Display child notes as readable text excerpts instead of short placeholder boxes.
- Reserve a card-sized drop space when adding the first item to Reading order.
- Hide reading-order buttons and child-item indicators independently.
- Add local reading status: 읽을 예정, 읽는 중, 중요. Change it in the gallery or the native item context menu; see badges in the Reading Shelf table column.
- Bound the collection-order lookup cache to 128 entries. Status and order storage do not modify item tags or bibliographic metadata.

## Install and use

Download `zotero-reading-shelf-1.2.0-beta.1.xpi`. In **Zotero → Tools → Plugins → ⚙ → Install Plugin From File…**, select the XPI. Existing Reading Shelf / Syllabus Lite installations retain their preferences.

See the [illustrated usage guide](https://github.com/4season/zotero-reading-shelf#reading-status-and-illustrated-guide).

![Gallery guide](https://raw.githubusercontent.com/4season/zotero-reading-shelf/v1.2.0-beta.1/docs/images/gallery-guide.svg)

![Status guide](https://raw.githubusercontent.com/4season/zotero-reading-shelf/v1.2.0-beta.1/docs/images/status-guide.svg)

The images are diagrams with synthetic examples, not personal-library screenshots. Status is local to the profile and does not sync through Zotero.

## Validation and compatibility

Targets Zotero 10.x. Automated gallery, status persistence, empty-list drop reservation, startup API registration, and Zotero PDF.js bounded-read/cancellation checks pass. New UI changes still need interactive verification in Zotero; total application memory was not benchmarked. Development uses macOS and Zotero 10.0.7; Windows and Linux remain untested interactively.

## License

AGPL-3.0-only with upstream acknowledgements in NOTICE.md. The matching source archive includes the exact bundled dependency sources and license notices. No private papers or library screenshots are included.
