// SPDX-License-Identifier: AGPL-3.0-only
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const prefs = new Map();
const columns = [], menus = [], removed = [], observers = [];
const ctx = vm.createContext({
  APP_SHUTDOWN: 2,
  Zotero: {
    ItemTreeManager: {
      registerColumn(options) { columns.push(options); return 'status-column'; },
      unregisterColumn(key) { removed.push(key); }, refreshColumns() {}
    },
    MenuManager: {
      registerMenu(options) { menus.push(options); return 'status-menu'; },
      unregisterMenu(key) { removed.push(key); }
    },
    PreferencePanes: { register: async () => {} },
    Prefs: { get: key => prefs.get(key), set: (key, value) => prefs.set(key, value),
      registerObserver: key => { observers.push(key); return key; }, unregisterObserver() {} },
    Notifier: { registerObserver: () => 1, unregisterObserver() {} },
    uiReadyPromise: new Promise(() => {}),
    logError: error => { throw error; }
  }
});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../bootstrap.js'), 'utf8'),ctx);
(async () => {
  await ctx.startup({id:'syllabus-lite@local.zotero',rootURI:'fixture/'});
  assert.equal(columns.length,1);
  assert.equal(menus[0].target,'main/library/item');
  assert.ok(observers.includes('extensions.syllabus-lite.hideChildIndicator'));
  const a={libraryID:1,key:'A'},b={libraryID:1,key:'B'};
  const submenu=menus[0].menus[0];
  const labels=[];
  const context={items:[a,b], menuElem:{setAttribute:(key,value)=>labels.push([key,value])},setEnabled(){}};
  const reading=submenu.menus[2];
  reading.onShowing(null,context);
  assert.ok(labels.some(([key,value])=>key==='label'&&value==='읽는 중'));
  reading.onCommand(null,context);
  assert.equal(columns[0].dataProvider(a),'reading');
  assert.equal(columns[0].dataProvider(b),'reading');
  submenu.menus[0].onCommand(null,context);
  assert.equal(columns[0].dataProvider(a),'');
  const doc={createElementNS:()=>({append(node){this.child=node;}})};
  const cell=columns[0].renderCell(0,'reading',{className:'cell'},false,doc);
  assert.equal(cell.child.textContent,'읽는 중');
  ctx.shutdown({},1);
  assert.deepEqual(removed,['status-column','status-menu']);
  console.log('Native status column/menu registration, bulk status changes and unload cleanup passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
