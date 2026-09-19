import test from 'node:test';
import assert from 'node:assert/strict';
import {target,solve,nominalCheck} from '../dist/geometry.mjs';
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const bike={stack:560,reach:385,head:60,cover:10,spacers:20,stemStack:40,stem:100,angle:-30,height:750,setback:210,heightType:'radial',point:'clamp',crank:170,rideCrank:170};
const calibration={x0:450,y0:600,x1:422,y1:696,aStep:100,x2:490,y2:600,bStep:40,aMin:-20,aMax:100,bMin:-30,bMax:50};

test('Horizontal stem and sloped steerer use headset, spacers and half clamp height',()=>{
  const t=target(bike);
  near(t.clamp.x,460);near(t.clamp.y,560+25*Math.sqrt(3));
  near(t.saddle.x,-210);near(t.saddle.y,720);near(t.drop,720-t.clamp.y);
});
test('Flipping a stem changes both horizontal and vertical displacement',()=>{
  const low=target({...bike,head:73,angle:-6}),high=target({...bike,head:73,angle:6});
  assert.ok(high.clamp.y>low.clamp.y);assert.ok(high.clamp.x<low.clamp.x);
});
test('Saddle height measurement types and forward setback retain coordinate convention',()=>{
  near(target({...bike,heightType:'vertical'}).saddle.y,750);
  near(target({...bike,setback:-30}).saddle.x,30);
  assert.throws(()=>target({...bike,setback:751}),/Sattelversatz/);
  assert.throws(()=>target({...bike,height:null}),/Zahlen/);
});
test('Hand contact offsets produce a different Ride clamp while matching the hands',()=>{
  const t=target({...bike,point:'hoods',bikeHandX:100,bikeHandY:15,rideHandX:80,rideHandY:30});
  near(t.rideClamp.x,t.clamp.x+20);near(t.rideClamp.y,t.clamp.y-15);
  near(t.rideClamp.x+80,t.hand.x);near(t.rideClamp.y+30,t.hand.y);
  assert.throws(()=>target({...bike,point:'hoods'}),/Zahlen/);
});
test('Coupled height and fore/aft movement is inverted in physical slider millimetres',()=>{
  const result=solve({x:449.8,y:624},calibration);
  assert.equal(result.status,'reachable');near(result.moves.a,25);near(result.moves.b,6.8);
  near(result.achieved.x,449.8);near(result.achieved.y,624);
});
test('Calibrated tilted fore/aft slide is solved without assuming horizontal travel',()=>{
  const c={x0:-180,y0:700,x1:-186,y1:719,aStep:20,x2:-170,y2:701,bStep:10};
  const result=solve({x:-179,y:709.9},c);
  near(result.moves.a,10);near(result.moves.b,4);assert.equal(result.status,'unbounded');
});
test('Missing calibration and missing limits never claim an achievable setting',()=>{
  assert.equal(solve({x:0,y:0},{}).status,'missing');
  const c={...calibration,aMin:null,aMax:null,bMin:null,bMax:null};
  assert.equal(solve({x:450,y:600},c).status,'unbounded');
  assert.throws(()=>solve({x:450,y:600},{...c,aMin:-20}),/vier/);
});
test('Outside-range targets preserve requested movements and report residual at bounded position',()=>{
  const r=solve({x:408,y:744},calibration);
  assert.equal(r.status,'outside');near(r.moves.a,150);near(r.moves.b,0);
  near(r.limited.a,100);near(r.residual.x,14);near(r.residual.y,-48);
});
test('Coincident / collinear calibration poses and inverted bounds fail intentionally',()=>{
  assert.throws(()=>solve({x:450,y:600},{...calibration,x2:422,y2:696}),/nicht eindeutig/);
  assert.throws(()=>solve({x:450,y:600},{...calibration,aStep:0}),/null/);
  assert.throws(()=>solve({x:450,y:600},{...calibration,aMin:20}),/Grenzen/);
});
test('Nominal envelope is separate from actual calibration and detects low bar targets',()=>{
  const t=target(bike);assert.equal(nominalCheck(t).length,0);
  const warnings=nominalCheck({...t,rideClamp:{x:450,y:590}});
  assert.deepEqual(warnings.map(w=>w.name),['Lenker Y']);
});
test('Different crank lengths remain an explicit mismatch',()=>near(target({...bike,rideCrank:165}).crankDelta,-5));
