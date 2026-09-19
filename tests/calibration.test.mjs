import test from 'node:test';
import assert from 'node:assert/strict';
import {axisRows,RAW_CORNERS,FOOT_PROFILES,fitCorners,BAR_MEASUREMENT} from '../dist/ride-calibration.mjs';
import {barPoint,solveBar} from '../dist/fit-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('New campaign uses axis coordinates unchanged and rejects historical edge data',()=>{
 const row={reference:'axis',bbFloor:257,barFloor:852.5,x:402};
 assert.deepEqual(axisRows([row]),[row]);assert.equal(BAR_MEASUREMENT.correction,0);
 assert.throws(()=>axisRows([{...row,reference:'rear-top-edge'}]));
 const p=FOOT_PROFILES.find(p=>p.id==='none');near(p.handlebar.origin.x,402);near(p.handlebar.origin.y,595.875);
});
test('New measured envelopes retain accepted handlebar status and invert both adjustments',()=>{
 for(const [id,rows] of Object.entries(RAW_CORNERS)){
  const p=FOOT_PROFILES.find(p=>p.id===id),c=p.handlebar;
  const fit=fitCorners(rows);assert.deepEqual(c.origin,fit.origin);
  for(const row of rows){const point=barPoint(c,row.u,row.v);assert.ok(Math.abs(point.x-row.x)<=.375+1e-8);assert.ok(Math.abs(point.y-(row.barFloor-row.bbFloor))<=.375+1e-8);}
  const point=barPoint(c,12/23,12/23),solution=solveBar(point,c);
  near(solution.u,12/23);near(solution.v,12/23);
  assert.equal(p.status,'validated');assert.equal(p.handlebar.status,'validated');
  assert.equal(p.validation.repeatabilityTested,false);assert.equal(p.validation.controlUsedInFit,false);assert.equal(p.measuredAt,'2026-09-16');
  assert.equal(p.hand.status,'validated');assert.equal(p.saddle.status,'measured-approximation');
 }
});
test('Medium uses only the new complete campaign, with no stale radius or corner values',()=>{
 const [a,b,c,d]=RAW_CORNERS.medium;
 near(a.barFloor+d.barFloor-b.barFloor-c.barFloor,-.5);
 assert.equal(a.barFloor,871);assert.equal(c.barFloor,885);
 assert.equal(FOOT_PROFILES.find(p=>p.id==='none').footHeight,null);
});
