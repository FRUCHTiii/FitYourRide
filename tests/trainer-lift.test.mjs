import test from 'node:test';
import assert from 'node:assert/strict';
import {TRAINER_GEOMETRY,trainerTilt,rotateForLift,liftedProfile,evaluateFit,barPoint,saddlePoint,suggestTrainerLift} from '../dist/fit-model.mjs';
import {FOOT_PROFILES} from '../dist/ride-calibration.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const input={mode:'direct',point:'clamp',directX:480,directY:650,includeSaddle:false};
const p=FOOT_PROFILES.find(p=>p.id==='medium');
test('Trainer lift obeys estimated support geometry and rotates forward without translating BB coordinates',()=>{
 const t=trainerTilt(20),g=TRAINER_GEOMETRY;
 near(g.supportDistance*Math.sin(t)+g.axleHeight*(Math.cos(t)-1),20);
 const v=rotateForLift({x:500,y:600},t);near(v.x,511.56030538640914);near(v.y,590.1745961602921);
 near(Math.hypot(v.x,v.y),Math.hypot(500,600));
 assert.deepEqual(rotateForLift({x:0,y:0},t),{x:0,y:0});
 for(const h of [-1,101,Infinity,NaN])assert.throws(()=>trainerTilt(h));
});
test('Zero lift retains profile identity, validation and original calibration without mutation',()=>{
 const before=JSON.stringify(FOOT_PROFILES);assert.equal(liftedProfile(p,0),p);
 assert.deepEqual(evaluateFit(input,[p]),evaluateFit({...input,trainerLift:0},[p]));
 assert.equal(evaluateFit(input,[p]).profiles[0].ready,true);
 liftedProfile(p,20);assert.equal(JSON.stringify(FOOT_PROFILES),before);
});
test('All vectors, hoods, discrete saddle mounts and contact offset rotate coherently',()=>{
 const t=trainerTilt(20),q=liftedProfile(p,20),point=barPoint(p.handlebar,.4,.3),rot=rotateForLift(point,t),next=barPoint(q.handlebar,.4,.3);
 near(rot.x,next.x);near(rot.y,next.y);
 const hand=rotateForLift({x:point.x+p.hand.offset.x,y:point.y+p.hand.offset.y},t);
 near(next.x+q.hand.offset.x,hand.x);near(next.y+q.hand.offset.y,hand.y);
 assert.equal(q.saddle.angle,null);
 const m={height:.5,clamp:40,rail:3},s=rotateForLift(saddlePoint(p.saddle,m),t),ss=saddlePoint(q.saddle,m);
 near(s.x,ss.x);near(s.y,ss.y);
 const result=evaluateFit({...input,trainerLift:20},[p]).profiles[0];
 assert.equal(result.approximate,true);assert.equal(result.ready,false);
});
test('Lift suggestion returns an actually reachable rounded lift and handles no solution',()=>{
 assert.equal(suggestTrainerLift(input,p).height,0);
 const low={...input,directX:500,directY:590},s=suggestTrainerLift(low,p);
 assert.equal(evaluateFit(low,[p]).profiles[0].reachable,false);
 assert.equal(s.status,'found');assert.ok(s.height>0);
 assert.equal(evaluateFit({...low,trainerLift:s.height},[p]).profiles[0].reachable,true);
 assert.equal(suggestTrainerLift({...input,directX:2000},p).status,'not-found');
});
test('Search includes requested saddle constraints and does not recommend cockpit-only success',()=>{
 const v={...input,includeSaddle:true,height:2000,setback:100,heightType:'vertical',saddleAngle:0};
 assert.equal(suggestTrainerLift(v,p).status,'not-found');
});
