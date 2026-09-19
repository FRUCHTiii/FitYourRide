import test from 'node:test';
import assert from 'node:assert/strict';
import {RAW_MEDIUM,MEASURED_MEDIUM_BAR,FOOT_PROFILES,BAR_SCALES,fitCorners} from '../dist/ride-calibration.mjs';
import {barPoint,solveBar,solveSaddle,saddlePoint,scalePosition,saddleAtAngle,geometrySaddleTarget,evaluateFit,recommend,makeTarget} from '../dist/fit-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const bike={mode:'frame',stack:560,reach:385,head:73,cover:10,spacers:20,stemStack:40,stem:100,angle:-6,height:740,setback:190,crank:170,rideCrank:170,heightType:'radial',point:'hoods',saddleAngle:0,bikeHandX:120,bikeHandY:15,width:400};
test('All four measured corners are fitted with documented residuals and correct reach/height order',()=>{
 const c=fitCorners(RAW_MEDIUM);assert.deepEqual(c.origin,{x:396.5,y:600.75});assert.deepEqual(c.reach,{x:164,y:10.5});assert.deepEqual(c.height,{x:-41,y:150.5});
 for(const row of RAW_MEDIUM){const p=barPoint(c,row.u,row.v);near(Math.abs(p.x-row.x),.5);near(Math.abs(p.y-(row.barFloor-row.bbFloor)),.25);}
 const ax=solveBar({x:355.5,y:751.25},c);near(ax.u,0);near(ax.v,1);assert.equal(ax.status,'reachable');
});
test('Scale endpoints use 23 intervals, preserve fractional mm, and never invent Y',()=>{
 assert.deepEqual(scalePosition(1,164),{letter:'X',next:null,rest:0,total:164});
 assert.equal(scalePosition(0,158.5).letter,'A');
 const m=scalePosition(12/23,164);assert.equal(m.letter,'M');near(m.rest,0);
 const fractional=scalePosition(9.5/23,164);assert.equal(fractional.letter,'J');near(fractional.rest,164/46);
 assert.equal(scalePosition(-.01,164),null);assert.equal(scalePosition(1.01,164),null);
});
test('A goal inside rectangular X/Y extrema can still be outside the physical polygon',()=>{
 const r=solveBar({x:355.5,y:600.75},MEASURED_MEDIUM_BAR);assert.equal(r.status,'outside');assert.ok(r.distance>35);
 const c=MEASURED_MEDIUM_BAR;const projection=solveBar(r.achieved,c);assert.equal(projection.status,'reachable');
 near(Math.hypot(r.residual.x,r.residual.y),r.distance);
});
test('Closest point is on the correct sloped boundary, not independent axis clipping',()=>{
 const c={origin:{x:0,y:0},reach:{x:100,y:0},height:{x:50,y:100},reachRange:[0,1],heightRange:[0,1]};
 const r=solveBar({x:0,y:100},c);assert.equal(r.status,'outside');near(r.achieved.x,40);near(r.achieved.y,80);near(r.distance,Math.sqrt(2000));
});
const saddle={origin:{x:0,y:600},height:{x:0,y:1},clamp:{x:1,y:0},rail:{x:1,y:0},bounds:{height:[0,100],clamp:[0,100],rail:[-20,20]}};
test('New clamp and rail preserve rail reference whenever feasible',()=>{
 const r=solveSaddle({x:90,y:650},saddle);assert.equal(r.status,'reachable');assert.deepEqual(r.moves,{height:50,clamp:90,rail:0});
});
test('C stays centered even when moving the rails could make an unreachable target fit',()=>{
 for(const goal of [{x:115,y:650},{x:-10,y:650},{x:120,y:700}]){
   const r=solveSaddle(goal,saddle);assert.equal(r.status,'outside');assert.equal(r.moves,undefined);
 }
 const edge=solveSaddle({x:100,y:700},saddle);assert.equal(edge.status,'reachable');assert.deepEqual(edge.moves,{height:100,clamp:100,rail:0});
});
test('Tilted A/B axes preserve the point at centered C',()=>{
 const c={...saddle,height:{x:-.3,y:1}},goal=saddlePoint(c,{height:42,clamp:50,rail:0}),r=solveSaddle(goal,c);
 assert.equal(r.status,'reachable');near(r.moves.rail,0);near(r.moves.height,42);near(r.moves.clamp,50);near(r.achieved.x,goal.x);near(r.achieved.y,goal.y);
});
test('Four feet share a target; approximate saddle still prevents full validation',()=>{
 const e=evaluateFit(bike,FOOT_PROFILES);assert.equal(e.profiles.length,4);assert.ok(e.profiles.every(r=>!r.ready));
 const mid=e.profiles.find(p=>p.id==='medium');assert.equal(mid.reachable,true);assert.notEqual(e.profiles[0].bar.v,mid.bar.v);
 near(mid.clamp.x,e.target.hand.x-123);near(mid.clamp.y,e.target.hand.y-24.5);assert.equal(recommend(e.profiles,'medium').id,'medium');
});
test('Whole-fit reachability includes saddle and width, not just the handlebar',()=>{
 assert.ok(evaluateFit({...bike,height:1100},FOOT_PROFILES).profiles.every(r=>!r.reachable));
 assert.ok(evaluateFit({...bike,width:450},FOOT_PROFILES).profiles.every(r=>!r.reachable));
 assert.equal(recommend(evaluateFit({...bike,height:1100},FOOT_PROFILES).profiles,'medium'),null);
});
test('Missing calibration never grants reachability or verified status',()=>{
 const p=structuredClone(FOOT_PROFILES[1]);p.hand=null;p.saddle=null;p.handlebar=null;
 const r=evaluateFit(bike,[p]).profiles[0];assert.equal(r.bar.status,'missing');assert.equal(r.saddle.status,'missing');assert.equal(r.reachable,false);assert.equal(r.ready,false);
});
test('Saddle approximation cannot become exact by changing only its status flag',()=>{
 const p=structuredClone(FOOT_PROFILES[1]);p.status='validated';p.hand.status='validated';p.saddle.status='validated';
 assert.equal(evaluateFit(bike,[p]).profiles[0].ready,false);
 assert.equal(evaluateFit({...bike,includeSaddle:false},[p]).profiles[0].ready,true);
 assert.equal(evaluateFit({...bike,includeSaddle:false,width:360},[p]).profiles[0].ready,false);
});
test('Direct effective hood coordinates do not get treated as frame reach and stack',()=>{
 const t=makeTarget({...bike,mode:'direct',directX:520,directY:587});assert.deepEqual(t.hand,{x:520,y:587});assert.equal(t.clamp,null);
 near(t.saddle.y,Math.sqrt(740**2-190**2));assert.throws(()=>makeTarget({...bike,mode:'direct',directX:null,directY:600}));
});
test('Bad calibration and empty or impossible saddle coordinates fail explicitly',()=>{
 assert.throws(()=>solveBar({x:1,y:2},{...MEASURED_MEDIUM_BAR,height:{x:164,y:10.5}}),/unabhängig/);
 assert.throws(()=>solveSaddle({x:1,y:650},{...saddle,rail:null}),/fehlt/);
 assert.throws(()=>makeTarget({...bike,mode:'direct',directX:500,directY:600,height:100,setback:200}));
 assert.equal(BAR_SCALES.heightTravel,158.5);
});

