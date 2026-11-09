// SPDX-License-Identifier: AGPL-3.0-only
function drainCoverLookups() {
  while (activeLookups < MAX_COVER_LOOKUPS && lookupQueue.size) {
    const [request, work] = lookupQueue.entries().next().value;
    lookupQueue.delete(request);
    if (request.signal.aborted) continue;
    activeLookups++;
    work().finally(() => {
      activeLookups--;
      drainCoverLookups();
    });
  }
}

async function drainCovers() {
  if (renderingCover) return;
  renderingCover = true;
  try {
    while (coverQueue.size) {
      const [request, work] = coverQueue.entries().next().value;
      coverQueue.delete(request);
      try {
        await work();
      } catch (error) {
        if (!request.signal.aborted) Zotero.logError(error);
      }
    }
  } finally {
    renderingCover = false;
  }
}

async function primaryAttachment(item) {
  if (item.isAttachment()) return item;
  const attachments = await item.getBestAttachments();
  const rank = attachment => {
    if (attachment.isPDFAttachment()) return 0;
    if (attachment.isEPUBAttachment()) return 1;
    return attachment.attachmentContentType === "text/html" ? 3 : 2;
  };
  attachments.sort((a, b) => rank(a) - rank(b));
  for (const attachment of attachments) {
    if (await attachment.getFilePathAsync()) return attachment;
  }
  return attachments[0] ?? Zotero.Items.get(item.getAttachments())[0];
}

function attachmentLabel(attachment) {
  if (!attachment.isFileAttachment()) return "Web link";
  if (attachment.isPDFAttachment()) return "PDF";
  if (attachment.isEPUBAttachment()) return "EPUB";
  const type = attachment.attachmentContentType || "";
  if (type.startsWith("image/")) return "Image";
  if (type === "text/html") return "Web snapshot";
  const filename = attachment.attachmentFilename || "";
  const extension = filename.split(".").pop();
  return filename.includes(".") && /^[a-z0-9]{1,8}$/i.test(extension) ? extension.toUpperCase() : "File";
}

async function coverSource(attachment, signal) {
  const path = await attachment.getFilePathAsync();
  if (!path || signal.aborted) return null;
  const stat = await IOUtils.stat(path);
  const dir = PathUtils.join(Zotero.DataDirectory.dir, "reading-shelf-thumbnails");
  const cacheKey = [attachment.libraryID, attachment.key, stat.size, stat.lastModified].join("-");
  const image = PathUtils.join(dir, cacheKey + ".jpg");
  const info = PathUtils.join(dir, cacheKey + ".json");
  return { path, stat, dir, image, info };
}

async function readCachedCover({ image, info }) {
  if (await IOUtils.exists(image)) {
    try {
      const { pages } = await IOUtils.readJSON(info);
      if (pages === null || (Number.isInteger(pages) && pages > 0)) {
        return { uri: Zotero.File.pathToFileURI(image), pages };
      }
    } catch {
      // A damaged cache entry can be regenerated from the attachment.
    }
  }
  return null;
}

async function generateCover(win, attachment, { path, stat, dir, image, info }, signal) {
  let result;
  if (attachment.isPDFAttachment()) {
    try {
      result = await renderCover(win, path, stat.size, signal);
    } catch (error) {
      if (!signal.aborted) Zotero.debug("Reading Shelf PDF preview: " + error);
    }
  } else {
    try {
      const bytes = attachment.isEPUBAttachment() ? epubCoverBytes(path)
        : attachment.attachmentContentType?.startsWith("image/") && stat.size <= 12 * 1024 * 1024
          ? await IOUtils.read(path) : null;
      if (bytes && !signal.aborted) result = await rasterCover(win, bytes);
    } catch (error) {
      if (!signal.aborted) Zotero.debug("Reading Shelf image preview: " + error);
    }
  }
  if (!result && !signal.aborted && Zotero.isMac) {
    result = await systemCover(win, path, dir, attachment.isPDFAttachment(), signal);
  }
  if (!result || signal.aborted) return null;

  await IOUtils.makeDirectory(dir, { ignoreExisting: true });
  await IOUtils.write(image, result.bytes, { tmpPath: image + ".tmp" });
  const pages = result.pages ?? null;
  await IOUtils.writeJSON(info, { pages }, { tmpPath: info + ".tmp" });
  return { uri: Zotero.File.pathToFileURI(image), pages };
}

