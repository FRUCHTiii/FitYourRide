import test from 'node:test';
import assert from 'node:assert/strict';
import {FOOT_PROFILES,RAW_SADDLE,SADDLE_CONTACT} from '../dist/ride-calibration.mjs';
import {measuredSaddlePoint,solveMeasuredSaddle,evaluateFit,liftedProfile} from '../dist/fit-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const input={mode:'direct',point:'clamp',directX:480,directY:650,includeSaddle:true,saddleMode:'measured',heightType:'radial',saddleAngle:null};
test('All measured saddle endpoints and independent M controls retain their own BB reference',()=>{
 for(const p of FOOT_PROFILES){
  const raw=RAW_SADDLE[p.id],c=p.saddle;
  for(const [index,floor,setback] of [raw.axis[0],raw.axis[2]]){
   const pt=measuredSaddlePoint(c,index/23,0,0);
   near(pt.x,-setback+2.75);near(pt.y,floor-raw.bbFloor+52);
  }
  assert.equal(c.control.usedInFit,false);
  assert.ok(Math.abs(c.control.residual.x)<2.4);assert.ok(Math.abs(c.control.residual.y)<2.4);
 }
 assert.equal(RAW_SADDLE.large.axis[2][1],1040);
 assert.equal(RAW_SADDLE.medium.bbFloor,266.5);
});
test('Actual measured mount shifts replace nominal 20/40/60 and preserve vertical change',()=>{
 const p=FOOT_PROFILES.find(p=>p.id==='medium').saddle;
 assert.deepEqual(p.mounts.map(m=>m.offset),[{x:0,y:0},{x:20,y:1.5},{x:38.5,y:3.5},{x:59.5,y:6.5}]);
 assert.equal(SADDLE_CONTACT.verticalOffset,52);
 near(SADDLE_CONTACT.railRange[1]-SADDLE_CONTACT.railRange[0],21.5);
 const base=measuredSaddlePoint(p,.5,0,0),front=measuredSaddlePoint(p,.5,0,10.75),rear=measuredSaddlePoint(p,.5,0,-10.75);
 near(front.x-base.x,10.75);near(rear.x-base.x,-10.75);
});
test('All four feet solve diagonal height and setback with real discrete mounts and rail motion',()=>{
 for(const p of FOOT_PROFILES)for(const clamp of [0,20,40,60]){
  const point=measuredSaddlePoint(p.saddle,.55,clamp,2);
  const r=evaluateFit({...input,height:Math.hypot(point.x,point.y),setback:-point.x},[p]).profiles[0];
  assert.equal(r.saddle.status,'reachable');near(r.saddle.achieved.x,point.x);near(r.saddle.achieved.y,point.y);
  assert.ok([0,20,40,60].includes(r.saddle.moves.clamp));
  assert.equal(r.approximate,true);assert.equal(r.ready,false);
  const reserves=r.saddle.alternatives.map(a=>a.railReserve);
  near(r.saddle.railReserve,Math.max(...reserves));
 }
});
test('A–X and rail bounds include endpoints but never silently clamp impossible goals',()=>{
 const c=FOOT_PROFILES[2].saddle;
 for(const fraction of [0,1])for(const rail of [-10.75,10.75]){
  const r=solveMeasuredSaddle(measuredSaddlePoint(c,fraction,0,rail),c);
  assert.equal(r.status,'reachable');
 }
 for(const goal of [{x:-1000,y:700},{x:0,y:300},{x:-200,y:1100}]){
  const r=solveMeasuredSaddle(goal,c);assert.equal(r.status,'outside');assert.equal(r.moves,undefined);
 }
});
test('Height-only solves radial height at centered rails and normally selects mount zero',()=>{
 for(const p of FOOT_PROFILES){
  const result=evaluateFit({...input,height:740,setback:null},[p]);
  const r=result.profiles[0];assert.equal(result.target.heightOnly,true);
  assert.equal(r.saddle.status,'reachable');near(Math.hypot(r.saddle.achieved.x,r.saddle.achieved.y),740);
  near(r.saddle.moves.rail,0);assert.equal(r.saddle.moves.clamp,0);
 }
});
test('Vertical height is distinct from diagonal input; invalid radial setback is rejected',()=>{
 const p=FOOT_PROFILES[2];
 const r=evaluateFit({...input,height:720,heightType:'vertical',setback:200},[p]).profiles[0];
 near(r.saddle.achieved.y,720);near(r.saddle.achieved.x,-200);
 assert.throws(()=>evaluateFit({...input,height:200,setback:210},[p]));
});
test('Trainer lift integrates the saddle point, mount offset and rails without changing raw measurements',()=>{
 const p=FOOT_PROFILES[2],before=JSON.stringify(p),q=liftedProfile(p,30);
 const pt=measuredSaddlePoint(q.saddle,.5,40,2);
 const r=evaluateFit({...input,trainerLift:30,height:Math.hypot(pt.x,pt.y),setback:-pt.x},[p]).profiles[0];
 assert.equal(r.saddle.status,'reachable');near(r.saddle.achieved.x,pt.x);near(r.saddle.achieved.y,pt.y);
 assert.equal(JSON.stringify(p),before);
});
