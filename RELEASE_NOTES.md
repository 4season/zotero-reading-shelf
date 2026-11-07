# Reading Shelf 1.2.0-beta.6

This prerelease fixes disappearing multiline collection descriptions and overlapping workflow text.

- Parse rendered Markdown in an HTML document and import nodes into Zotero's XML/XUL document. This avoids XML errors from HTML line-break tags. Check the inserted text and fall back to the saved source if rendering is empty or fails; preserve the complete editable source.
- Remove the old hover rule that made the transparent native status selector opaque over its display label. Keep the selector transparent on hover, focus and activation while retaining native menus and keyboard access.
- Remove long preview hover tooltips; retain accessible labels and the title below the preview.
- Reduce the matrix-to-queue gap to 12px by removing duplicated section margins. Increase the preview-to-title gap.
- Use fixed table slots for status, importance and urgency. Keep one-line status labels and equal button dimensions in both states to avoid horizontal shifts and row-height changes.
- Disable matrix-border controls when matrix mode is off; disable lane colors when colored borders are off; disable dark-mode shadows when shadow strength is Off. Retain saved values and restore the controls when the parent option is enabled.
- Slightly reduce settings row spacing. No runtime dependency or background polling is added; existing thumbnail concurrency and offscreen rendering remain.

## Install

Download **zotero-reading-shelf-1.2.0-beta.6.xpi** and use **Tools → Plugins → ⚙ → Install Plugin From File…**. Existing add-on ID, preferences, order and descriptions remain compatible. Updates remain manual.

## Verification and limits

Portable gallery, workflow, settings-dependency and PDF.js regression tests passed. A source-included browser fixture (`tests/layout.html`) reproduced the old XML insertion error and passed the imported 50-line memo, focused-select transparency, fixed table positions, matrix spacing, six language/card-size combinations and memo/editor-growth checks. Fresh source extraction reproduces the packaged XPI.

The XML fixture models Zotero's document type but does not replace interaction in the installed Zotero UI. Native application interaction, Windows/Linux execution, RAM and frame-time benchmarks remain unverified.

## License

AGPL-3.0-only. Matching source includes build instructions, editable icon, browser regression fixture, upstream acknowledgements and bundled dependency sources.
