// Create a new Google Sheet and open Extensions > Apps Script.
// Paste this source and run setup() once to authorize.
const SHEET_NAME = 'RSVP';
function getSheet() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sh=ss.getSheetByName(SHEET_NAME);
  if(!sh){sh=ss.insertSheet(SHEET_NAME);sh.appendRow(['Timestamp','Submission ID','Full Name','Attendance','Number of Guests','Wishes & Messages']);sh.setFrozenRows(1);}
  return sh;
}
function setup(){getSheet();}
function cell(value){
  let v=String(value??'').trim().slice(0,2000);
  if(/^[\s]*[=+\-@]/.test(v))v="'"+v;
  return v;
}
function doPost(e){
  const p=e.parameter||{},id=String(p.id||'').trim(),name=String(p.name||'').trim(),attendance=String(p.attendance||''),guests=Number(p.guests),message=String(p.message||'').trim();
  if(p.website)return respond({ok:true});
  if(!/^[a-zA-Z0-9-]{8,80}$/.test(id)||name.length<2||name.length>120||!['Attending','Not Attending'].includes(attendance)||!Number.isInteger(guests)||guests<0||guests>5||(attendance==='Attending'&&guests<1)||(attendance==='Not Attending'&&guests!==0)||message.length>1000)return respond({ok:false,error:'Invalid data'});
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const sh=getSheet(),last=sh.getLastRow();
    if(last>1&&sh.getRange(2,2,last-1,1).createTextFinder(id).matchEntireCell(true).findNext())return respond({ok:true,id});
    sh.appendRow([new Date(),id,cell(name),attendance,guests,cell(message)]);
    SpreadsheetApp.flush();
    return respond({ok:true,id});
  }finally{lock.releaseLock()}
}
function doGet(e){
  const p=e.parameter||{},sh=getSheet(),last=sh.getLastRow();
  const rows=last>1?sh.getRange(2,1,last-1,6).getValues():[];
  if(p.action==='status')return jsonp({ok:true,found:rows.some(r=>String(r[1])===String(p.id))},p.callback);
  if(p.action!=='wishes')return jsonp({ok:false,error:'Unknown action'},p.callback);
  const wishes=rows.filter(r=>String(r[5]).trim()).slice(-100).reverse().map(r=>({name:String(r[2]),message:String(r[5])}));
  return jsonp({ok:true,wishes},p.callback);
}
function respond(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)}
function jsonp(data,callback){
  const name=String(callback||'');
  if(!/^[A-Za-z_$][\w$]{0,99}$/.test(name))return respond({ok:false,error:'Invalid callback'});
  const payload=JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(name+'('+payload+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}