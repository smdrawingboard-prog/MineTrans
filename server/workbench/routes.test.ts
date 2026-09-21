import {describe,it,expect,vi,beforeAll,afterAll} from 'vitest';
import express from 'express';
import bcrypt from 'bcrypt';
import {randomBytes} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {fresh} from '../../client/public/workbench/model.mjs';
const memory=vi.hoisted(()=>({access:new Map(),assessments:new Map(),versions:[] as any[],documents:[] as any[]}));
vi.mock('mysql2/promise',()=>({createPool:()=>{
 const execute=async(sql:string,args:any[])=>{
  if(sql.startsWith('SELECT a.owner')){const a=memory.assessments.get(args[0]);return[a&&(a.owner===args[1]||memory.access.get(args[0])?.has(args[1]))?[{owner:a.owner}]:[]]}
  if(sql.startsWith('INSERT INTO workbench_access')){if(!memory.access.has(args[0]))memory.access.set(args[0],new Set());memory.access.get(args[0]).add(args[1]);return[{}]}
  if(sql.startsWith('DELETE FROM workbench_access')){memory.access.get(args[0])?.delete(args[1]);return[{}]}
  if(sql.startsWith('SELECT email,granted_by'))return[[...(memory.access.get(args[0])||[])].map(email=>({email}))];
  if(sql.startsWith('SELECT id FROM workbench_assessments')){const a=memory.assessments.get(args[0]);return[a?.owner===args[1]?[{id:a.id}]:[]]}
  if(sql.startsWith('SELECT COUNT(*)'))return[[{n:memory.documents.filter(d=>d.assessment_id===args[0]).length}]];
  if(sql.startsWith('INSERT INTO workbench_documents')){memory.documents.push({id:args[0],assessment_id:args[1],owner:args[2],payload:args[3]});return[{}]}
  if(sql.startsWith('SELECT payload FROM workbench_documents'))return[memory.documents.filter(d=>d.id===args[0]&&d.assessment_id===args[1])];
  if(sql.startsWith('SELECT d.payload'))return[memory.documents.filter(d=>d.id===args[0]&&(memory.assessments.get(d.assessment_id)?.owner===args[1]||memory.access.get(d.assessment_id)?.has(args[1])))];
  if(sql.startsWith('INSERT INTO workbench_assessments')){memory.assessments.set(args[0],{id:args[0],owner:args[1],current_version:0});return[{}]}
  if(sql.startsWith('SELECT current_version')){const a=memory.assessments.get(args[0]);return[a?.owner===args[1]?[a]:[]]}
  if(sql.startsWith('INSERT INTO workbench_versions')){memory.versions.push({assessment_id:args[0],version:args[1],actor:args[2],status:args[3],payload:args[4],engine_version:args[5],created_at:new Date()});return[{}]}
  if(sql.startsWith('UPDATE workbench_assessments')){memory.assessments.get(args[1]).current_version=args[0];return[{}]}
  if(sql.startsWith('SELECT v.*')){return[memory.assessments.get(args[0])?.owner===args[1]?memory.versions.filter(v=>v.assessment_id===args[0]&&v.version===args[2]):[]]}
  if(sql.startsWith('SELECT a.id'))return[[...memory.assessments.values()].filter(a=>a.owner===args[0]||memory.access.get(a.id)?.has(args[0])).map(a=>({...a,...memory.versions.find(v=>v.assessment_id===a.id&&v.version===a.current_version)}))];
  throw Error('Unexpected test query '+sql);
 };
 return{execute,getConnection:async()=>({execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{}})};
}}));
import {registerWorkbench} from './routes';
let server:any,url:string,cookie:string;
const origin='https://workbench.test';
async function call(path:string,method='GET',body?:any,token=cookie){return fetch(url+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...(token?{Cookie:token}:{})},body:body?JSON.stringify(body):undefined})}
beforeAll(async()=>{
 process.env.WORKBENCH_ORIGIN=origin;process.env.WORKBENCH_SESSION_SECRET=randomBytes(32).toString('hex');process.env.WORKBENCH_DATA_KEY=randomBytes(32).toString('base64');process.env.DATABASE_URL='mysql://test-only';
 process.env.WORKBENCH_USERS_JSON=JSON.stringify([{email:'advisor@example.test',name:'Test advisor',passwordHash:await bcrypt.hash('local-test-only',4)},{email:'other@example.test',name:'Insurer contributor',role:'insurer',passwordHash:await bcrypt.hash('local-test-only',4)}]);
 const app=express();app.use(express.json());registerWorkbench(app);server=app.listen(0);await new Promise<void>(r=>server.once('listening',r));url='http://127.0.0.1:'+server.address().port+'/api/workbench';
 const login=await call('/login','POST',{email:'advisor@example.test',password:'local-test-only'},'');expect(login.status).toBe(200);cookie=login.headers.get('set-cookie')!.split(';')[0];
});
afterAll(()=>server.close());
describe('Protected assessment lifecycle',()=>{
 it('rejects missing staff session and cross-origin mutations',async()=>{expect((await call('/assessments','GET',undefined,'')).status).toBe(401);expect((await fetch(url+'/assessments',{method:'POST',headers:{Origin:'https://other.test','Content-Type':'application/json',Cookie:cookie},body:'{}'})).status).toBe(403)});
 it('saves encrypted snapshots, blocks stale saves, returns exact versions and exports PDF',async()=>{
  const data=fresh();data.client='Test Mining';data.site='Sample Mine';
  const saved=await call('/assessments','POST',{data,expectedVersion:0});expect(saved.status).toBe(200);const r=await saved.json();
  expect(memory.versions[0].payload).not.toContain('Test Mining');
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
