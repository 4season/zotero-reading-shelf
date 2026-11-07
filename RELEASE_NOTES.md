# Reading Shelf 1.3.9 — English by default, an animations setting, clearer "−"

**English** · [한국어](https://github.com/4season/zotero-reading-shelf/blob/main/RELEASE_NOTES.ko.md)

![Switching to the Eisenhower layout and moving papers between lanes in Zotero](https://raw.githubusercontent.com/4season/zotero-reading-shelf/main/docs/images/core-article-eisenhower.gif)

## What's new

- **English is now the default language.** Korean (한국어) is still available: Zotero settings → Reading Shelf → Language. If you had already chosen a language, nothing changes; if you never chose one, you will now see English.
- **A setting for animations, found by testing on Windows.** The plugin follows the system's "reduce motion" setting, and on Windows that is often switched off (power saving, remote desktop, virtual machines), which hid every animation without any hint. In **Settings → Reading Shelf → Appearance → Animations** you can now choose *Follow system* (the default), *Always on* or *Off*. If animations are missing, try *Always on*. On Windows you can also check Settings > Accessibility > Visual effects > Animation effects.
- **The "−" button now explains itself in the Eisenhower layout.** A paper marked ★/◷ sits in its lane because of those marks, so taking it off the reading order clears its status but does not move it. The button's tooltip now says it stays in the lane while marked ★/◷. To take it out of the lane, turn ★/◷ off or drag it to *Other items*.

## Update

Same add-on ID as 1.3.0, so Zotero updates it automatically when automatic plugin updates are on. Coming from 1.2.x? Remove the old Reading Shelf in **Tools → Plugins** first, then install **zotero-reading-shelf-1.3.9.xpi** via **⚙ → Install Plugin From File…**.

## Known limits

Checked on macOS with Zotero 10.0.8, and the Windows animation finding came from a Windows tester. Linux with the installed Zotero app has not been checked. The new Animations setting is covered by automated tests; whether it brings animations back on every Windows setup has not been confirmed.

## License

AGPL-3.0-only. Built on [Zotero Syllabus](https://github.com/janbaykara/zotero-syllabus) and inspired by [ZoteroThumbLibrary](https://github.com/gchapron/ZoteroThumbLibrary), both AGPLv3. See [NOTICE](https://github.com/4season/zotero-reading-shelf/blob/main/NOTICE.md).
