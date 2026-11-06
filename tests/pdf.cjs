const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");

const code = fs.readFileSync(path.join(__dirname, "..", "bootstrap.js"), "utf8");
const errors = [];
const context = vm.createContext({
  atob, setTimeout, clearTimeout,
  Zotero: {
    Prefs: { get: () => undefined },
    logError: error => errors.push(error)
  },
  DOMParser: class {
    parseFromString() {
      return { querySelectorAll: () => [
        { textContent: "other note text" },
        { textContent: '{"version":1,"order":["A","B","A",42],"description":"Spike sorting"}' }
      ] };
    }
  }
});
vm.runInContext(code, context);

function fixture() {
  const stream = "0 0 1 rg 10 10 100 100 re f\n";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <<>> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
    "<< /Length 8388608 >>\nstream\n" + "x".repeat(8 * 1024 * 1024) + "\nendstream"
  ];
  let pdf = "%PDF-1.7\n";
  const offsets = [];
  for (const [index, object] of objects.entries()) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const startxref = pdf.length;
  pdf += `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
}

async function run() {
  const order = ["A", "B", "C"];
  assert.equal(context.moveInOrder(order, "C", "A", true).join(","), "C,A,B");
  assert.equal(context.moveInOrder(order, "B", undefined, false).join(","), "A,C");
  assert.equal(context.moveInOrder(order, "D", undefined, true).join(","), "A,B,C,D");
  assert.equal(context.moveInOrder(order, "B", "B", true), order);
  const collection = { libraryID: 1, key: "COLLECT", getChildItems: () => [{
    isNote: () => true, hasTag: () => true, getNote: () => "<pre>fixture</pre>"
  }] };
  const legacy = context.readingData(collection);
  assert.equal(legacy.order.join(","), "A,B");
  assert.equal(legacy.description, "Spike sorting");
  context.Zotero.Prefs.get = () => '{"order":[],"description":"Edited"}';
  assert.equal(context.readingData(collection).description, "Edited");
  console.log("Reading order insertion, removal, reordering and legacy import passed");

  globalThis.DOMMatrix ??= class {};
  globalThis.Path2D ??= class {};
  globalThis.ImageData ??= class {};
  const modulePath = process.argv[2];
  if (!modulePath) throw new Error("Pass the extracted Zotero pdf.mjs with pdf.worker.mjs alongside it");
  const pdfjs = await import(pathToFileURL(path.resolve(modulePath)));
  const bytes = fixture();
  let read = 0;
  let destroyed = 0;
  let cancelled = 0;
  const canvas = {
    width: 0, height: 0,
    getContext: () => ({ getImageData: () => ({ data: new Uint8Array(100).fill(100) }) }),
    toDataURL: () => "data:image/jpeg;base64,AA=="
  };
  context.IOUtils = { async read(_path, { offset = 0, maxBytes }) {
    assert.ok(maxBytes > 0);
    const data = bytes.subarray(offset, offset + maxBytes);
    read += data.length;
    return data;
  } };
  const win = {
    Uint8Array,
    document: { createElementNS: () => canvas },
    ChromeUtils: { importESModule: () => ({
      ...pdfjs,
      getDocument(options) {
        const task = pdfjs.getDocument(options);
        return {
          promise: task.promise.then(pdf => ({
            numPages: pdf.numPages,
            getPage: async number => {
              const page = await pdf.getPage(number);
              return {
                getViewport: args => page.getViewport(args),
                render: () => ({
                  promise: page.getOperatorList().then(operators => assert.ok(operators.fnArray.length)),
                  cancel: () => { cancelled++; }
                })
              };
            }
          })),
          destroy: async () => { await task.destroy(); destroyed++; }
        };
      }
    }) }
  };
  const cover = await context.renderCover(win, "fixture.pdf", bytes.length, new AbortController().signal);
  assert.equal(cover.pages, 1);
  assert.equal(cover.bytes.length, 1);
  assert.ok(read < bytes.length / 8);
  assert.equal(canvas.width, 0);
  assert.equal(canvas.height, 0);
  assert.equal(destroyed, 1);
  assert.equal(cancelled, 1);
  console.log(`Bundled PDF.js parsed page 1 via bounded reads (${read} / ${bytes.length} bytes)`);

  const request = new AbortController();
  let taskDestroyed = false;
  let taskStarted;
  const started = new Promise(resolve => { taskStarted = resolve; });
  win.ChromeUtils.importESModule = () => ({
    ...pdfjs,
    getDocument() {
      taskStarted();
      return {
        promise: new Promise(() => {}),
        destroy: async () => { taskDestroyed = true; }
      };
    }
  });
  const pending = context.renderCover(win, "fixture.pdf", bytes.length, request.signal);
  await started;
  request.abort();
  await assert.rejects(pending, /no longer visible/);
  assert.equal(taskDestroyed, true);
  assert.equal(errors.length, 0);
  console.log("Cancelling a cover waited for PDF task destruction");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
