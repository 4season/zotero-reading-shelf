# Reading Shelf 1.2.0-beta.2

This prerelease separates reading status from importance and urgency, and adds a two-column reading-priority mode.

- Put the compact Gallery / Table toggle back to the right of quick search.
- Invalidate native table row data when workflow values change, and show a Reading Shelf row in bibliographic item Info.
- Share parent-reference status with its attached files. Opening the native reader or selecting a reader tab marks the reference as reading.
- Choose Korean or English in Settings; importance and urgency are independent switches alongside reading status.
- Preserve beta.1's combined “important” value as a separate importance flag.
- Hide empty status controls until hover or keyboard focus by default.
- Add a subtle static light-mode boundary/shadow around main previews.
- Add optional Eisenhower 1 × 2 lanes: urgent/important on the left and important/not-urgent on the right. Other items remain below. Drag into a lane or use the star/clock controls.
- Batch animation geometry reads before animation writes; keep thumbnail concurrency and cancellation bounded.

## Install

Download **zotero-reading-shelf-1.2.0-beta.2.xpi** and use **Tools → Plugins → ⚙ → Install Plugin From File…** in Zotero. Existing plugin ID and local preferences are retained. Open **Settings → Reading Shelf** for language, matrix mode and visibility switches. Status is local to the profile and does not sync.

See the [illustrated usage guide](https://github.com/4season/zotero-reading-shelf#reading-status-and-illustrated-guide). Diagrams use synthetic examples rather than personal papers.

## Validation and limits

Automated checks cover table/parent/file consistency, reading events, independent priority migration, language switching, native cache invalidation, matrix grouping and drag classification, gallery interactions, Markdown/math, bounded thumbnail work, and Zotero PDF.js reads/cancellation.

Targets Zotero 10.x; development uses Zotero 10.0.7 on macOS. The new UI has not been interactively verified in Zotero. Windows and Linux paths were reviewed in code, but have not been executed on those operating systems. macOS-only preview fallbacks are guarded; unsupported-format previews can differ across platforms. External document applications are outside the native-reader status detection. Total RAM and frame timing were not benchmarked.

## License

AGPL-3.0-only. The matching source archive includes build instructions, upstream acknowledgements and exact bundled dependency sources. No new third-party dependencies were added.
