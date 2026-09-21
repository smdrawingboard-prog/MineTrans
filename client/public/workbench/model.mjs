// Shared deterministic engine. All money inputs are in whole currency units.
export const VERSION = '2.1.0';
export function underwritingDefaults(){return {dataBasis:'Training benchmark',financialBasis:'',valuationDate:'',forecastAdjustments:'',stockAndSavings:'',scenarioScope:'',dependenciesReview:'',contingencyBasis:'',clientContact:'',confirmedDate:'',policyValuesConfirmed:'No'};}
export const presets = {
 Gold: [500000000,36,'SAG / ball mill shell',364,95,60], Diamonds:[320000000,28,'DMS / recovery plant',210,88,45],
 Coal:[800000000,46,'Coal handling & prep plant',252,90,40], Chrome:[240000000,44,'Spiral concentrator bank',154,70,35], PGM:[650000000,40,'Smelter furnace',308,80,90]
};
export function fresh(commodity='Gold') {
 const [turnover,cost,name,days,severity,ramp]=presets[commodity]||presets.Gold;
 return {schemaVersion:2,underwriting:underwritingDefaults(),client:'',site:'',location:'',commodity,method:'',production:'',customers:'',process:'',advisor:'',date:new Date().toISOString().slice(0,10),currency:'USD',period:'',turnover,
 costs:[{name:'Illustrative uninsured variable costs',amount:turnover*cost/100}],policyDefinition:'',contingency:60,
 assets:[{name,capacity:severity,repairDays:days,replacementDays:days,spares:'Not confirmed',alternatives:'Not confirmed'}],
 scenarios:[{name:'Critical asset failure',asset:0,severity,coverage:'Unconfirmed',evidence:'',phases:[{name:'Investigation and engineering',start:0,days:30},{name:'Procurement and manufacture',start:30,days:Math.max(0,days-60)},{name:'Shipping and installation',start:days-30,days:30}],recovery:[{days:ramp,production:50}],icow:[],dependencyIds:[]}],
 dependencies:[],mitigations:[],evidence:[],
 assurance:{financial:{status:'Estimated',source:'Commodity training benchmark'},assets:{status:'Estimated',source:'Commodity training benchmark'},recovery:{status:'Estimated',source:'Commodity training benchmark'},coverage:{status:'Outstanding',source:''}},
 policy:{limit:0,months:0,deductibleDays:0,extensions:'',exclusions:'',wordingRef:''},notes:'',actions:'',reviewNotes:''};
}
const statuses=['Outstanding','Estimated','Client confirmed'];
const text=(v,n=4000)=>typeof v==='string'&&v.length<=n;
const num=(v,max=1e15)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
export function validate(d) {
 const errors=[]; const fail=(ok,msg)=>{if(!ok)errors.push(msg)};
 if(!d||typeof d!=='object') return ['Assessment is required'];
 fail(d.schemaVersion===2,'Unsupported assessment version');
 for(const k of ['client','site','location','commodity','method','production','customers','process','advisor','date','period','policyDefinition','notes','actions','reviewNotes'])fail(text(d[k]),'Invalid '+k);
 fail(['USD','ZAR','EUR','GBP'].includes(d.currency),'Select a supported currency');
 fail(num(d.turnover)&&d.turnover>0,'Annual turnover must be greater than zero');fail(num(d.contingency,3650),'Invalid contingency');
 for(const [k,limit] of [['costs',50],['assets',50],['scenarios',30],['dependencies',50],['mitigations',50],['evidence',50]]) fail(Array.isArray(d[k])&&d[k].length<=limit,'Invalid '+k);
 if(errors.length)return errors;
 // Reject malformed nested records before accessing their properties.
 for(const key of ['costs','assets','scenarios','dependencies','mitigations','evidence'])if(d[key].some(v=>!v||typeof v!=='object'||Array.isArray(v)))errors.push('Invalid '+key+' record');
 if(d.scenarios.some(s=>s&&['phases','recovery','icow'].some(k=>Array.isArray(s[k])&&s[k].some(v=>!v||typeof v!=='object'||Array.isArray(v)))))errors.push('Invalid scenario schedule record');
 if(d.underwriting){for(const k of Object.keys(underwritingDefaults()))fail(text(d.underwriting[k]),'Invalid underwriting '+k);fail(['Training benchmark','Client supplied / reconciled'].includes(d.underwriting.dataBasis),'Invalid data basis');fail(['Yes','No'].includes(d.underwriting.policyValuesConfirmed),'Invalid policy confirmation');}
 if(errors.length)return errors;
 fail(d.assets.length>0&&d.scenarios.length>0,'At least one asset and scenario required');
 d.costs.forEach(c=>fail(text(c.name)&&num(c.amount),'Invalid variable cost'));
 fail(d.costs.reduce((t,c)=>t+c.amount,0)<d.turnover,'Variable costs must be below turnover');
 d.assets.forEach(a=>fail(text(a.name)&&a.name.trim()&&num(a.capacity,100)&&num(a.repairDays,36500)&&num(a.replacementDays,36500)&&text(a.spares)&&text(a.alternatives),'Invalid critical asset'));
 d.dependencies.forEach(a=>fail(text(a.name)&&text(a.type)&&num(a.days,36500)&&['Unconfirmed','Included','Excluded'].includes(a.coverage)&&text(a.evidence),'Invalid dependency'));
 d.mitigations.forEach(a=>fail(text(a.name)&&text(a.status)&&text(a.effect)&&text(a.evidence),'Invalid mitigation'));
 d.evidence.forEach(a=>fail(text(a.name)&&text(a.reference)&&text(a.note)&&text(a.sha256,64),'Invalid evidence reference'));
 d.scenarios.forEach(s=>{
  fail(text(s.name)&&s.name.trim()&&Number.isInteger(s.asset)&&s.asset>=0&&s.asset<d.assets.length&&num(s.severity,100)&&text(s.evidence)&&['Unconfirmed','Included','Excluded'].includes(s.coverage),'Invalid scenario');
  if(!Array.isArray(s.phases)||!Array.isArray(s.recovery)||!Array.isArray(s.icow)||!Array.isArray(s.dependencyIds)){errors.push('Invalid scenario schedules');return;}
  fail(s.phases.length>0&&s.phases.length<=30&&s.recovery.length<=30&&s.icow.length<=30&&s.dependencyIds.length<=50,'Scenario schedule limits exceeded');
  s.phases.forEach(p=>fail(text(p.name)&&num(p.start,36500)&&num(p.days,36500),'Invalid recovery phase'));
  let last=100-s.severity;
  s.recovery.forEach(p=>{fail(num(p.days,36500)&&num(p.production,100)&&p.production>=last,'Recovery output must increase towards full production');last=p.production;});
  s.icow.forEach(p=>fail(text(p.name)&&num(p.cost)&&num(p.avoidedLoss),'Invalid ICOW item'));
  fail(new Set(s.dependencyIds).size===s.dependencyIds.length&&s.dependencyIds.every(i=>Number.isInteger(i)&&i>=0&&i<d.dependencies.length),'Invalid dependency selection');
 });
 fail(d.policy&&num(d.policy.limit)&&num(d.policy.months,1200)&&num(d.policy.deductibleDays,36500)&&text(d.policy.extensions)&&text(d.policy.exclusions)&&text(d.policy.wordingRef),'Invalid policy details');
 for(const key of ['financial','assets','recovery','coverage'])fail(d.assurance?.[key]&&statuses.includes(d.assurance[key].status)&&text(d.assurance[key].source),'Invalid evidence status: '+key);
 return errors;
}
export function outstanding(d) {
 const missing=[];
 const u=d.underwriting||underwritingDefaults();
 if(u.dataBasis!=='Client supplied / reconciled')missing.push('Training or legacy values: replace and reconcile every material input before client review');
 for(const [k,label] of Object.entries({financialBasis:'Financial reconciliation and source references',valuationDate:'Financial valuation date',forecastAdjustments:'Forecast, trend and seasonality assessment',stockAndSavings:'Stock and saved expenses assessment',scenarioScope:'Credible event scope and omissions',dependenciesReview:'Supply chain and utilities review',contingencyBasis:'Contingency justification',clientContact:'Client confirming person and role',confirmedDate:'Client confirmation date'}))if(!u[k]?.trim())missing.push(label+' is outstanding');
 if(u.policyValuesConfirmed!=='Yes')missing.push('Current policy limit, period and waiting period are unconfirmed');
 if(!d.evidence.length)missing.push('Evidence register is empty');
 d.evidence.forEach(e=>{if(!e.name.trim()||!e.reference.trim()||!e.note.trim())missing.push('Evidence needs a name, source reference, date and scope note');});
 d.scenarios.forEach(s=>{if(!s.phases.some(p=>p.days>0)||s.severity===0)missing.push(s.name+': zero-duration or zero-loss scenario requires correction before review');});
 for(const [k,label] of [['client','Client name'],['site','Mine/site'],['location','Site location'],['method','Mining method'],['process','Mining process'],['advisor','Advisor'],['period','Financial reporting period'],['policyDefinition','Policy gross profit definition']])if(!d[k]?.trim())missing.push(label+' is outstanding');
 for(const [key,a] of Object.entries(d.assurance||{}))if(a.status!=='Client confirmed'||!a.source.trim()||/training benchmark/i.test(a.source))missing.push(key+': '+a.status+'; supporting evidence required');
 d.scenarios.forEach(s=>{if(s.coverage==='Unconfirmed')missing.push(s.name+': coverage unconfirmed');if(!s.evidence.trim())missing.push(s.name+': scenario justification outstanding');});
 d.dependencies.forEach(s=>{if(s.coverage==='Unconfirmed'||!s.evidence.trim())missing.push(s.name+': dependency cover or evidence unconfirmed');});
 if(!d.policy.wordingRef.trim())missing.push('Existing policy wording reference is outstanding');
 return missing;
}
export function calculate(d) {
 const errors=validate(d);if(errors.length)throw new Error(errors.join('; '));
 const variableCosts=d.costs.reduce((t,c)=>t+c.amount,0),gp=d.turnover-variableCosts,daily=gp/365;
 const scenarios=d.scenarios.map((s,i)=>{
  // Explicit offsets allow parallel phases; no summing concurrent construction and manufacture.
  const assetDays=Math.max(...s.phases.map(p=>p.start+p.days));
  // Concurrent external interruptions share the critical path rather than being blindly added.
  const dependencyDays=Math.max(0,...s.dependencyIds.map(j=>d.dependencies[j].days));
  const outage=Math.max(assetDays,dependencyDays),rampDays=s.recovery.reduce((t,r)=>t+r.days,0);
  const lossOutage=outage*daily*s.severity/100,lossRamp=s.recovery.reduce((t,r)=>t+r.days*daily*(1-r.production/100),0);
  const icow=s.icow.reduce((t,r)=>t+r.cost,0),economicIcow=s.icow.reduce((t,r)=>t+Math.min(r.cost,r.avoidedLoss),0);
  const total=lossOutage+lossRamp+icow,days=outage+rampDays;
  return {index:i,name:s.name,coverage:s.coverage,outage,dependencyDays,assetDays,rampDays,days,lossOutage,lossRamp,turnoverReduction:(lossOutage+lossRamp)/gp*d.turnover,icow,economicIcow,uneconomicIcow:icow-economicIcow,total,needDays:days+d.contingency};
 });
 // Unconfirmed scenarios remain in the conservative exposure envelope until wording is reviewed.
 const candidates=scenarios.filter(s=>s.coverage!=='Excluded');
 const worst=candidates.length?candidates.reduce((a,b)=>a.total>=b.total?a:b):null;
 const needDays=Math.max(0,...candidates.map(s=>s.needDays));
 const months=candidates.length?([12,18,24,36,48,60].find(m=>m*365/12>=needDays)||Math.ceil(needDays/(365/12)/12)*12):0;
 const icow=Math.max(0,...candidates.map(s=>s.icow));
 const sumInsured=candidates.length?Math.max(gp*months/12+icow,...candidates.map(s=>s.total)):0;
 return {gp,daily,variableCosts,scenarios,worst,needDays,months,icow,sumInsured,limitGap:d.underwriting?.policyValuesConfirmed==='Yes'?Math.max(0,sumInsured-d.policy.limit):null,periodGap:d.underwriting?.policyValuesConfirmed==='Yes'?Math.max(0,months-d.policy.months):null,outstanding:outstanding(d),warnings:[
  'Exposure model, not a claim settlement calculation or insurer acceptance. Annual inputs are held constant and spread evenly over 365 days; seasonality, future growth, stock offsets and saved insured expenses are not automatically modelled. Reconcile their treatment in the financial basis.',
  'Recovery stages end with full output assumed immediately thereafter. Contingency extends the proposed period, not the calculated scenario loss. Dependency durations run concurrently from the event date. Economic ICOW ceilings are tested per item; loss-avoided amounts must not overlap.',
  ...(candidates.length===0?['No included or unconfirmed scenario: no insured recommendation calculated.']:[]),
  ...scenarios.filter(s=>s.uneconomicIcow>0).map(s=>s.name+': ICOW costs exceed stated loss avoided; recovery under the policy is not established.'),
  ...d.scenarios.filter(s=>s.coverage==='Unconfirmed').map(s=>s.name+': provisional exposure only; cover not confirmed.'),
  'Losses are gross before policy deductibles, sublimits and settlement conditions. ICOW must not also be counted as an additional reduction to an already-mitigated recovery schedule.'
 ]};
}
export function money(d,n) {return n===null?'Unconfirmed':d.currency+' '+new Intl.NumberFormat('en-ZA',{maximumFractionDigits:0}).format(n);}
export function report(d,m=calculate(d)) {
 const shifts=[['Turnover +10%, costs held fixed',x=>x.turnover*=1.1],['Variable costs +5 percentage points',x=>x.costs.push({name:'Sensitivity',amount:x.turnover*.05})],['Final recovery output extended 60 days',x=>x.scenarios.forEach(s=>s.recovery.push({days:60,production:s.recovery.at(-1)?.production??100-s.severity}))]].map(([label,change])=>{const x=structuredClone(d);change(x);if(validate(x).length)return label+': not applicable';const r=calculate(x);return label+': largest candidate loss change '+money(d,(r.worst?.total||0)-(m.worst?.total||0))+'; proposed cover change '+money(d,r.sumInsured-m.sumInsured)}).join('\n');
 const u=d.underwriting||underwritingDefaults();
 const basis=Object.entries(u).map(([k,v])=>k+': '+(v||'Outstanding')).join('\n');
 const ledger=d.scenarios.map((s,i)=>{const r=m.scenarios[i];let day=r.outage;return s.name+' | '+s.coverage+'\nOutage: days 0–'+r.outage+' × '+money(d,m.daily)+' daily GP × '+s.severity+'% loss = '+money(d,r.lossOutage)+'\n'+s.recovery.map(p=>{const start=day;day+=p.days;return 'Recovery days '+start+'–'+day+': '+p.days+' × daily GP × '+(100-p.production)+'% loss = '+money(d,p.days*m.daily*(1-p.production/100));}).join('\n')+'\nGross loss: outage '+money(d,r.lossOutage)+' + recovery '+money(d,r.lossRamp)+' + ICOW '+money(d,r.icow)+' = '+money(d,r.total);}).join('\n\n');
 const allWorst=m.scenarios.reduce((a,b)=>a.total>=b.total?a:b);
 const rows=m.scenarios.map(s=>`${s.name} (${s.coverage}): ${s.outage} days interruption; ${s.rampDays} days recovery; gross loss including ICOW ${money(d,s.total)}; ${m.sumInsured?(s.total/m.sumInsured*100).toFixed(1):'N/A'}% of proposed limit.`);
 return [
 ['Mining process and critical operations',`${d.client||'Client outstanding'} | ${d.site||'Site outstanding'} | ${d.location||'Location outstanding'}\nCommodity: ${d.commodity}. Method: ${d.method||'Outstanding'}. Production: ${d.production||'Outstanding'}. Customers: ${d.customers||'Outstanding'}.\n${d.process||'Mining process description outstanding.'}`],
 ['Asset criticality and bottlenecks',d.assets.map(a=>`${a.name}: ${a.capacity}% capacity affected; repair ${a.repairDays} days; replacement ${a.replacementDays} days. Spares: ${a.spares}. Alternatives: ${a.alternatives}.`).join('\n')],
 ['Maximum Foreseeable Loss scenario',m.worst?`Largest modelled candidate loss: ${m.worst.name}, ${money(d,m.worst.total)}. This is the largest of the scenarios entered, not proof that all credible events have been considered.\n`+d.scenarios.map(s=>`${s.name}: ${s.evidence||'Justification outstanding'}`).join('\n'):'All entered scenarios excluded; insured MFL not established.'],
 ['Gross profit calculation',`Period: ${d.period||'Outstanding'}. Annual forecast turnover ${money(d,d.turnover)} less uninsured variable costs ${money(d,m.variableCosts)} = annual insurance gross profit ${money(d,m.gp)}. Daily gross profit ${money(d,m.daily)}.\n${d.costs.map(c=>c.name+': '+money(d,c.amount)).join('\n')}\nPolicy definition: ${d.policyDefinition||'Outstanding'}`],
 ['Production interruption and recovery',d.scenarios.map((s,i)=>`${s.name}: ${s.phases.map(p=>p.name+' starts day '+p.start+' for '+p.days+' days').join('; ')}.\nRecovery output (% of normal): ${s.recovery.map(r=>r.days+' days at '+r.production+'%').join('; ')||'Immediate restoration after outage'}. Turnover reduction ${money(d,m.scenarios[i].turnoverReduction)}. Concurrent phases and dependencies use the longest completion time.`).join('\n\n')],
 ['Increased Cost of Working',d.scenarios.map((s,i)=>`${s.name}: ${s.icow.map(r=>r.name+': cost '+money(d,r.cost)+', stated loss avoided '+money(d,r.avoidedLoss)).join('; ')||'No ICOW items entered'}. Total ${money(d,m.scenarios[i].icow)}; economic-test ceiling ${money(d,m.scenarios[i].economicIcow)}. Policy recovery remains subject to wording.`).join('\n')],
 ['Supply chain and utility dependencies',(d.dependencies.map(r=>`${r.name} (${r.type}): ${r.days} days interruption; cover ${r.coverage}; evidence ${r.evidence||'Outstanding'}`).join('\n')||'No dependencies recorded; this does not confirm their absence.')+'\nMitigation:\n'+(d.mitigations.map(r=>`${r.name} (${r.status}): ${r.effect}; evidence ${r.evidence||'Outstanding'}`).join('\n')||'No mitigation evidence recorded.')],
 ['Indemnity period and justification',`${m.months} months provisional indemnity period covering ${m.needDays} days for the longest candidate recovery including ${d.contingency} contingency days. Current period: ${d.underwriting?.policyValuesConfirmed==='Yes'?d.policy.months+' months':'Unconfirmed'}; indicated gap ${m.periodGap===null?'Unconfirmed':m.periodGap+' months'}.`],
 ['Business Interruption sum insured',`${money(d,m.sumInsured)} provisional limit: annual gross profit times indemnity months / 12 plus the largest scenario ICOW budget, and no lower than the largest candidate gross loss. Current limit ${money(d,d.underwriting?.policyValuesConfirmed==='Yes'?d.policy.limit:null)}; indicated gap ${money(d,m.limitGap)}. Limits are not a confirmation of insurance cover.`],
 ['Scenario-based loss estimates',rows.join('\n')+'\n\nLargest economic exposure across ALL entered scenarios (including excluded): '+allWorst.name+' — '+money(d,allWorst.total)+' ('+allWorst.coverage+').\n\nCalculation trail (amounts displayed rounded; calculations use unrounded values):\n'+ledger],
 ['Assumptions, exclusions, sensitivity and actions',`Underwriting basis:\n${basis}\n\nOutstanding:\n${m.outstanding.join('\n')||'None recorded'}\nEvidence status:\n${Object.entries(d.assurance).map(([k,a])=>k+': '+a.status+' — '+a.source).join('\n')}\nEvidence register:\n${d.evidence.map(e=>e.name+' | '+e.reference+' | '+e.note+(e.sha256?' | SHA-256 '+e.sha256:'')).join('\n')||'None'}\nPolicy reference: ${d.policy.wordingRef||'Outstanding'}. Waiting period: ${d.underwriting?.policyValuesConfirmed==='Yes'?d.policy.deductibleDays+' days':'Unconfirmed'} (not deducted from gross exposure). Extensions: ${d.policy.extensions||'Outstanding'}. Exclusions: ${d.policy.exclusions||'Outstanding'}.\n${m.warnings.join('\n')}\nSensitivity:\n${shifts}\nAssumptions: ${d.notes||'None entered'}\nActions: ${d.actions||'Outstanding'}\nAdvisor review: ${d.reviewNotes||'Pending'}`]
 ];
}
