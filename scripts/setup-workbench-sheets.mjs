import 'dotenv/config';
import {createSheetsStore,TAB,HEADERS} from '../server/workbench/sheets-store.mjs';

// Run once with the same server credentials and encryption key used on Railway.
// Never overwrite an existing tab or populate application test records here.
try {
 const store=await createSheetsStore(),api=store.client.spreadsheets;
 const spreadsheetId=store.spreadsheetId;
 const meta=await api.get({spreadsheetId,fields:'sheets.properties'}, {timeout:20000,retry:false});
 const existing=meta.data.sheets?.find(s=>s.properties?.title===TAB)?.properties;
 if(existing){
  await store.read();
  if((existing.gridProperties?.columnCount||0)<102||(existing.gridProperties?.rowCount||0)<5002)throw Error('Storage grid is smaller than required. Expand it without altering existing records.');
  console.log('Sheets workbench storage verified. Existing records preserved.');
 }else{
  const used=new Set(meta.data.sheets?.map(s=>s.properties?.sheetId));let sheetId=1;while(used.has(sheetId))sheetId++;
  await api.batchUpdate({spreadsheetId,requestBody:{requests:[
   {addSheet:{properties:{sheetId,title:TAB,gridProperties:{rowCount:5002,columnCount:102,frozenRowCount:1}}}},
   {updateCells:{range:{sheetId,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:3},rows:[{values:HEADERS.map(stringValue=>({userEnteredValue:{stringValue},note:'Application storage: do not edit, sort, delete, or insert rows.'}))}],fields:'userEnteredValue,note'}},
   {addProtectedRange:{protectedRange:{range:{sheetId},warningOnly:true,description:'Application records. Use the workbench to edit assessments.'}}}
  ]}}, {timeout:20000,retry:false});
  await store.read();console.log('Sheets workbench storage initialized.');
 }
}catch{console.error('Sheets setup failed. Verify the spreadsheet ID, service-account editor access, storage key, and tab integrity. No credentials have been logged.');process.exitCode=1;}
