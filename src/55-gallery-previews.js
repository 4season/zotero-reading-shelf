// SPDX-License-Identifier: AGPL-3.0-only
// Cover loading and reading-progress methods of the gallery.
Object.assign(Gallery.prototype, {
  release(card) {
    card.visible = false;
    if (card.request) {
      lookupQueue.delete(card.request);
      coverQueue.delete(card.request);
      card.request.abort();
      card.request = null;
    }
    card.cover.querySelector("img")?.remove();
    card.knownCover = false;
  },

  // Rendering a preview is heavy main-thread work; hold it back until a running card animation
  // has finished so the motion does not stutter.
  loadCardWhenIdle(card) {
    const wait = (this.animatingUntil || 0) - Date.now();
    if (card.knownCover || wait <= 0 || typeof this.win.setTimeout !== "function") { this.loadCard(card); return; }
    if (card.deferred) return;
    card.deferred = true;
    this.win.setTimeout(() => {
      card.deferred = false;
      if (card.visible && this.cards.get(card.item.id) === card) this.loadCard(card);
    }, wait + 20);
  },

  loadCard(card) {
    if (card.request || card.knownCover) return;
    const request = new this.win.AbortController();
    card.request = request;
    lookupQueue.set(request, () => this.prepareCover(card, request).catch(error => {
      if (request.signal.aborted) return;
      card.placeholder.textContent = tr("No preview");
      Zotero.logError(error);
    }));
    drainCoverLookups();
  },

  async prepareCover(card, request) {
    const { signal } = request;
    const attachment = card.attachment ?? await primaryAttachment(card.item);
    if (signal.aborted) return;
    if (!attachment) {
      card.placeholder.textContent = card.item.getField("url") || card.item.getField("DOI")
        ? tr("Web link") : tr("No attachment");
      return;
    }
    card.attachment = attachment;
    const type = attachmentLabel(attachment);
    card.placeholder.textContent = tr(type);
    if (!attachment.isFileAttachment()) return;

    const remembered = coverMemo.get(attachment.id);
    if (remembered) {
      this.showCover(card, request, type, remembered);
      return;
    }

    const source = await coverSource(attachment, signal);
    if (signal.aborted) return;
    if (!source) {
      this.updateCardProgress(card, request);
      this.showCover(card, request, type, null);
      return;
    }

    // A slow renderer must never block reading an existing thumbnail.
    const cached = await readCachedCover(source);
    if (signal.aborted) return;
    if (cached) {
      this.showCover(card, request, type, cached);
      return;
    }

    this.updateCardProgress(card, request);
    if (failedCovers.get(source.image) > Date.now()) {
      this.showCover(card, request, type, null);
      return;
    }
    coverQueue.set(request, async () => {
      let cover;
      try {
        // A different card or window may have generated this file while we waited.
        cover = await readCachedCover(source);
        if (!cover && !signal.aborted && !(failedCovers.get(source.image) > Date.now())) {
          cover = await generateCover(this.win, attachment, source, signal);
          if (!cover && !signal.aborted) {
            failedCovers.delete(source.image);
            failedCovers.set(source.image, Date.now() + 30 * 60 * 1000);
            if (failedCovers.size > 128) failedCovers.delete(failedCovers.keys().next().value);
          }
        }
      } catch (error) {
        if (!signal.aborted) Zotero.logError(error);
      }
      this.showCover(card, request, type, cover);
    });
    void drainCovers();
  },

  showCover(card, request, type, cover) {
    if (request.signal.aborted) return;
    if (!cover) {
      card.placeholder.textContent = tr(type) + " · " + tr("No preview");
      return;
    }

    if (card.attachment?.id !== undefined) {
      cover.attachmentID = card.attachment.id;
      remember(coverMemo, card.attachment.id, cover);
      remember(coverMemo, card.item.id, cover); // lets a rebuilt card show it before any lookup
    }
    const img = this.element("img");
    img.alt = "";
    img.draggable = false;
    img.addEventListener("load", () => {
      if (request.signal.aborted) return;
      if (img.naturalWidth && img.naturalHeight) {
        cover.ratio = `${img.naturalWidth} / ${img.naturalHeight}`;
        card.preview.style.setProperty("--sl-cover-ratio", cover.ratio);
      }
      img.classList.add("sl-loaded");
    });
    img.addEventListener("error", () => {
      forgetCover(card);
      img.remove();
      if (!request.signal.aborted) card.placeholder.textContent = tr(type) + " · " + tr("No preview");
    });
    img.src = cover.uri;
    card.cover.append(img);
    if (cover.pages) card.pages = cover.pages;
    this.updateCardProgress(card, request);
  },

  // A card rebuilt for something whose preview was already produced shows it right away, with the
  // right proportions, instead of a blank placeholder that changes shape once the image loads.
  showKnownCover(card) {
    const known = coverMemo.get(card.item.id);
    if (!known || card.cover.querySelector("img")) return;
    if (known.ratio) card.preview.style.setProperty("--sl-cover-ratio", known.ratio);
    const img = this.element("img");
    img.alt = "";
    img.draggable = false;
    img.classList.add("sl-loaded");
    img.addEventListener("error", () => { forgetCover(card); img.remove(); card.knownCover = false; });
    img.src = known.uri;
    card.cover.append(img);
    card.knownCover = true;
    if (known.pages) card.pages = known.pages;
    const attachment = known.attachmentID !== undefined ? Zotero.Items?.get?.(known.attachmentID) : null;
    if (attachment && !Array.isArray(attachment)) {
      card.attachment = attachment;
      this.updateCardProgress(card, undefined);
    }
  },

  updateCardProgress(card, request) {
    if (card.attachment.isPDFAttachment()) {
      this.setProgress(card, request).catch(error => Zotero.logError(error));
    }
  },

  refreshProgress() {
    for (const card of this.cards.values()) {
      if (card.visible && card.attachment?.isPDFAttachment()) this.setProgress(card, card.request).catch(error => Zotero.logError(error));
    }
  },

  async setProgress(card, request) {
    const pages = card.pages ?? (await Zotero.Fulltext.getPages(card.attachment.id))?.total;
    if (request?.signal.aborted || card.request !== request) return;
    if (pages > 0) card.pages = pages;
    const last = card.attachment.getAttachmentLastPageIndex();
    const page = Number.isInteger(last) && pages > 0 ? Math.min(pages, last + 1) : null;
    const progressKey = page === null ? null : page + "/" + pages;
    if (card.progressKey === progressKey) return;
    card.progressKey = progressKey;
    card.progress.replaceChildren();
    if (page === null) {
      card.progress.title = "";
      return;
    }
    const percent = Math.max(0, Math.round(100 * page / pages));
    const meter = this.element("progress");
    meter.max = 100;
    meter.value = percent;
    meter.setAttribute("aria-label", tr("Reading progress"));
    card.progress.title = page + " / " + pages + " " + tr("Pages");
    card.progress.append(meter, this.element("span", "", percent + "%"));
  }
});
