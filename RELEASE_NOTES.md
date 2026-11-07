# Reading Shelf 1.2.0-beta.3

This prerelease fixes preference labels and long descriptions, and adds appearance controls and a second matrix row.

- Fix settings initialization: Zotero executes pane scripts before inserting the markup. Initialize on the pane's load/showing events and include readable fallback labels.
- Add preview shadow levels: Off, Soft, Medium and Strong. Medium is the new light-mode default; dark-mode shadows remain off unless enabled explicitly. Theme handling follows Zotero's computed color scheme.
- Keep long descriptions scrollable and editable with an always-available Edit description action. Double-click and keyboard editing remain available. Empty-output Markdown falls back to visible source; descriptions over 100,000 characters display as plain text while preserving the complete saved source.
- Add a full-width reading queue as the second row beneath the two priority lanes. Important items stay in the top lanes; queued references without importance appear in the second row; unqueued references remain below. Dragging into the queue clears importance and retains queue membership without duplicating the reference.
- Choose separate border colors for the urgent/important, important/not-urgent, and queue regions in Settings.
- Make gallery status selectors smaller and tighten spacing above the controls. Native table badge styling is unchanged.

## Install

Download **zotero-reading-shelf-1.2.0-beta.3.xpi** and use **Tools → Plugins → ⚙ → Install Plugin From File…**. Existing plugin ID, local notes/order and workflow preferences are retained. Open **Settings → Reading Shelf** for the shadow levels and region colors.

[Usage guide](https://github.com/4season/zotero-reading-shelf#reading-status-and-illustrated-guide)

## Verification and limits

Automated tests cover script-before-fragment preference loading, language switching, validated color persistence, long-description source preservation/editing, queue placement and drag reclassification, gallery/workflow regressions and bounded PDF.js reads/cancellation. The settings fragment parses as XML and the release includes matching source.

Targets Zotero 10.x. Development and tests use macOS and Zotero 10.0.7. New settings/layout changes have not been interactively verified in Zotero; Windows/Linux runtime checks, total-RAM measurements and frame-time benchmarks have not been performed. No new dependencies or background polling were added.

## License

AGPL-3.0-only. Matching source includes build instructions, upstream acknowledgements and exact bundled dependency sources.