test('Frame and cockpit work without measured saddle position, width or crank',()=>{
 const input={...bike,point:'clamp',includeSaddle:false,height:null,setback:null,saddleAngle:null,width:null,crank:null,rideCrank:null};
 const r=evaluateFit(input,FOOT_PROFILES);
 assert.equal(r.target.saddle,null);assert.equal(r.target.drop,null);assert.equal(r.target.crankDelta,null);
 assert.equal(r.profiles[1].saddle.status,'not-requested');assert.equal(r.profiles[1].scope,'cockpit');assert.equal(r.profiles[1].reachable,true);
});
test('Seat tube angle never supplies a saddle position or saddle tilt',()=>{
 const a=makeTarget({...bike,includeSaddle:false,seatAngle:73.5});const b=makeTarget({...bike,includeSaddle:false,seatAngle:75});
 assert.deepEqual(a.clamp,b.clamp);assert.equal(a.saddle,null);assert.equal(a.saddleAngle,null);
 assert.equal(makeTarget({...bike,seatAngle:73.5,saddleAngle:null}).saddleAngle,null);
});
test('Hood offsets are required only for hood transfer, without any zero fallback',()=>{
 const v={...bike,includeSaddle:false,bikeHandX:null,bikeHandY:null};
 assert.ok(makeTarget({...v,point:'clamp'}).clamp);
 assert.throws(()=>makeTarget(v),/Hood-Offsets/);
 const direct=makeTarget({...v,mode:'direct',point:'clamp',directX:450,directY:640});
 assert.deepEqual(direct.clamp,{x:450,y:640});assert.equal(direct.hand,null);
});
test('Manual saddle tilt does not invent an unmeasured positional correction',()=>{
 const zero=evaluateFit({...bike,saddleAngle:0},FOOT_PROFILES).profiles[1];
 const tilted=evaluateFit({...bike,saddleAngle:-5},FOOT_PROFILES).profiles[1];
 assert.equal(tilted.saddle.status,'reachable');assert.deepEqual(tilted.saddle.moves,zero.saddle.moves);
 assert.equal(tilted.ready,false);assert.equal(tilted.approximate,true);
 assert.equal(saddleAtAngle(FOOT_PROFILES[1].saddle,-5).angleValidated,false);
});

