import { Router, type Express, type Request, type Response, type NextFunction } from 'express';
import { createPool, type Pool } from 'mysql2/promise';
import bcrypt from 'bcrypt';
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
 if(!process.env.DATABASE_URL||secret.length<32||key.length!==32||!users.length||!process.env.WORKBENCH_ORIGIN)throw Object.assign(Error('Secure workbench storage is not configured. Contact the site administrator.'),{status:503});
 if(users.some(u=>!u.email||!u.name||!/^\$2[aby]\$/.test(u.passwordHash)||(u.role&&!['advisor','insurer'].includes(u.role))))throw Object.assign(Error('Staff account configuration is invalid.'),{status:503});
 return{users,secret:new TextEncoder().encode(secret),key,origin:process.env.WORKBENCH_ORIGIN};
}
function db(){config();return pool||=createPool(process.env.DATABASE_URL!)}
function encrypt(value:unknown){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',config().key,iv),body=Buffer.concat([c.update(JSON.stringify(value),'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),body]).toString('base64')}
function decrypt(value:string){const b=Buffer.from(value,'base64'),d=createDecipheriv('aes-256-gcm',config().key,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8'))}
const wrap=(f:(req:Request,res:Response)=>Promise<unknown>)=>(req:Request,res:Response,next:NextFunction)=>{Promise.resolve(f(req,res)).catch(next)};
const invalid=(message:string,status=400)=>Object.assign(Error(message),{status});
const uuid=(s:unknown)=>typeof s==='string'&&/^[a-f0-9-]{36}$/i.test(s);
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/api/workbench',maxAge:8*60*60*1000};
const attempts=new Map<string,{count:number;until:number}>();
export function registerWorkbench(app:Express){
 const router=Router();
 async function owner(id:string,email:string){const [rows]:any=await db().execute('SELECT a.owner FROM workbench_assessments a WHERE a.id=? AND (a.owner=? OR EXISTS (SELECT 1 FROM workbench_access x WHERE x.assessment_id=a.id AND x.email=?))',[id,email,email]);if(!rows.length)throw invalid('Assessment not found',404);return rows[0].owner as string;}

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
  const [rows]:any=await db().execute('SELECT email,granted_by,created_at FROM workbench_access WHERE assessment_id=?',[req.params.id]);res.json(rows);
 }));
 router.post('/assessments/:id/access',wrap(async(req,res)=>{
  if(res.locals.assessmentOwner!==res.locals.staff.email||res.locals.staff.role!=='advisor')throw invalid('Only the MineTrans assessment owner can manage access',403);
  const email=String(req.body?.email||'').trim().toLowerCase();
  if(req.body?.action==='revoke'){await db().execute('DELETE FROM workbench_access WHERE assessment_id=? AND email=?',[req.params.id,email]);res.json({ok:true});return;}
  if(!config().users.some(u=>u.email.toLowerCase()===email))throw invalid('This person needs a named workbench account provisioned by the administrator first.');
  if(email===res.locals.staff.email)throw invalid('The owner already has access');
  await db().execute('INSERT INTO workbench_access(assessment_id,email,granted_by) VALUES(?,?,?) ON DUPLICATE KEY UPDATE granted_by=VALUES(granted_by)',[req.params.id,email,res.locals.staff.email]);res.json({ok:true});
 }));
 router.get('/assessments',wrap(async(_req,res)=>{
  const [rows]:any=await db().execute('SELECT a.id,a.current_version,v.status,v.payload,v.created_at FROM workbench_assessments a JOIN workbench_versions v ON v.assessment_id=a.id AND v.version=a.current_version WHERE (a.owner=? OR EXISTS (SELECT 1 FROM workbench_access x WHERE x.assessment_id=a.id AND x.email=?)) ORDER BY v.created_at DESC LIMIT 200',[res.locals.staff.email,res.locals.staff.email]);
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
  const conn=await db().getConnection();try{
   await conn.beginTransaction();
   if(!req.body.id){if(expectedVersion!==0)throw invalid('New assessment version must be zero');await conn.execute('INSERT INTO workbench_assessments(id,owner,current_version) VALUES(?,?,0)',[id,res.locals.staff.email])}
   const [rows]:any=await conn.execute('SELECT current_version FROM workbench_assessments WHERE id=? AND owner=? FOR UPDATE',[id,assessmentOwner]);
   if(!rows.length)throw invalid('Assessment not found',404);if(rows[0].current_version!==expectedVersion)throw invalid('A newer version exists. Reopen the current assessment before saving.',409);
   // Uploaded evidence must belong to this assessment and staff owner.
   for(const e of data.evidence){if(e.reference.startsWith('document:')){const [docs]:any=await conn.execute('SELECT payload FROM workbench_documents WHERE id=? AND assessment_id=?',[e.reference.slice(9),id]);if(!docs.length)throw invalid('Evidence document does not belong to this assessment');const stored=decrypt(docs[0].payload);const hash=createHash('sha256').update(Buffer.from(stored.data,'base64')).digest('hex');if(hash!==stored.sha256)throw invalid('Evidence integrity check failed');e.sha256=hash;e.name=stored.name;}else if(e.sha256){throw invalid('Hashes are available only for uploaded documents; upload the evidence to verify its integrity');}}
   const version=expectedVersion+1;
   await conn.execute('INSERT INTO workbench_versions(assessment_id,version,actor,status,payload,engine_version) VALUES(?,?,?,?,?,?)',[id,version,res.locals.staff.email,status,encrypt({data,model,sections:report(data,model)}),VERSION]);
   await conn.execute('UPDATE workbench_assessments SET current_version=? WHERE id=?',[version,id]);await conn.commit();res.json({id,version,status});
  }catch(e){await conn.rollback();throw e}finally{conn.release()}
 }));
 router.get('/assessments/:id/versions',wrap(async(req,res)=>{
  const [rows]:any=await db().execute('SELECT v.version,v.actor,v.status,v.created_at AS createdAt FROM workbench_versions v JOIN workbench_assessments a ON a.id=v.assessment_id WHERE a.id=? AND a.owner=? ORDER BY v.version DESC',[req.params.id,res.locals.assessmentOwner]);res.json(rows);
 }));
 async function version(req:Request,res:Response){
  const v=Number(req.params.version);if(!uuid(req.params.id)||!Number.isInteger(v)||v<1)throw invalid('Invalid version');
  const [rows]:any=await db().execute('SELECT v.* FROM workbench_versions v JOIN workbench_assessments a ON a.id=v.assessment_id WHERE a.id=? AND a.owner=? AND v.version=?',[req.params.id,res.locals.assessmentOwner,v]);if(!rows.length)throw invalid('Assessment not found',404);const r=rows[0];return{id:req.params.id,version:r.version,status:r.status,actor:r.actor,createdAt:r.created_at,...decrypt(r.payload),engineVersion:r.engine_version,canReview:res.locals.assessmentOwner===res.locals.staff.email&&res.locals.staff.role==='advisor'};
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
  pdf.font('WorkbenchBold').text(r.model.outstanding.length?'INCOMPLETE — '+r.model.outstanding.length+' outstanding items. Not ready for an underwriting decision.':'Advisor review recorded; subject to insurer validation and policy terms.');
  pdf.font('WorkbenchBody').text('Input basis: '+(r.data.underwriting?.dataBasis||'Unverified legacy inputs')+'. This report models business interruption exposure; it does not confirm cover or a payable claim.');pdf.moveDown();
  sections.forEach(([heading,body]:string[],i:number)=>{if(pdf.y>680)pdf.addPage();pdf.moveDown(.7).fillColor('#AD6A3D').font('WorkbenchBold').fontSize(12).text(`${i+1}. ${heading}`);pdf.moveDown(.4).fillColor('#252327').font('WorkbenchBody').fontSize(10).text(body,{lineGap:3});});
  const range=pdf.bufferedPageRange();for(let i=range.start;i<range.start+range.count;i++){pdf.switchToPage(i);const old=pdf.page.margins.bottom;pdf.page.margins.bottom=0;pdf.fontSize(8).fillColor('#777777').text(`MineTrans | Donaldson Advisory Group | FSP 53166 | Page ${i+1} of ${range.count}`,48,805,{lineBreak:false});pdf.page.margins.bottom=old}pdf.end();
 }));
 router.post('/assessments/:id/documents',wrap(async(req,res)=>{
  const {name,mime,data}=req.body||{};if(typeof name!=='string'||name.length>255||typeof data!=='string'||data.length>2900000||!['application/pdf','image/png','image/jpeg','text/plain'].includes(mime))throw invalid('Unsupported document; PDF, PNG, JPEG or text up to 2 MB');
  const bytes=Buffer.from(data,'base64');if(!bytes.length||bytes.length>2*1024*1024)throw invalid('Document exceeds 2 MB');
  if(mime==='application/pdf'&&!bytes.subarray(0,5).equals(Buffer.from('%PDF-'))||mime==='image/png'&&bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||mime==='image/jpeg'&&bytes.subarray(0,3).toString('hex')!=='ffd8ff')throw invalid('Document content does not match type');
  const [rows]:any=await db().execute('SELECT id FROM workbench_assessments WHERE id=? AND owner=?',[req.params.id,res.locals.assessmentOwner]);if(!rows.length)throw invalid('Assessment not found',404);
  const [counts]:any=await db().execute('SELECT COUNT(*) AS n FROM workbench_documents WHERE assessment_id=?',[req.params.id]);if(counts[0].n>=50)throw invalid('Maximum 50 evidence documents per assessment');
  const id=randomUUID(),sha256=createHash('sha256').update(bytes).digest('hex');await db().execute('INSERT INTO workbench_documents(id,assessment_id,owner,payload) VALUES(?,?,?,?)',[id,req.params.id,res.locals.staff.email,encrypt({name,mime,data,sha256})]);res.json({id,sha256});
 }));
 router.get('/documents/:id',wrap(async(req,res)=>{const [rows]:any=await db().execute('SELECT d.payload FROM workbench_documents d JOIN workbench_assessments a ON a.id=d.assessment_id WHERE d.id=? AND (a.owner=? OR EXISTS (SELECT 1 FROM workbench_access x WHERE x.assessment_id=a.id AND x.email=?))',[req.params.id,res.locals.staff.email,res.locals.staff.email]);if(!rows.length)throw invalid('Document not found',404);const d=decrypt(rows[0].payload);res.set('Content-Type',d.mime);res.set('Content-Disposition',`attachment; filename="evidence"`);res.send(Buffer.from(d.data,'base64'))}));
 router.use((error:any,_req:Request,res:Response,_next:NextFunction)=>{if(res.headersSent)return;if(error.status)res.status(error.status).json({error:error.message});else{console.error('[Workbench] request failed',error.code||'internal');res.status(503).json({error:'Secure storage is unavailable. Your changes have not been saved.'})}});
 app.use('/api/workbench',router);
}
