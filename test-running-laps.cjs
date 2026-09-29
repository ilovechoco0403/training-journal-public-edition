// Run: node test-running-laps.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const XLSX = require('./vendor/xlsx.full.min.js');
const element = {innerHTML:'',open:false,addEventListener(){}};
const context = {console, XLSX, setTimeout, clearTimeout,
  document:{querySelector:()=>element,querySelectorAll:()=>[],addEventListener(){}},
  window:{addEventListener(){}},navigator:{onLine:true},
  location:{search:'?qa=1',protocol:'http:'},
  localStorage:{getItem:()=>null},
};
vm.runInNewContext(fs.readFileSync('app.js','utf8'),context);
const q=context.window.__trainingQA;
const data=q.getData();
const template=data.templates.find(t=>t.type==='run');
const record={id:'test-run',date:'2026-09-28',title:'4k+3k+2k',type:'run',templateId:template.id,snapshot:template,tags:[],runClass:'變速跑',customPlan:{},status:'pending',result:null,createdAt:'2026-09-28T00:00:00Z'};
assert.equal(q.runModeFor(record),'laps');
assert.equal(q.runModeFor({...record,runClass:'間歇'}),'laps');
assert.equal(q.runModeFor({...record,runClass:'法克雷特'}),'whole');
record.result=q.emptyResult(record);
assert.equal(q.runModeFor(record),'whole','Old results keep whole-session mode');
q.validateData({...data,records:[record]});
record.result.runMode='laps';
record.result.laps=[
  {distance:4000,time:'20:00',pace:'5:00',recoveryDistance:200,recoveryTime:'2:00'},
  {distance:3000,time:'14:30',pace:'4:50',recoveryDistance:'',recoveryTime:'2:00'},
  {distance:2000,time:'',pace:'4:40',recoveryDistance:'',recoveryTime:''},
];
record.result.distance=12;
record.status='done';data.records.push(record);
q.validateData(data);
assert.equal(q.paceFrom(0.4,'1:40'),'4:10');
assert.throws(()=>q.validateLaps({laps:[{...record.result.laps[0],time:'1:99'}]}));
assert.throws(()=>q.validateLaps({laps:[{...record.result.laps[0],recoveryDistance:-1}]}));
assert.throws(()=>q.validateLaps({laps:[{...record.result.laps[0],pace:'abc'}]}));
const wb=q.workbookFor(data);
assert.ok(wb.SheetNames.includes('跑步逐組'));
const rows=XLSX.utils.sheet_to_json(wb.Sheets['跑步逐組'],{header:1});
assert.equal(rows.length,4);assert.equal(rows[1][5],4000);assert.equal(rows[2][8],'');
// Readable-sheet edits must not alter restoration from the backup sheet.
wb.Sheets['跑步逐組'].F2.v=999;
const bytes=XLSX.write(wb,{type:'buffer',bookType:'xlsx'});
const restored=q.decodeWorkbook(bytes);
assert.equal(JSON.stringify(restored),JSON.stringify(data));
assert.equal(restored.records[0].result.distance,12,'Total distance stays independent');
record.result.runMode='whole';
q.validateData(data);
assert.equal(record.result.laps.length,3,'Whole mode can preserve laps');
assert.equal(q.storageKey,'runner-public-journal:v1');
console.log('PASS: modes, legacy data, optional recovery, pace, invalid inputs, XLSX binary round trip, independent totals.');
