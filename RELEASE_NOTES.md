# Reading Shelf 1.2.0-beta.4

This prerelease refines settings, matrix layout, descriptions and workflow controls.

- Localize every settings label and shadow option to the selected language. Group settings into Visibility, Workflow and Appearance.
- Keep both priority lanes equal in height, including an empty lane, and reserve a usable minimum drop area. Stack lanes on narrow windows.
- Fix dragging a queue-only reference back to Other items without moving it through an important lane first.
- Remove the separate Edit description button. Preserve double-click/Enter editing and grow both description and editor with their content.
- Size status labels from their displayed text. Controls wrap when a card is narrow; the native dropdown and keyboard interaction are retained.
- Make the native table's Reading Shelf column editable: choose reading status directly and toggle the star/clock for importance and urgency. The same preferences drive the matrix, gallery and table. Child attachments share their parent's workflow state.
- Spread the configurable shadow around the whole card with no downward offset. Dark-mode shadows remain opt-in.

## Install

Download **zotero-reading-shelf-1.2.0-beta.4.xpi** and use **Tools → Plugins → ⚙ → Install Plugin From File…**. Existing plugin ID, local descriptions/order and workflow preferences are retained. Updates remain manual.

## Verification and limits

Portable regression tests passed for queue removal/reclassification, row-specific table edits, priority propagation, description editing/source preservation, settings lifecycle/localization, bounded thumbnail concurrency and cancellation. The installed Zotero PDF.js passed bounded-read and cancellation integration tests. A browser rendering fixture passed six Korean/English card-size combinations (65%, 100%, 150%), equal-height empty lanes and long description/editor growth; the rendered layout was also inspected visually.

Targets Zotero 10.x. The native table callback and plugin API wrapping were checked against Zotero 10.0.7 source. Browser fixtures do not replace interactive testing inside Zotero. Windows/Linux runtime checks, total-RAM and frame-time benchmarks have not been performed. No runtime dependency or background polling was added; the existing bounded thumbnail queues remain in place.

## License

AGPL-3.0-only. Matching source includes build instructions, upstream acknowledgements and exact bundled dependency sources.
