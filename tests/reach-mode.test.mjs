import test from 'node:test';
import assert from 'node:assert/strict';
import {makeTarget,evaluateFit,barPoint} from '../dist/fit-model.mjs';
import {FOOT_PROFILES} from '../dist/ride-calibration.mjs';
const base={mode:'direct',point:'reach',directX:480,directY:650,includeSaddle:false,bikeBarReach:70};
test('Reach mode applies the difference once, preserves Y, and creates no hand point',()=>{
 const t=makeTarget({...base,bikeHandX:100,bikeHandY:50});
 assert.deepEqual(t.clamp,{x:465,y:650});assert.deepEqual(t.targetClamp,{x:480,y:650});
 assert.equal(t.hand,null);assert.equal(t.reachDelta,-15);assert.equal(t.approximate,true);
 for(const reach of [85,100])assert.equal(makeTarget({...base,bikeBarReach:reach}).clamp.x,480+reach-85);
});
test('Frame and direct modes produce the same reach adjustment',()=>{
 const frame={...base,mode:'frame',stack:560,reach:385,head:73,cover:10,spacers:20,stemStack:40,stem:100,angle:-6};
 const clamp=makeTarget({...frame,point:'clamp'}).clamp,t=makeTarget(frame);
 assert.deepEqual(t.clamp,{x:clamp.x-15,y:clamp.y});assert.deepEqual(t.targetClamp,clamp);
});
test('Hidden target reach does not affect either original mode; missing reach fails only in reach mode',()=>{
 assert.deepEqual(makeTarget({...base,point:'clamp',bikeBarReach:100}).clamp,{x:480,y:650});
 assert.deepEqual(makeTarget({...base,point:'hoods',bikeBarReach:100}).hand,{x:480,y:650});
 for(const value of [null,undefined,NaN,Infinity,-1,201])assert.throws(()=>makeTarget({...base,bikeBarReach:value}),/Lenker-Reach/);
});
test('Corrected target drives inverse settings and reachability, never verified hand transfer',()=>{
 const p=FOOT_PROFILES.find(p=>p.id==='medium');
 const r=evaluateFit(base,[p]).profiles[0];assert.equal(r.reachable,true);assert.equal(r.ready,false);
 const actual=barPoint(p.handlebar,r.bar.u,r.bar.v);
 assert.ok(Math.abs(actual.x-465)<1e-8);assert.ok(Math.abs(actual.y-650)<1e-8);
 assert.equal(evaluateFit({...base,point:'clamp'},[p]).profiles[0].ready,true);
 const corner=barPoint(p.handlebar,0,0);
 const edge={...base,directX:corner.x,directY:corner.y};
 assert.equal(evaluateFit({...edge,point:'clamp'},[p]).profiles[0].reachable,true);
 assert.equal(evaluateFit(edge,[p]).profiles[0].bar.status,'outside');
});
