import {describe,it,expect,vi,beforeAll,afterAll} from 'vitest';
import express from 'express';
import bcrypt from 'bcrypt';
import {randomBytes} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {fresh} from '../../client/public/workbench/model.mjs';
const memory=vi.hoisted(()=>({rows:[['Event ID','Encrypted index','Encrypted payload chunks']] as string[][]}));
vi.mock('googleapis',()=>({google:{auth:{GoogleAuth:class {}},sheets:()=>({spreadsheets:{values:{
 get:async({range}:any)=>{const m=range.match(/!A(\d+):([A-Z]+)(\d+)/);return{data:{values:memory.rows.slice(+m[1]-1,+m[3]).map(r=>r.slice(0,m[2]==='B'?2:102))}};},
 append:async({requestBody}:any)=>{memory.rows.push(...requestBody.values);return{data:{updates:{updatedRows:1}}};},
 batchGet:async({ranges}:any)=>({data:{valueRanges:ranges.map((range:string)=>{const m=range.match(/!A(\d+):CX/)!;return{values:[memory.rows[+m[1]-1]]};})}})
}}})}}));
import {registerWorkbench} from './routes';
let server:any,url:string,cookie:string;
const origin='https://workbench.test';
async function call(path:string,method='GET',body?:any,token=cookie){return fetch(url+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...(token?{Cookie:token}:{})},body:body?JSON.stringify(body):undefined})}
beforeAll(async()=>{
 process.env.WORKBENCH_ORIGIN=origin;process.env.WORKBENCH_SESSION_SECRET=randomBytes(32).toString('hex');process.env.WORKBENCH_DATA_KEY=randomBytes(32).toString('base64');delete process.env.DATABASE_URL;process.env.WORKBENCH_STORAGE='sheets';process.env.WORKBENCH_SHEETS_ID='test-sheet';process.env.GOOGLE_SHEETS_CREDENTIALS=JSON.stringify({client_email:'test@example.test',private_key:'fake-test-only'});
 process.env.WORKBENCH_USERS_JSON=JSON.stringify([{email:'advisor@example.test',name:'Test advisor',passwordHash:await bcrypt.hash('local-test-only',4)},{email:'other@example.test',name:'Insurer contributor',role:'insurer',passwordHash:await bcrypt.hash('local-test-only',4)}]);
 const app=express();app.use(express.json());registerWorkbench(app);server=app.listen(0);await new Promise<void>(r=>server.once('listening',r));url='http://127.0.0.1:'+server.address().port+'/api/workbench';
 const login=await call('/login','POST',{email:'advisor@example.test',password:'local-test-only'},'');expect(login.status).toBe(200);cookie=login.headers.get('set-cookie')!.split(';')[0];
});
afterAll(()=>server.close());
describe('Sheets-backed assessment lifecycle',()=>{
 it('rejects missing staff session and cross-origin mutations',async()=>{expect((await call('/assessments','GET',undefined,'')).status).toBe(401);expect((await fetch(url+'/assessments',{method:'POST',headers:{Origin:'https://other.test','Content-Type':'application/json',Cookie:cookie},body:'{}'})).status).toBe(403)});
 it('saves encrypted snapshots, blocks stale saves, returns exact versions and exports PDF',async()=>{
  const data=fresh();data.client='Test Mining';data.site='Sample Mine';
  const saved=await call('/assessments','POST',{data,expectedVersion:0});expect(saved.status).toBe(200);const r=await saved.json();
  expect(JSON.stringify(memory.rows)).not.toContain('Test Mining');
  expect((await call('/assessments','POST',{id:r.id,expectedVersion:0,data})).status).toBe(409);
  const reopened=await (await call(`/assessments/${r.id}/versions/1`)).json();expect(reopened.data.site).toBe('Sample Mine');expect(reopened.sections).toHaveLength(11);
  const pdf=await call(`/assessments/${r.id}/versions/1/pdf`);expect(pdf.status).toBe(200);const bytes=Buffer.from(await pdf.arrayBuffer());expect(bytes.subarray(0,5).toString()).toBe('%PDF-');await writeFile('/tmp/workbench-test-report.pdf',bytes);
  const other=await call('/login','POST',{email:'other@example.test',password:'local-test-only'},'');const otherCookie=other.headers.get('set-cookie')!.split(';')[0];expect((await call(`/assessments/${r.id}/versions/1`,'GET',undefined,otherCookie)).status).toBe(404);
 });
 it('blocks review of unconfirmed assumptions and invalid financial inputs',async()=>{const data=fresh();data.client='Test';data.site='Mine';expect((await call('/assessments','POST',{data,status:'reviewed'})).status).toBe(400);data.turnover=0;expect((await call('/assessments','POST',{data})).status).toBe(400)});
 it('permits assigned insurer drafts and documents, blocks review and removes access on revocation',async()=>{
  const data=fresh();data.client='Shared client';data.site='Shared mine';
  const saved=await (await call('/assessments','POST',{data})).json();
  const login=await call('/login','POST',{email:'other@example.test',password:'local-test-only'},'');
  const insurer=login.headers.get('set-cookie')!.split(';')[0],path='/assessments/'+saved.id;
  expect((await call(path+'/versions/1','GET',undefined,insurer)).status).toBe(404);
  expect((await call(path+'/access','POST',{email:'other@example.test'})).status).toBe(200);
  expect((await call(path+'/versions/1','GET',undefined,insurer)).status).toBe(200);
  expect((await call(path+'/access','POST',{email:'advisor@example.test'},insurer)).status).toBe(403);
  const uploaded=await call(path+'/documents','POST',{name:'source.txt',mime:'text/plain',data:Buffer.from('Source evidence').toString('base64')},insurer);
  expect(uploaded.status).toBe(200);const doc=await uploaded.json();
  data.evidence.push({name:'Incorrect filename',reference:'document:'+doc.id,note:'Client source, dated today, financial schedule',sha256:'0'.repeat(64)});
  const contribution=await call('/assessments','POST',{id:saved.id,expectedVersion:1,data},insurer);
  expect(contribution.status).toBe(200);
  const snapshot=await (await call(path+'/versions/2')).json();
  expect(snapshot.actor).toBe('other@example.test');expect(snapshot.data.evidence[0].sha256).toBe(doc.sha256);expect(snapshot.data.evidence[0].name).toBe('source.txt');
  expect((await call('/documents/'+doc.id)).status).toBe(200);
  expect((await call('/assessments','POST',{id:saved.id,expectedVersion:2,data,status:'reviewed'},insurer)).status).toBe(403);
  expect((await call(path+'/access','POST',{email:'other@example.test',action:'revoke'})).status).toBe(200);
  expect((await call(path+'/versions/2','GET',undefined,insurer)).status).toBe(404);
  expect((await call('/documents/'+doc.id,'GET',undefined,insurer)).status).toBe(404);
  expect((await call('/assessments','POST',{id:saved.id,expectedVersion:2,data},insurer)).status).toBe(404);
 });
 it('fails closed if encryption configuration is missing',async()=>{const key=process.env.WORKBENCH_DATA_KEY;delete process.env.WORKBENCH_DATA_KEY;expect((await call('/assessments')).status).toBe(503);process.env.WORKBENCH_DATA_KEY=key});
});

