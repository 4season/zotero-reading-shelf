// SPDX-License-Identifier: AGPL-3.0-only
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const prefs = new Map();
const columns = [], menus = [], removed = [], observers = [], infoRows = [];
let readerHook, notifier, preferencesPane;
const ctx = vm.createContext({
  APP_SHUTDOWN: 2,
  Services: { prefs: { getBranch: () => ({ getChildList: () => [] }), prefHasUserValue: () => false } },
  Zotero: {
    Reader: { registerEventListener(_type, fn) { readerHook = fn; }, unregisterEventListener() {} },
    ItemPaneManager: { registerInfoRow(options) { infoRows.push(options); return "workflow-info"; }, refreshInfoRow() {}, unregisterInfoRow(key) { removed.push(key); } },
    ItemTreeManager: {
      registerColumn(options) { columns.push(options); return 'status-column'; },
      unregisterColumn(key) { removed.push(key); }, refreshColumns() {}
    },
    MenuManager: {
      registerMenu(options) { menus.push(options); return 'status-menu'; },
      unregisterMenu(key) { removed.push(key); }
    },
    PreferencePanes: { register: async options => {preferencesPane=options;} },
    Prefs: { get: key => prefs.get(key), set: (key, value) => prefs.set(key, value),
      registerObserver: key => { observers.push(key); return key; }, unregisterObserver() {} },
    Notifier: { registerObserver: observer => {notifier=observer;return 1;}, unregisterObserver() {} },
    uiReadyPromise: new Promise(() => {}),
    logError: error => { throw error; }
  }
});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../bootstrap.js'), 'utf8'),ctx);
(async () => {
  await ctx.startup({id:'reading-shelf@4season.github.io',rootURI:'fixture/',version:'1.2.1'});
  assert.equal(columns.length,1);
  // Settings saved under the old "syllabus-lite" name are copied once, without overwriting new values.
  {
    const old = new Map([["language","en"],["order.1.ABCDE",'{"order":["A"],"description":""}'],["cardScale",120],["matrixMode",true],["hideSortControl",false]]);
    const fresh = new Map([["extensions.reading-shelf.language","ko"]]);
    const branch = { PREF_BOOL: 128, PREF_INT: 64, PREF_STRING: 32,
      getChildList: () => [...old.keys(), "defaultOnly"], prefHasUserValue: name => old.has(name),
      getPrefType: name => typeof old.get(name) === "boolean" ? 128 : typeof old.get(name) === "number" ? 64 : 32,
      getBoolPref: name => old.get(name), getIntPref: name => old.get(name), getStringPref: name => old.get(name) };
    const emptyServices = ctx.Services;
    ctx.Services = { prefs: { getBranch: prefix => { assert.equal(prefix, "extensions.syllabus-lite."); return branch; }, prefHasUserValue: name => fresh.has(name) } };
    const real = new Map(prefs); prefs.clear(); fresh.forEach((v, k) => prefs.set(k, v));
    ctx.migratePreferences();
    assert.equal(prefs.get("extensions.reading-shelf.language"), "ko");
    assert.equal(prefs.get("extensions.reading-shelf.cardScale"), 120);
    assert.equal(prefs.get("extensions.reading-shelf.matrixMode"), true);
    assert.equal(prefs.get("extensions.reading-shelf.hideSortControl"), false);
    assert.equal(prefs.get("extensions.reading-shelf.order.1.ABCDE"), '{"order":["A"],"description":""}');
    assert.equal(prefs.has("extensions.reading-shelf.defaultOnly"), false);
    old.set("cardScale", 80); prefs.set("extensions.reading-shelf.cardScale", 120);
    ctx.migratePreferences();
    assert.equal(prefs.get("extensions.reading-shelf.cardScale"), 120);
    prefs.clear(); real.forEach((v, k) => prefs.set(k, v));
    ctx.Services = emptyServices;
  }
  assert.equal(preferencesPane.stylesheets[0],"settings.css?v=1.2.1");
  assert.equal(menus[0].target,'main/library/item');
  assert.ok(observers.includes('extensions.reading-shelf.hideChildIndicator'));
  const a={libraryID:1,key:'A'},b={libraryID:1,key:'B'};
  const submenu=menus[0].menus[0];
  const labels=[];
  const context={items:[a,b], menuElem:{setAttribute:(key,value)=>labels.push([key,value])},setEnabled(){}};
  const reading=submenu.menus[2];
  reading.onShowing(null,context);
  assert.ok(labels.some(([key,value])=>key==='label'&&value==='읽는 중'));
  reading.onCommand(null,context);
  assert.equal(columns[0].dataProvider(a),'reading||');
  assert.equal(columns[0].dataProvider(b),'reading||');
  submenu.menus[0].onCommand(null,context);
  assert.equal(columns[0].dataProvider(a),'||');
  const doc={createElementNS:()=>({style:{setProperty(){}},dataset:{},children:[], handlers:{}, attrs:{}, append(...nodes){this.children.push(...nodes);},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.handlers[k]=fn;}})};
  const tree={getRow:()=>({ref:a})};
  doc.defaultView={ZoteroPane:{itemsView:tree}};
  const cell=columns[0].renderCell(0,'reading||',{className:'cell'},false,doc);
  assert.equal(cell.children[0].children[0].textContent,'읽는 중');
  const select=cell.children[0].children[1];
  select.value='planned'; select.handlers.change();
  assert.equal(ctx.tableStatus(a),'planned');
  cell.children[1].handlers.click({stopPropagation(){}});
  assert.equal(ctx.importantOf(a),true);
  cell.children[2].handlers.click({stopPropagation(){}});
  assert.equal(ctx.urgentOf(a),true);
  const updated=columns[0].renderCell(0,columns[0].dataProvider(a),{},false,doc);
  assert.equal(updated.children[1].attrs['aria-pressed'],'true');
  assert.equal(updated.children[2].attrs['aria-pressed'],'true');
  // Handler resolves the clicked row, independent of the current selection.
  tree.getRow=()=>({ref:b});
  const other=columns[0].renderCell(1,'||',{},false,doc);
  assert.equal(other.children[0].dataset.empty,'true');
  assert.equal(other.children[0].dataset.hideEmpty,'true');
  assert.equal(other.children[1].dataset.hideEmpty,'true');
  assert.equal(other.children[2].dataset.hideEmpty,'true');
  assert.equal(other.children[1].textContent,'☆');
  assert.equal(other.children[2].textContent,'○');
  assert.equal(updated.children[1].textContent,'★');
  assert.equal(updated.children[2].textContent,'◷');
  other.children[0].children[1].value='reading';
  other.children[0].children[1].handlers.change();
  assert.equal(ctx.tableStatus(b),'reading');
  assert.equal(ctx.tableStatus(a),'planned');
  const parent = {libraryID:1,key:'PARENT',id:44};
  const child = {libraryID:1,key:'CHILD',id:45,parentItemID:44,isAttachment:()=>true};
  ctx.Zotero.Items = {get:id=>id===44?parent:child};
  ctx.setPriority([parent], 'important', true);
  ctx.setPriority([parent], 'urgent', true);
  readerHook({reader:{itemID:45,tabID:'reader-1'}});
  assert.equal(ctx.tableStatus(child), 'reading');
  assert.equal(ctx.tableStatus(parent), 'reading');
  prefs.set('extensions.reading-shelf.clearStatusOnClose',true);
  readerHook({reader:{itemID:45,tabID:'reader-2'}});
  notifier.notify('close','tab',[['reader-1']]);
  assert.equal(ctx.tableStatus(parent),'reading');
  notifier.notify('close','tab',[['reader-2']]);
  assert.equal(ctx.tableStatus(parent),'');
  assert.equal(ctx.importantOf(parent),true);
  assert.equal(ctx.urgentOf(parent),true);
  prefs.set('extensions.reading-shelf.clearStatusOnClose',false);
  readerHook({reader:{itemID:45,tabID:'reader-3'}});
  notifier.notify('close','tab',['reader-3']);
  assert.equal(ctx.tableStatus(parent),'reading');
  assert.equal(ctx.importantOf(parent), true);
  assert.equal(ctx.urgentOf(parent), true);
  assert.match(infoRows[0].onGetData({item:child}), /읽는 중.*중요.*긴급/);
  prefs.set('extensions.reading-shelf.status.1.A','important');
  ctx.setItemStatus([a],'reading');
  assert.equal(ctx.importantOf(a),true);
  assert.equal(ctx.tableStatus(a),'reading');
  ctx.setPriority([a],'important',false);
  assert.equal(ctx.importantOf(a),false);
  assert.equal(ctx.tableStatus(a),'reading');
  prefs.set('extensions.reading-shelf.status.1.B','important');
  ctx.setPriority([b],'important',false);
  assert.equal(ctx.importantOf(b),false);
  assert.equal(ctx.tableStatus(b),'planned');
  const c1={id:1,libraryID:1,key:'C1'},c2={id:2,libraryID:1,key:'C2'};
  prefs.set('extensions.reading-shelf.matrixMode',false);
  prefs.set('extensions.reading-shelf.rememberCollectionMode',true);
  prefs.set(ctx.collectionModeKey(c1),true);
  assert.equal(ctx.matrixModeFor(c1),true);
  assert.equal(ctx.matrixModeFor(c2),false);
  // Saved per-collection choices are independent of each other and of the global default.
  prefs.set(ctx.collectionModeKey(c2),false);
  prefs.set('extensions.reading-shelf.matrixMode',true);
  assert.equal(ctx.matrixModeFor(c1),true);
  assert.equal(ctx.matrixModeFor(c2),false);
  prefs.set('extensions.reading-shelf.matrixMode',false);
  assert.equal(ctx.matrixModeFor(c1),true);
  prefs.set('extensions.reading-shelf.rememberCollectionMode',false);
  assert.equal(ctx.matrixModeFor(c1),false);
  prefs.set('extensions.reading-shelf.language','en');
  assert.equal(ctx.tr('Reading'),'Reading');
  assert.match(infoRows[0].onGetData({item:parent}), /Reading.*Important.*Urgent/);
  let cacheClears=0, redraws=0, layouts=0;
  ctx.fixtureView={pane:{itemsView:{invalidateRowCache:value=>{assert.equal(value,true);cacheClears++;},tree:{invalidate:()=>redraws++}}},cards:new Map(),gallery:{},matrix:true,animateLayout(){layouts++;},dispose(){}};
  vm.runInContext('windows.set("fixture", fixtureView)',ctx);
  ctx.setItemStatus([a],'planned');
  assert.ok(cacheClears>0 && redraws>0);
  assert.equal(layouts,0); // Reading state changes do not reflow independent matrix lanes.
  ctx.setPriority([a],'urgent',true);
  assert.equal(layouts,1);
  vm.runInContext('windows.clear()',ctx);
  console.log('Parent/file consistency, reader opening, independent priority migration, localization and native cache invalidation passed');
  ctx.shutdown({},1);
  assert.deepEqual(removed,['workflow-info','status-column','status-menu']);
  console.log('Native status column/menu registration, bulk status changes and unload cleanup passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
