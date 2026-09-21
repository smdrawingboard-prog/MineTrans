import assert from 'node:assert/strict';
import {fresh,calculate,report,validate,outstanding} from '../client/public/workbench/model.mjs';
const d=fresh();
assert.equal(calculate(d).gp,320000000);
// A long MFL must drive BOTH period and amount, independent of selected UI scenario.
d.scenarios.push({...structuredClone(d.scenarios[0]),name:'Total plant loss',severity:100,phases:[{name:'Rebuild',start:0,days:550}],recovery:[{days:60,production:50}]});
let m=calculate(d);assert.equal(m.months,24);assert.ok(m.sumInsured>=m.worst.total);assert.equal(m.worst.name,'Total plant loss');assert.ok(m.months*365/12>=670);
// Concurrent construction/manufacturing should not be double-counted.
const parallel=fresh();parallel.scenarios[0].phases=[{name:'Manufacture',start:0,days:100},{name:'Construction',start:0,days:80},{name:'Install',start:100,days:20}];assert.equal(calculate(parallel).scenarios[0].outage,120);
// Staged output uses gross margin for each stage, not a forced linear average.
parallel.scenarios[0].recovery=[{days:30,production:40},{days:60,production:80}];m=calculate(parallel);assert.ok(Math.abs(m.scenarios[0].lossRamp-m.daily*30)<.00001);
// Excluded cases stay in the table but cannot drive the insured recommendation.
d.scenarios[1].coverage='Excluded';assert.equal(calculate(d).worst.name,'Critical asset failure');
d.scenarios[0].coverage='Excluded';assert.equal(calculate(d).sumInsured,0);
// Missing cover cannot silently imply insured status.
assert.ok(outstanding(fresh()).some(x=>x.includes('coverage unconfirmed')));
const costly=fresh();costly.scenarios[0].icow=[{name:'Hire',cost:2000000,avoidedLoss:500000}];m=calculate(costly);assert.equal(m.scenarios[0].uneconomicIcow,1500000);assert.ok(m.warnings.some(x=>x.includes('exceed')));
const invalid=fresh();invalid.costs[0].amount=invalid.turnover;assert.ok(validate(invalid).length);invalid.turnover=NaN;assert.ok(validate(invalid).length);
const reset=fresh('Coal');reset.dependencies.push({name:'Rail',type:'Rail',days:20,coverage:'Unconfirmed',evidence:''});assert.equal(fresh('Coal').dependencies.length,0);
assert.equal(report(fresh()).length,11);assert.ok(report(fresh())[10][1].includes('Sensitivity:'));
// Unknown policy values must not be treated as confirmed zero cover.
assert.equal(calculate(fresh()).limitGap,null);
const policy=fresh();policy.underwriting.policyValuesConfirmed='Yes';assert.equal(calculate(policy).limitGap,calculate(policy).sumInsured);
// Merely labelling assurance groups confirmed cannot approve training data.
const training=fresh();Object.values(training.assurance).forEach(a=>{a.status='Client confirmed';a.source='Commodity training benchmark'});
assert.ok(outstanding(training).some(x=>x.includes('Training or legacy')));
assert.ok(outstanding(training).some(x=>x.includes('Evidence register is empty')));
for(const key of ['assets','costs','scenarios','evidence']){const bad=fresh();bad[key]=[null];assert.ok(validate(bad).length);}
const nested=fresh();nested.scenarios[0].phases=[null];assert.ok(validate(nested).length);
// Financial report retains excluded economic exposure and reproducible schedule arithmetic.
const detailed=report(d);assert.ok(detailed[9][1].includes('Total plant loss'));assert.ok(detailed[9][1].includes('Calculation trail'));assert.ok(detailed[10][1].includes('Underwriting basis:'));
console.log('PASS: financial arithmetic, worst-case recommendation, concurrent phases, staged recovery, coverage exclusion, evidence gates, ICOW, invalid inputs, reset and 11-section report.');