function coverDimensions(width, height) {
  const scale = Math.min(240 / width, 360 / height);
  return [Math.max(1, Math.ceil(width * scale)), Math.max(1, Math.ceil(height * scale))];
}

function canvasBytes(canvas) {
  const encoded = canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
  return Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
}

function isBlank(context, width, height) {
  const pixels = context.getImageData(0, 0, width, height).data;
  let marks = 0;
  const minimum = Math.max(3, width * height / 5000);
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] > 16 && Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 242) {
      if (++marks >= minimum) return false;
    }
  }
  return true;
}

async function rasterCover(win, bytes, rejectBlank = false) {
  const bitmap = await win.createImageBitmap(new win.Blob([bytes]));
  let canvas;
  try {
    canvas = win.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    [canvas.width, canvas.height] = coverDimensions(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (rejectBlank && isBlank(context, canvas.width, canvas.height)) return null;
    return { bytes: canvasBytes(canvas) };
  } finally {
    bitmap.close();
    if (canvas) canvas.width = canvas.height = 0;
  }
}

function epubCoverBytes(path) {
  const zip = Components.classes["@mozilla.org/libjar/zip-reader;1"]
    .createInstance(Components.interfaces.nsIZipReader);
  zip.open(Zotero.File.pathToFile(path));
  try {
    const read = (entry, limit) => {
      if (!zip.hasEntry(entry)) return null;
      const size = zip.getEntry(entry).realSize;
      if (!size || size > limit) return null;
      const stream = Components.classes["@mozilla.org/binaryinputstream;1"]
        .createInstance(Components.interfaces.nsIBinaryInputStream);
      stream.setInputStream(zip.getInputStream(entry));
      try {
        return Uint8Array.from(stream.readByteArray(size));
      } finally {
        stream.close();
      }
    };
    const parse = entry => {
      const bytes = read(entry, 2 * 1024 * 1024);
      if (!bytes) return null;
      const xml = new TextDecoder().decode(bytes);
      if (/<!DOCTYPE/i.test(xml)) return null;
      return new DOMParser().parseFromString(xml, "application/xml");
    };
    const container = parse("META-INF/container.xml");
    const packagePath = container?.getElementsByTagNameNS("*", "rootfile")[0]?.getAttribute("full-path");
    if (!packagePath) return null;
    const doc = parse(packagePath);
    if (!doc) return null;
    const coverID = Array.from(doc.getElementsByTagNameNS("*", "meta"))
      .find(meta => meta.getAttribute("name") === "cover")?.getAttribute("content");
    const items = Array.from(doc.getElementsByTagNameNS("*", "item"));
    const cover = items.find(item => item.getAttribute("properties")?.split(/\s+/).includes("cover-image"))
      ?? items.find(item => coverID && item.getAttribute("id") === coverID);
    const href = cover?.getAttribute("href");
    if (!href) return null;
    const slash = packagePath.lastIndexOf("/");
    const base = new URL("https://epub.invalid/" + packagePath.slice(0, slash + 1));
    const imageURL = new URL(href, base);
    if (imageURL.origin !== base.origin) return null;
    return read(decodeURIComponent(imageURL.pathname.slice(1)), 12 * 1024 * 1024);
  } finally {
    zip.close();
  }
}

async function runPreviewCommand(command, args, signal) {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  if (signal.aborted) return false;
  const process = await Subprocess.call({ command, arguments: args });
  const stop = () => { process.kill(0).catch(error => Zotero.debug(String(error))); };
  signal.addEventListener("abort", stop, { once: true });
  if (signal.aborted) stop();
  const timer = setTimeout(stop, 10000);
  try {
    const { exitCode } = await process.wait();
    return exitCode === 0 && !signal.aborted;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", stop);
  }
}

async function systemCover(win, path, cacheDir, isPDF, signal) {
  const temp = PathUtils.join(cacheDir, ".preview-" + crypto.randomUUID());
  await IOUtils.makeDirectory(temp, { createAncestors: true });
  try {
    if (isPDF) {
      // GUI apps do not necessarily inherit the user's Homebrew PATH.
      for (const executable of ["/opt/homebrew/bin/pdftoppm", "/usr/local/bin/pdftoppm", "/opt/local/bin/pdftoppm"]) {
        if (signal.aborted) return null;
        if (!await IOUtils.exists(executable)) continue;
        const prefix = PathUtils.join(temp, "cover");
        const ok = await runPreviewCommand(executable, [
          "-cropbox", "-f", "1", "-l", "1", "-singlefile", "-scale-to", "360", "-jpeg", path, prefix
        ], signal);
        const output = prefix + ".jpg";
        if (ok && await IOUtils.exists(output)) {
          const cover = await rasterCover(win, await IOUtils.read(output, { maxBytes: 2 * 1024 * 1024 }), true);
          if (cover) return cover;
        }
        break;
      }
    }
    if (signal.aborted) return null;
    if (await runPreviewCommand("/usr/bin/qlmanage", ["-t", "-s", "360", "-o", temp, path], signal)) {
      const png = (await IOUtils.getChildren(temp)).find(file => file.endsWith(".png"));
      if (png) return await rasterCover(win, await IOUtils.read(png, { maxBytes: 2 * 1024 * 1024 }), isPDF);
    }
    return null;
  } catch (error) {
    if (!signal.aborted) Zotero.debug("Reading Shelf system preview: " + error);
    return null;
  } finally {
    await IOUtils.remove(temp, { recursive: true, ignoreAbsent: true });
  }
}

async function renderCover(win, path, size, signal) {
  const pdfjs = win.ChromeUtils.importESModule(PDF_BASE + "build/pdf.mjs", { global: "current" });
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = PDF_BASE + "build/pdf.worker.mjs";
  }
  const chunk = 64 * 1024;
  const initial = await IOUtils.read(path, size > 512 * 1024 ? { maxBytes: chunk } : {});
  if (signal.aborted) return null;
  const viewerBytes = bytes => {
    const result = new win.Uint8Array(bytes.byteLength);
    result.set(bytes);
    return result;
  };
  let stopped = false;
  let fail;
  const interrupted = new Promise((_resolve, reject) => { fail = reject; });
  const abort = () => fail(new Error("Cover no longer visible"));
  signal.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => fail(new Error("PDF cover timed out")), 12000);
  const options = {
    verbosity: 0,
    cMapUrl: PDF_BASE + "web/cmaps/",
    standardFontDataUrl: PDF_BASE + "web/standard_fonts/",
    wasmUrl: PDF_BASE + "web/wasm/",
    useWorkerFetch: false
  };
  let task;
  let painting;
  let canvas;
  try {
    if (initial.byteLength < size) {
      const range = new pdfjs.PDFDataRangeTransport(size, viewerBytes(initial), true);
      range.requestDataRange = (begin, end) => {
        if (stopped) return;
        IOUtils.read(path, { offset: begin, maxBytes: end - begin }).then(bytes => {
          if (stopped) return;
          if (bytes.byteLength !== end - begin) throw new Error("PDF changed while generating the cover");
          range.onDataRange(begin, viewerBytes(bytes));
        }).catch(fail);
      };
      Object.assign(options, { range, rangeChunkSize: chunk, disableAutoFetch: true, disableStream: true });
    } else {
      options.data = viewerBytes(initial);
    }
    task = pdfjs.getDocument(options);
    const pdf = await Promise.race([task.promise, interrupted]);
    for (let number = 1; number <= Math.min(3, pdf.numPages); number++) {
      const page = await Promise.race([pdf.getPage(number), interrupted]);
      const dimensions = page.getViewport({ scale: 1 });
      const [width, height] = coverDimensions(dimensions.width, dimensions.height);
      const viewport = page.getViewport({ scale: Math.min(width / dimensions.width, height / dimensions.height) });
      canvas ??= win.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      painting = page.render({ canvasContext: context, viewport });
      await Promise.race([painting.promise, interrupted]);
      if (!isBlank(context, width, height)) {
        return { bytes: canvasBytes(canvas), pages: pdf.numPages };
      }
    }
    return null;
  } finally {
    stopped = true;
    clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
    painting?.cancel();
    if (canvas) canvas.width = canvas.height = 0;
    try {
      if (task) await task.destroy();
    } catch (error) {
      if (!signal.aborted) Zotero.logError(error);
    }
  }
}
