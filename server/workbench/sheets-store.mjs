import { randomUUID, randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto';
import { storageError } from './storage.mjs';

export const TAB='BI Web Records';
export const HEADERS=['Event ID','Encrypted index','Encrypted payload chunks'];
const RANGE=`'${TAB}'`;
const CHUNK=40000, MAX_CHUNKS=100, MAX_EVENTS=5000;
const requestOptions={timeout:20000,retry:false};
const digest=s=>createHash('sha256').update(s).digest('hex');

// Each append is one complete record. No read/find-empty-row/update operation.
// Replaying append order accepts only the first event matching the current version.
// This makes concurrent saves deterministic across server instances.
export class SheetsStore {
 constructor(client,spreadsheetId,key){this.client=client;this.spreadsheetId=spreadsheetId;this.key=key;if(key.length!==32)throw storageError('Invalid storage key',503);}
 seal(value){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',this.key,iv);c.setAAD(Buffer.from(this.spreadsheetId+':'+TAB));const body=Buffer.concat([c.update(JSON.stringify(value)),c.final()]);return Buffer.concat([iv,c.getAuthTag(),body]).toString('base64');}
 unseal(value){const b=Buffer.from(value,'base64'),d=createDecipheriv('aes-256-gcm',this.key,b.subarray(0,12));d.setAAD(Buffer.from(this.spreadsheetId+':'+TAB));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString());}
 async read(){
  const r=await this.client.spreadsheets.values.get({spreadsheetId:this.spreadsheetId,range:`${RANGE}!A1:B${MAX_EVENTS+2}`,valueRenderOption:'UNFORMATTED_VALUE'},requestOptions);
  const rows=r.data.values||[];
  if(rows[0]?.[0]!==HEADERS[0]||rows[0]?.[1]!==HEADERS[1])throw storageError('Workbench storage tab is not initialized. Run the Sheets setup script.',503);
  if(rows.length>MAX_EVENTS+1)throw storageError('Interim storage capacity exceeded. Contact the administrator.',503);
  const state={assessments:new Map(),documents:new Map(),accepted:new Set(),count:rows.length-1};
  const seen=new Set();
  for(let i=1;i<rows.length;i++){
   const [eventId,encrypted]=rows[i];
   if(!eventId||!encrypted)throw storageError('Workbench storage has an incomplete row. Administrator recovery is required.',503);
   const e=this.unseal(encrypted);if(e.eventId!==eventId||e.schema!==1)throw storageError('Storage integrity check failed',503);
   if(seen.has(eventId))continue;seen.add(eventId);e.row=i+1;
   if(!['save','access','document'].includes(e.type))throw storageError('Unsupported storage record',503);
   let a=state.assessments.get(e.assessment);
   if(e.type==='save'){
    if(e.isNew){if(a||e.expectedVersion!==0||e.actor!==e.owner)continue;a={owner:e.owner,versions:[],access:new Map()};state.assessments.set(e.assessment,a);}
    if(!a||a.owner!==e.owner||a.versions.length!==e.expectedVersion||!(a.owner===e.actor||a.access.has(e.actor))||(e.status==='reviewed'&&a.owner!==e.actor))continue;
    a.versions.push(e);
   }else if(e.type==='access'){
    if(!a||a.owner!==e.actor)continue;
    if(e.revoke)a.access.delete(e.email);else a.access.set(e.email,{email:e.email,granted_by:e.actor,created_at:e.createdAt});
   }else{
    if(!a||!(a.owner===e.actor||a.access.has(e.actor))||state.documents.has(e.document))continue;
    if([...state.documents.values()].filter(d=>d.assessment===e.assessment).length>=50)continue;
    state.documents.set(e.document,e);
   }
   state.accepted.add(eventId);
  }
  return state;
 }
 allowed(a,email){return a&&(a.owner===email||a.access.has(email));}
 async owner(id,email){const a=(await this.read()).assessments.get(id);if(!this.allowed(a,email))throw storageError('Assessment not found',404);return a.owner;}
 async access(id){return [...((await this.read()).assessments.get(id)?.access.values()||[])];}
 async append(event,payload=''){
  if((await this.read()).count>=MAX_EVENTS)throw storageError('Interim storage is full. Contact the administrator.',503);
  const chunks=payload.match(new RegExp(`.{1,${CHUNK}}`,'g'))||[];
  if(chunks.length>MAX_CHUNKS)throw storageError('Record exceeds interim storage capacity',413);
  const e={...event,schema:1,eventId:randomUUID(),createdAt:new Date().toISOString(),chunks:chunks.length,hash:digest(payload)};
  try{
   await this.client.spreadsheets.values.append({spreadsheetId:this.spreadsheetId,range:`${RANGE}!A1:CX${MAX_EVENTS+2}`,valueInputOption:'RAW',insertDataOption:'INSERT_ROWS',requestBody:{values:[[e.eventId,this.seal(e),...chunks]]}},requestOptions);
  }catch{
   // A network timeout can happen after commit. Read back the exact event before
   // deciding whether it succeeded; never blindly retry an append.
   const state=await this.read();if(state.accepted.has(e.eventId))return;
   throw storageError('Save could not be confirmed. Reopen the assessment before retrying.',503);
  }
  const state=await this.read();
  if(!state.accepted.has(e.eventId))throw storageError('A newer version or access change exists. Reopen the assessment before saving.',409);
 }
 async setAccess(id,email,actor,revoke){await this.append({type:'access',assessment:id,email,actor,revoke:!!revoke});}
 async payload(e){
  const r=await this.client.spreadsheets.values.get({spreadsheetId:this.spreadsheetId,range:`${RANGE}!A${e.row}:CX${e.row}`,valueRenderOption:'UNFORMATTED_VALUE'},requestOptions);
  const row=r.data.values?.[0]||[];
  if(row[0]!==e.eventId)throw storageError('Storage changed during read. Retry.',503);
  const payload=row.slice(2).join('');if(row.slice(2).length!==e.chunks||digest(payload)!==e.hash)throw storageError('Storage payload integrity check failed',503);return payload;
 }
 async list(email){const s=await this.read(),rows=[];for(const [id,a] of s.assessments){if(this.allowed(a,email)){const e=a.versions.at(-1);rows.push({id,current_version:a.versions.length,status:e.status,created_at:e.createdAt,event:e});}}
  // Fetch current snapshots in one bounded API request.
  rows.sort((a,b)=>b.created_at.localeCompare(a.created_at));if(rows.length>200)throw storageError('More than 200 assessments: migrate interim storage before continuing.',503);
  if(!rows.length)return [];
  const r=await this.client.spreadsheets.values.batchGet({spreadsheetId:this.spreadsheetId,ranges:rows.map(r=>`${RANGE}!A${r.event.row}:CX${r.event.row}`),valueRenderOption:'UNFORMATTED_VALUE'},requestOptions);
  const ranges=r.data.valueRanges||[];
  return rows.map((row,i)=>{const cells=ranges[i]?.values?.[0]||[],payload=cells.slice(2).join('');if(cells[0]!==row.event.eventId||cells.slice(2).length!==row.event.chunks||digest(payload)!==row.event.hash)throw storageError('Storage payload integrity check failed',503);const {event,...summary}=row;return {...summary,payload};});
 }
 async save(s){await this.append({type:'save',assessment:s.id,owner:s.owner,actor:s.actor,isNew:s.isNew,expectedVersion:s.expectedVersion,status:s.status,engineVersion:s.engineVersion},s.payload);}
 async versions(id,owner){const a=(await this.read()).assessments.get(id);if(a?.owner!==owner)throw storageError('Assessment not found',404);return a.versions.map((e,i)=>({version:i+1,actor:e.actor,status:e.status,createdAt:e.createdAt})).reverse();}
 async version(id,owner,v){const a=(await this.read()).assessments.get(id),e=a?.owner===owner?a.versions[v-1]:null;if(!e)throw storageError('Assessment not found',404);return {version:v,status:e.status,actor:e.actor,created_at:e.createdAt,engine_version:e.engineVersion,payload:await this.payload(e)};}
 async evidenceBatch(ids,assessment){
  const state=await this.read(),events=ids.map(id=>state.documents.get(id));
  if(events.some(e=>!e||e.assessment!==assessment))throw storageError('Evidence document does not belong to this assessment');
  if(!events.length)return [];
  const r=await this.client.spreadsheets.values.batchGet({spreadsheetId:this.spreadsheetId,ranges:events.map(e=>`${RANGE}!A${e.row}:CX${e.row}`),valueRenderOption:'UNFORMATTED_VALUE'},requestOptions);
  return events.map((e,i)=>{const row=r.data.valueRanges?.[i]?.values?.[0]||[],payload=row.slice(2).join('');if(row[0]!==e.eventId||row.slice(2).length!==e.chunks||digest(payload)!==e.hash)throw storageError('Storage payload integrity check failed',503);return {payload};});
 }
 async evidence(id,assessment){const e=(await this.read()).documents.get(id);return e?.assessment===assessment?{payload:await this.payload(e)}:undefined;}
 async addDocument(d){await this.append({type:'document',assessment:d.assessment,document:d.id,actor:d.actor},d.payload);}
 async document(id,email){const s=await this.read(),e=s.documents.get(id);if(!e||!this.allowed(s.assessments.get(e.assessment),email))throw storageError('Document not found',404);return {payload:await this.payload(e)};}
}

let cached;
export async function createSheetsStore(){
 if(cached)return cached;
 const {google}=await import('googleapis');
 let credentials;try{credentials=JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS||'');if(!credentials.client_email||!credentials.private_key)throw Error();credentials.private_key=credentials.private_key.replace(/\\n/g,'\n');}catch{throw storageError('Google Sheets credentials are not configured correctly',503);}
 const spreadsheetId=process.env.WORKBENCH_SHEETS_ID;
 if(!spreadsheetId)throw storageError('WORKBENCH_SHEETS_ID is not configured',503);
 const auth=new google.auth.GoogleAuth({credentials,scopes:['https://www.googleapis.com/auth/spreadsheets']});
 cached=new SheetsStore(google.sheets({version:'v4',auth}),spreadsheetId,Buffer.from(process.env.WORKBENCH_DATA_KEY||'','base64'));return cached;
}
