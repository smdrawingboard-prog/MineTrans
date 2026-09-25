import { Router, type Express, type Request, type Response, type NextFunction } from 'express';
import { createPool, type Pool } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { MysqlStore } from './storage.mjs';
import { createSheetsStore } from './sheets-store.mjs';
import { SignJWT, jwtVerify } from 'jose';
import { randomUUID, randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto';
import { parse } from 'cookie';
import PDFDocument from 'pdfkit';
import { resolve } from 'node:path';
import { validate, calculate, report, VERSION } from '../../client/public/workbench/model.mjs';

type Staff={email:string;name:string;passwordHash:string;role?:'advisor'|'insurer'};
const COOKIE='mt_workbench';
let pool:Pool|undefined;
function config(){
 const users:Staff[]=JSON.parse(process.env.WORKBENCH_USERS_JSON||'[]');
 const secret=process.env.WORKBENCH_SESSION_SECRET||'', key=Buffer.from(process.env.WORKBENCH_DATA_KEY||'','base64');
 const storage=process.env.WORKBENCH_STORAGE||'mysql';
 if(!['mysql','sheets'].includes(storage)||(storage==='mysql'?!process.env.DATABASE_URL:(!process.env.WORKBENCH_SHEETS_ID||!process.env.GOOGLE_SHEETS_CREDENTIALS))||secret.length<32||key.length!==32||!users.length||!process.env.WORKBENCH_ORIGIN)throw Object.assign(Error('Secure workbench storage is not configured. Contact the site administrator.'),{status:503});
 if(users.some(u=>!u.email||!u.name||!/^\$2[aby]\$/.test(u.passwordHash)||(u.role&&!['advisor','insurer'].includes(u.role))))throw Object.assign(Error('Staff account configuration is invalid.'),{status:503});
 return{users,secret:new TextEncoder().encode(secret),key,origin:process.env.WORKBENCH_ORIGIN};
}
async function db(){config();return process.env.WORKBENCH_STORAGE==='sheets'?await createSheetsStore():new MysqlStore(pool||=createPool(process.env.DATABASE_URL!))}
function encrypt(value:unknown){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',config().key,iv),body=Buffer.concat([c.update(JSON.stringify(value),'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),body]).toString('base64')}
function decrypt(value:string){const b=Buffer.from(value,'base64'),d=createDecipheriv('aes-256-gcm',config().key,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8'))}
const wrap=(f:(req:Request,res:Response)=>Promise<unknown>)=>(req:Request,res:Response,next:NextFunction)=>{Promise.resolve(f(req,res)).catch(next)};
const invalid=(message:string,status=400)=>Object.assign(Error(message),{status});
const uuid=(s:unknown)=>typeof s==='string'&&/^[a-f0-9-]{36}$/i.test(s);
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/api/workbench',maxAge:8*60*60*1000};
const attempts=new Map<string,{count:number;until:number}>();
export function registerWorkbench(app:Express){
 const router=Router();
 async function owner(id:string,email:string){return (await db()).owner(id,email);}

 router.use((req,res,next)=>{res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');if(req.method!=='GET'){
  const origin=req.get('Origin');if(!origin||origin!==process.env.WORKBENCH_ORIGIN){res.status(403).json({error:'Origin not allowed'});return}
 }next()});
 router.post('/login',wrap(async(req,res)=>{
  const c=config();const email=String(req.body?.email||'').trim().toLowerCase(),password=req.body?.password;
  if(typeof password!=='string'||password.length>200||email.length>320)throw invalid('Invalid credentials',401);
  const now=Date.now();attempts.forEach((v,k)=>{if(v.until<now)attempts.delete(k)});
  const key=email;const attempt=attempts.get(key)||{count:0,until:now+15*60*1000};
  if(attempt.count>=10||attempts.size>5000)throw invalid('Too many attempts. Try again later.',429);
  attempt.count++;attempts.set(key,attempt);
  const user=c.users.find(u=>u.email.toLowerCase()===email);
  if(!user||!await bcrypt.compare(password,user.passwordHash))throw invalid('Invalid credentials',401);
  attempts.delete(key);
  const token=await new SignJWT({name:user.name,credentialVersion:createHash('sha256').update(user.passwordHash).digest('hex')}).setProtectedHeader({alg:'HS256'}).setSubject(email).setIssuer('minetrans-workbench').setAudience('staff').setIssuedAt().setExpirationTime('8h').sign(c.secret);
  res.cookie(COOKIE,token,cookieOptions);res.json({email,name:user.name,role:user.role||'advisor'});
 }));
 router.use((req,res,next)=>{Promise.resolve((async()=>{
  const c=config(),token=parse(req.headers.cookie||'')[COOKIE];if(!token)throw invalid('Staff sign-in required',401);
  let payload;try{payload=(await jwtVerify(token,c.secret,{issuer:'minetrans-workbench',audience:'staff',algorithms:['HS256']})).payload}catch{throw invalid('Session expired. Sign in again.',401)}
  const u=c.users.find(u=>u.email.toLowerCase()===payload.sub);if(!u||payload.credentialVersion!==createHash('sha256').update(u.passwordHash).digest('hex'))throw invalid('Staff account is no longer authorised',401);
  res.locals.staff={email:u.email.toLowerCase(),name:u.name,role:u.role||'advisor'};next();
 })()).catch(next)});
 router.get('/session',(_req,res)=>res.json(res.locals.staff));
 router.post('/logout',(_req,res)=>{res.clearCookie(COOKIE,cookieOptions);res.json({ok:true})});
 router.use('/assessments/:id',(req,res,next)=>{owner(req.params.id,res.locals.staff.email).then(o=>{res.locals.assessmentOwner=o;next()}).catch(next)});
 router.get('/assessments/:id/access',wrap(async(req,res)=>{
  if(res.locals.assessmentOwner!==res.locals.staff.email)throw invalid('Only the assessment owner can manage access',403);
  res.json(await (await db()).access(req.params.id));
 }));
 router.post('/assessments/:id/access',wrap(async(req,res)=>{
  if(res.locals.assessmentOwner!==res.locals.staff.email||res.locals.staff.role!=='advisor')throw invalid('Only the MineTrans assessment owner can manage access',403);
  const email=String(req.body?.email||'').trim().toLowerCase();
  if(req.body?.action==='revoke'){await (await db()).setAccess(req.params.id,email,res.locals.staff.email,true);res.json({ok:true});return;}
  if(!config().users.some(u=>u.email.toLowerCase()===email))throw invalid('This person needs a named workbench account provisioned by the administrator first.');
  if(email===res.locals.staff.email)throw invalid('The owner already has access');
  await (await db()).setAccess(req.params.id,email,res.locals.staff.email,false);res.json({ok:true});
 }));
 router.get('/assessments',wrap(async(_req,res)=>{
  const rows=await (await db()).list(res.locals.staff.email);
  res.json(rows.map((r:any)=>{const saved=decrypt(r.payload),d=saved.data;return{id:r.id,version:r.current_version,status:r.status,client:d.client,site:d.site,date:d.date,updatedAt:r.created_at}}));
 }));
 router.post('/assessments',wrap(async(req,res)=>{
  const {data,status='draft',expectedVersion=0}=req.body||{};const errors=validate(data);if(errors.length)throw invalid(errors.join('; '));
  if(!data.client.trim()||!data.site.trim())throw invalid('Client and site names are required');
  if(!['draft','reviewed'].includes(status)||!Number.isInteger(expectedVersion)||expectedVersion<0)throw invalid('Invalid version or status');
  if(res.locals.staff.role==='insurer'&&(!req.body.id||status==='reviewed'))throw invalid('Insurers may contribute drafts to assigned assessments; MineTrans records the advisor review',403);
  const model=calculate(data);if(status==='reviewed'&&(model.outstanding.length||!data.reviewNotes.trim()))throw invalid('Complete outstanding information and advisor review notes first');
  const id=req.body.id||randomUUID();if(!uuid(id))throw invalid('Invalid assessment ID');
  const assessmentOwner=req.body.id?await owner(id,res.locals.staff.email):res.locals.staff.email;
  if(status==='reviewed'&&assessmentOwner!==res.locals.staff.email)throw invalid('Only the assessment owner can record advisor review',403);
  if(!req.body.id&&expectedVersion!==0)throw invalid('New assessment version must be zero');
  const store=await db();
  const uploaded=data.evidence.filter((e:any)=>e.reference.startsWith('document:'));
  const documents=uploaded.length?await store.evidenceBatch(uploaded.map((e:any)=>e.reference.slice(9)),id):[];let documentIndex=0;
  for(const e of data.evidence){if(e.reference.startsWith('document:')){const document=documents[documentIndex++];if(!document)throw invalid('Evidence document does not belong to this assessment');const stored=decrypt(document.payload);const hash=createHash('sha256').update(Buffer.from(stored.data,'base64')).digest('hex');if(hash!==stored.sha256)throw invalid('Evidence integrity check failed');e.sha256=hash;e.name=stored.name;}else if(e.sha256){throw invalid('Hashes are available only for uploaded documents; upload the evidence to verify its integrity');}}
  // Calculate after stored evidence names and hashes have been made authoritative.
  const savedModel=calculate(data),version=expectedVersion+1;
  await store.save({id,owner:assessmentOwner,actor:res.locals.staff.email,isNew:!req.body.id,expectedVersion,status,payload:encrypt({data,model:savedModel,sections:report(data,savedModel)}),engineVersion:VERSION});
  res.json({id,version,status});
 }));
 router.get('/assessments/:id/versions',wrap(async(req,res)=>{
  res.json(await (await db()).versions(req.params.id,res.locals.assessmentOwner));
 }));
 async function version(req:Request,res:Response){
  const v=Number(req.params.version);if(!uuid(req.params.id)||!Number.isInteger(v)||v<1)throw invalid('Invalid version');
  const r=await (await db()).version(req.params.id,res.locals.assessmentOwner,v);return{id:req.params.id,version:r.version,status:r.status,actor:r.actor,createdAt:r.created_at,...decrypt(r.payload),engineVersion:r.engine_version,canReview:res.locals.assessmentOwner===res.locals.staff.email&&res.locals.staff.role==='advisor'};
 }
 router.get('/assessments/:id/versions/:version',wrap(async(req,res)=>{res.json(await version(req,res))}));
 router.get('/assessments/:id/versions/:version/pdf',wrap(async(req,res)=>{
  const r=await version(req,res),sections=r.sections;res.type('application/pdf');res.setHeader('Content-Disposition',`attachment; filename="MineTrans-BI-v${r.version}.pdf"`);
  const pdf=new PDFDocument({size:'A4',margin:48,bufferPages:true,info:{Title:'MineTrans Mine Business Interruption Assessment',Author:'MineTrans Insurance Brokers'}});pdf.pipe(res);
  pdf.registerFont('WorkbenchBody',resolve('server/workbench/fonts/DejaVuSans.ttf'));
  pdf.registerFont('WorkbenchBold',resolve('server/workbench/fonts/DejaVuSans-Bold.ttf'));
  pdf.fillColor('#AD6A3D').font('WorkbenchBold').fontSize(11).text('MINETRANS  /  BLUEPRINT WORKBENCH');pdf.moveDown();
  pdf.fillColor('#141315').fontSize(24).text(r.data.site);pdf.fontSize(13).text(r.data.client);pdf.moveDown();
  pdf.font('WorkbenchBody').fontSize(10).text(`${r.status==='reviewed'?'Advisor-reviewed':'Draft'} Mine Business Interruption Assessment\nAssessment date: ${r.data.date}\nAdvisor: ${r.data.advisor}\nSaved by: ${r.actor}\nVersion ${r.version} | ${new Date(r.createdAt).toISOString()} | Model ${r.engineVersion}`);pdf.moveDown();
  pdf.font('WorkbenchBold').text(r.model.outstanding.length?'INCOMPLETE — '+r.model.outstanding.length+' outstanding items. Not ready for an underwriting decision.':r.status==='reviewed'?'Advisor review recorded; subject to insurer validation and policy terms.':'DRAFT — Advisor review has not been recorded; not ready for an underwriting decision.');
  pdf.font('WorkbenchBody').text('Input basis: '+(r.data.underwriting?.dataBasis||'Unverified legacy inputs')+'. This report models business interruption exposure; it does not confirm cover or a payable claim.');pdf.moveDown();
  sections.forEach(([heading,body]:string[],i:number)=>{if(pdf.y>680)pdf.addPage();pdf.moveDown(.7).fillColor('#AD6A3D').font('WorkbenchBold').fontSize(12).text(`${i+1}. ${heading}`);pdf.moveDown(.4).fillColor('#252327').font('WorkbenchBody').fontSize(10).text(body,{lineGap:3});});
  const range=pdf.bufferedPageRange();for(let i=range.start;i<range.start+range.count;i++){pdf.switchToPage(i);const old=pdf.page.margins.bottom;pdf.page.margins.bottom=0;pdf.fontSize(8).fillColor('#777777').text(`MineTrans | Donaldson Advisory Group | FSP 53166 | Page ${i+1} of ${range.count}`,48,805,{lineBreak:false});pdf.page.margins.bottom=old}pdf.end();
 }));
 router.post('/assessments/:id/documents',wrap(async(req,res)=>{
  const {name,mime,data}=req.body||{};if(typeof name!=='string'||name.length>255||typeof data!=='string'||data.length>2900000||!['application/pdf','image/png','image/jpeg','text/plain'].includes(mime))throw invalid('Unsupported document; PDF, PNG, JPEG or text up to 2 MB');
  const bytes=Buffer.from(data,'base64');if(!bytes.length||bytes.length>2*1024*1024)throw invalid('Document exceeds 2 MB');
  if(mime==='application/pdf'&&!bytes.subarray(0,5).equals(Buffer.from('%PDF-'))||mime==='image/png'&&bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||mime==='image/jpeg'&&bytes.subarray(0,3).toString('hex')!=='ffd8ff')throw invalid('Document content does not match type');
  const id=randomUUID(),sha256=createHash('sha256').update(bytes).digest('hex');await (await db()).addDocument({id,assessment:req.params.id,actor:res.locals.staff.email,payload:encrypt({name,mime,data,sha256})});res.json({id,sha256});
 }));
 router.get('/documents/:id',wrap(async(req,res)=>{const record=await (await db()).document(req.params.id,res.locals.staff.email);const d=decrypt(record.payload);res.set('Content-Type',d.mime);res.set('Content-Disposition',`attachment; filename="evidence"`);res.send(Buffer.from(d.data,'base64'))}));
 router.use((error:any,_req:Request,res:Response,_next:NextFunction)=>{if(res.headersSent)return;if(error.status)res.status(error.status).json({error:error.message});else{console.error('[Workbench] request failed',error.code||'internal');res.status(503).json({error:'Storage is unavailable or the save could not be confirmed. Reopen the assessment before retrying.'})}});
 app.use('/api/workbench',router);
}