test('Saddle geometry includes seat-tube angle, horizontal post setback and height',()=>{
 const ref={x:0,y:0,angle:0},v={seatAngle:73.5,height:700,heightType:'vertical',saddleAngle:0,postSetback:0};
 const a=geometrySaddleTarget(v,ref),b=geometrySaddleTarget({...v,seatAngle:75},ref),c=geometrySaddleTarget({...v,seatAngle:75,postSetback:20},ref);
 near(a.y,700);assert.equal(Math.round((b.x-a.x)*100)/100,19.79);
 near(c.x,b.x-20);near(c.y,b.y);
 const high=geometrySaddleTarget({...v,height:750},ref),highSteep=geometrySaddleTarget({...v,height:750,seatAngle:75},ref);
 assert.ok(highSteep.x-high.x>b.x-a.x);
});
test('Radial height remains exact with a nonzero saddle contact offset and setback',()=>{
 const p=geometrySaddleTarget({seatAngle:74,height:740,heightType:'radial',saddleAngle:-3,postSetback:20});
 near(Math.hypot(p.x,p.y),740);
});
test('Measured saddle coordinates already include setback and do not apply it twice',()=>{
 const a=makeTarget({...bike,saddleMode:'measured',postSetback:0}),b=makeTarget({...bike,saddleMode:'measured',postSetback:25,seatAngle:75});
 assert.deepEqual(a.saddle,b.saddle);
 assert.throws(()=>geometrySaddleTarget({seatAngle:null,height:700,heightType:'vertical',saddleAngle:0,postSetback:0}));
});

test('Accepted hood offsets retain width scope and allow cockpit-only validation',()=>{
 const offsets={none:{x:124,y:21.5},small:{x:123,y:24.5},medium:{x:123,y:24.5},large:{x:124,y:26.5}};
 for(const p of FOOT_PROFILES){
  assert.deepEqual(p.hand.offset,offsets[p.id]);
  assert.equal(p.hand.leftSymmetry,'user-confirmed-not-measured');
  const r=evaluateFit({...bike,includeSaddle:false,width:400},[p]).profiles[0];
  near(r.clamp.x+offsets[p.id].x,makeTarget({...bike,includeSaddle:false}).hand.x);
  near(r.clamp.y+offsets[p.id].y,makeTarget({...bike,includeSaddle:false}).hand.y);
  assert.equal(r.ready,true);
  assert.equal(p.hand.additionalChecksWaived,true);
  assert.equal(evaluateFit({...bike,includeSaddle:false,width:360},[p]).profiles[0].widthCalibrated,false);
 }
});
