import {cockpitTarget,saddleTarget} from './geometry.mjs';
import {BAR_SCALES,HARDWARE} from './ride-calibration.mjs';
const EPS=1e-7;
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
const mul=(v,s)=>({x:v.x*s,y:v.y*s});
const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
const inside=(v,[lo,hi])=>v>=lo-EPS&&v<=hi+EPS;
const bound=(v,[lo,hi])=>Math.max(lo,Math.min(hi,v));
function inverse(p,a,b) {
  const det=a.x*b.y-a.y*b.x;
  if(!finite(p)||!finite(a)||!finite(b)||Math.abs(det)<1e-8*Math.max(1,Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y)))throw new Error('Die Kalibrierachsen sind ungültig oder nicht unabhängig.');
  return [(p.x*b.y-p.y*b.x)/det,(a.x*p.y-a.y*p.x)/det];
}
function boundsValid(ranges){if(ranges.some(r=>!Array.isArray(r)||r.length!==2||r.some(n=>!Number.isFinite(n))||r[0]>=r[1]||r[0]>0||r[1]<0))throw new Error('Ungültige Kalibriergrenzen.');}
export function barPoint(c,u,v){return add(c.origin,add(mul(c.reach,u),mul(c.height,v)));}
export function barPolygon(c){return [[c.reachRange[0],c.heightRange[0]],[c.reachRange[1],c.heightRange[0]],[c.reachRange[1],c.heightRange[1]],[c.reachRange[0],c.heightRange[1]]].map(([u,v])=>barPoint(c,u,v));}
// Closest physical point in the reachable parallelogram, in XY Euclidean distance.
export function solveBar(goal,c) {
  if(!c)return {status:'missing'};
  boundsValid([c.reachRange,c.heightRange]);
  const [u,v]=inverse(sub(goal,c.origin),c.reach,c.height);
  if(inside(u,c.reachRange)&&inside(v,c.heightRange))return {status:'reachable',u:bound(u,c.reachRange),v:bound(v,c.heightRange),achieved:goal,residual:{x:0,y:0},distance:0};
  const poly=barPolygon(c);let best;
  for(let i=0;i<4;i++){
    const a=poly[i],d=sub(poly[(i+1)%4],a),delta=sub(goal,a);
    const t=bound((delta.x*d.x+delta.y*d.y)/(d.x*d.x+d.y*d.y),[0,1]);
    const achieved=add(a,mul(d,t)),residual=sub(achieved,goal),distance=Math.hypot(residual.x,residual.y);
    if(!best||distance<best.distance)best={achieved,residual,distance};
  }
  return {status:'outside',u,v,...best};
}
// Discrete mounting positions and a measured horizontal rail window.
export function measuredSaddlePoint(c,fraction,mountPosition,rail=0){
  const mount=c.mounts.find(m=>m.position===mountPosition);
  if(!mount)throw new Error('Unbekannte Sattelklemmposition.');
  return add(add(c.origin,mul(c.height,fraction)),add(mount.offset,add(c.contact,mul(c.rail,rail))));
}
export function solveMeasuredSaddle(goal,c,options={}){
  if(!c)return {status:'missing'};
  if(c.kind!=='discrete-saddle')throw new Error('Gemessene Sattelkalibrierung fehlt.');
  const candidates=[];
  for(const mount of c.mounts){
    const base=measuredSaddlePoint(c,0,mount.position,0);
    let fractions,rail=0;
    if(options.heightOnly){
      const H=options.height;
      if(!Number.isFinite(H)||H<=0)throw new Error('Sattelhöhe eingeben.');
      if(options.heightType==='vertical')fractions=[(H-base.y)/c.height.y];
      else if(options.heightType==='radial'){
        const A=c.height.x**2+c.height.y**2,B=2*(base.x*c.height.x+base.y*c.height.y),C=base.x**2+base.y**2-H**2,D=B*B-4*A*C;
        fractions=D<0?[]:[(-B+Math.sqrt(D))/(2*A),(-B-Math.sqrt(D))/(2*A)];
      }else throw new Error('Unbekannte Höhenmessung.');
    }else{
      if(!finite(goal))throw new Error('Sattelziel unvollständig.');
      const solution=inverse(sub(goal,base),c.height,c.rail);
      fractions=[solution[0]];rail=solution[1];
    }
    for(const fraction of fractions){
      if(!Number.isFinite(fraction)||!inside(fraction,c.heightRange)||!inside(rail,c.railRange))continue;
      const moves={height:bound(fraction,c.heightRange),clamp:mount.position,rail:bound(rail,c.railRange)};
      const achieved=measuredSaddlePoint(c,moves.height,moves.clamp,moves.rail);
      candidates.push({status:'reachable',moves,achieved,target:options.heightOnly?achieved:goal,
        railFraction:(moves.rail-c.railRange[0])/(c.railRange[1]-c.railRange[0]),
        railReserve:Math.min(moves.rail-c.railRange[0],c.railRange[1]-moves.rail),approximate:true});
    }
  }
  candidates.sort((a,b)=>b.railReserve-a.railReserve||a.moves.clamp-b.moves.clamp);
  return candidates.length?{...candidates[0],alternatives:candidates.map(c=>({moves:c.moves,railReserve:c.railReserve}))}:{status:'outside',approximate:true};
}
export function saddlePoint(c,m){if(c.kind==='discrete-saddle')return measuredSaddlePoint(c,m.height,m.clamp,m.rail);return add(c.origin,add(mul(c.height,m.height),add(mul(c.clamp,m.clamp),mul(c.rail,m.rail))));}
// A = height, B = Ride carriage. C stays centered and is reserved for the fitter.
export function solveSaddle(goal,c) {
  if(c?.kind==='discrete-saddle')return solveMeasuredSaddle(goal,c);
  if(!c)return {status:'missing'};
  boundsValid([c.bounds.height,c.bounds.clamp,c.bounds.rail]);
  if(!finite(c.rail))throw new Error('Sattelschienen-Kalibrierung fehlt.');
  const [height,clamp]=inverse(sub(goal,c.origin),c.height,c.clamp);
  if(!inside(height,c.bounds.height)||!inside(clamp,c.bounds.clamp))return {status:'outside'};
  const moves={height:bound(height,c.bounds.height),clamp:bound(clamp,c.bounds.clamp),rail:0};
  return {status:'reachable',moves,achieved:saddlePoint(c,moves)};
}
export function scalePosition(fraction,travel){
  if(!Number.isFinite(fraction)||fraction < -EPS||fraction>1+EPS)return null;
  const position=bound(fraction,[0,1])*BAR_SCALES.intervals;
  let index=Math.floor(position+EPS),rest=(position-index)*travel/BAR_SCALES.intervals;
  if(rest<0)rest=0;
  if(travel/BAR_SCALES.intervals-rest<0.05&&index<23){index++;rest=0;}
  return {letter:String.fromCharCode(65+index),next:index<23?String.fromCharCode(66+index):null,rest,total:bound(fraction,[0,1])*travel};
}
// Angle-specific calibrated affine models. No extrapolation beyond measured angles.
export function saddleAtAngle(c,angle){
  if(!c)return {status:'missing'};
  if(c.kind==='discrete-saddle')return {status:'available',calibration:c,angleValidated:false,manualAngle:angle};
  if(!Number.isFinite(angle))return {status:'angle-missing'};
  if(Math.abs(angle-c.angle)<EPS)return {status:'available',calibration:c,angleValidated:true};
  const samples=[{angle:c.angle,origin:c.origin,height:c.height,clamp:c.clamp,rail:c.rail},...(c.tiltSamples||[])].sort((a,b)=>a.angle-b.angle);
  const exact=samples.find(s=>Math.abs(s.angle-angle)<EPS);
  if(exact)return {status:'available',calibration:{...c,...exact},angleValidated:true};
  const index=samples.findIndex(s=>s.angle>angle);
  if(index<=0)return {status:'angle-outside'};
  const a=samples[index-1],b=samples[index],f=(angle-a.angle)/(b.angle-a.angle),calibration={...c,angle};
  for(const key of ['origin','height','clamp','rail']){
    if(!finite(a[key])||!finite(b[key]))throw new Error('Sattel-Winkelkalibrierung unvollständig.');
    calibration[key]=add(a[key],mul(sub(b[key],a[key]),f));
  }
  return {status:'available',calibration,angleValidated:c.angleInterpolationValidated===true};
}
// Reference placement on the target seat axis with the SAME saddle and centered C.
// A horizontal target-post setback is separate from the seat-tube angle.
export function geometrySaddleTarget(v,reference=HARDWARE.saddleContact){
  if(!Number.isFinite(v.seatAngle)||v.seatAngle<=0||v.seatAngle>=90||!Number.isFinite(v.height)||v.height<=0)throw new Error('Sitzrohrwinkel und Arbeitshöhe eingeben.');
  if(!Number.isFinite(v.postSetback)||!Number.isFinite(v.saddleAngle)||!finite(reference)||!Number.isFinite(reference.angle))throw new Error('Sattel-/Stützenbezug für die Geometriesimulation unvollständig.');
  const a=v.seatAngle*Math.PI/180,d={x:-Math.cos(a),y:Math.sin(a)},r=(v.saddleAngle-reference.angle)*Math.PI/180;
  const o={x:reference.x*Math.cos(r)-reference.y*Math.sin(r)-v.postSetback,y:reference.x*Math.sin(r)+reference.y*Math.cos(r)};
  let q;
  if(v.heightType==='vertical')q=(v.height-o.y)/d.y;
  else if(v.heightType==='radial'){
    const dot=d.x*o.x+d.y*o.y,disc=dot*dot+v.height*v.height-o.x*o.x-o.y*o.y;
    if(disc<0)throw new Error('Arbeitshöhe mit diesem Sattelbezug nicht möglich.');
    q=-dot+Math.sqrt(disc);
  }else throw new Error('Unbekannte Höhenmessung.');
  if(q<=0)throw new Error('Arbeitshöhe liegt unter dem Sattelbezug.');
  return add(mul(d,q),o);
}
export function makeTarget(v){
  if(!['clamp','reach','hoods'].includes(v.point))throw new Error('Kontaktpunkt auswählen.');
  let cockpit,hand=null;
  if(v.mode==='frame'){
    cockpit=cockpitTarget(v);
    if(v.point==='hoods'){
      if(!Number.isFinite(v.bikeHandX)||!Number.isFinite(v.bikeHandY))throw new Error('Für die Handposition werden gemessene Hood-Offsets benötigt.');
      hand={x:cockpit.clamp.x+v.bikeHandX,y:cockpit.clamp.y+v.bikeHandY};
    }
  }else if(v.mode==='direct'){
    if(![v.directX,v.directY].every(Number.isFinite)||v.directY<=0)throw new Error('Kontaktpunktmaße sind unvollständig oder ungültig.');
    const point={x:v.directX,y:v.directY};
    cockpit={frame:null,steerer:null,clamp:v.point!=='hoods'?point:null};
    if(v.point==='hoods')hand=point;
  }else throw new Error('Unbekannte Eingabemethode.');
  const approximate=v.point==='reach';
  const targetClamp=cockpit.clamp;
  let reachDelta=0;
  if(approximate){
    if(!Number.isFinite(v.bikeBarReach)||v.bikeBarReach<0||v.bikeBarReach>200)throw new Error('Lenker-Reach am Zielrad zwischen 0 und 200 mm eingeben.');
    reachDelta=v.bikeBarReach-HARDWARE.handlebarReach;
    cockpit={...cockpit,clamp:{x:targetClamp.x+reachDelta,y:targetClamp.y}};
  }
  const includeSaddle=v.includeSaddle!==false,saddleMode=v.saddleMode||'measured';
  const heightOnly=includeSaddle&&saddleMode==='measured'&&v.setback==null;
  if(includeSaddle&&(!Number.isFinite(v.height)||v.height<=0||!['radial','vertical'].includes(v.heightType)))throw new Error('Sattelhöhe oder Messmethode ist ungültig.');
  if(includeSaddle&&v.saddleAngle!=null&&!Number.isFinite(v.saddleAngle))throw new Error('Sattelneigung ungültig.');
  const saddle=includeSaddle?(saddleMode==='geometry'?geometrySaddleTarget({...v,saddleAngle:0}):heightOnly?{x:0,y:v.height}:saddleTarget(v)):null;
  const seatAngle=v.seatAngle==null?null:v.seatAngle;
  if(seatAngle!==null&&(!Number.isFinite(seatAngle)||seatAngle<=0||seatAngle>=90))throw new Error('Sitzrohrwinkel muss zwischen 0 und 90° liegen.');
  const crankKnown=Number.isFinite(v.crank)&&Number.isFinite(v.rideCrank);
  if(crankKnown&&(v.crank<=0||v.rideCrank<=0))throw new Error('Ungültige Kurbellänge.');
  return {...cockpit,targetClamp,approximate,reachDelta,hand,saddle,heightOnly,seatAngle,saddleAngle:includeSaddle?v.saddleAngle:null,saddleMode:includeSaddle?saddleMode:null,drop:saddle?saddle.y-(hand||cockpit.clamp).y:null,crankDelta:crankKnown?v.rideCrank-v.crank:null};
}
// Estimated front-contact geometry from Zwift manufacturer chart (08/2024).
// Same nominal support geometry for all feet; contact changes are unmeasured.
export const TRAINER_GEOMETRY = Object.freeze({
  supportDistance: Math.sqrt(415**2-70.5**2)+546+263/Math.tan(73.5*Math.PI/180),
  axleHeight:333.5, maxLift:100, status:'estimated',
});
export function trainerTilt(lift=0){
  if(!Number.isFinite(lift)||lift<0||lift>TRAINER_GEOMETRY.maxLift)throw new Error('Traineranhebung zwischen 0 und 100 mm eingeben.');
  if(lift===0)return 0;
  const {supportDistance:L,axleHeight:H}=TRAINER_GEOMETRY;
  return Math.asin((H+lift)/Math.hypot(L,H))-Math.atan2(H,L);
}
export function rotateForLift(point,theta){
  return {x:point.x*Math.cos(theta)+point.y*Math.sin(theta),y:-point.x*Math.sin(theta)+point.y*Math.cos(theta)};
}
export function liftedProfile(profile,lift=0){
  const theta=trainerTilt(lift);if(theta===0)return profile;
  const deg=theta*180/Math.PI,rot=p=>rotateForLift(p,theta);
  const model=m=>m?{...m,...Object.fromEntries(['origin','height','clamp','rail'].filter(k=>m[k]).map(k=>[k,rot(m[k])]))}:m;
  return {...profile,
    handlebar:profile.handlebar?{...profile.handlebar,origin:rot(profile.handlebar.origin),reach:rot(profile.handlebar.reach),height:rot(profile.handlebar.height)}:null,
    hand:profile.hand?{...profile.hand,offset:profile.hand.offset?rot(profile.hand.offset):null}:null,
    saddle:profile.saddle?{...model(profile.saddle),angle:profile.saddle.angle==null?null:profile.saddle.angle-deg,
      ...(profile.saddle.kind==='discrete-saddle'?{contact:rot(profile.saddle.contact),mounts:profile.saddle.mounts.map(m=>({...m,offset:rot(m.offset)}))}:{}),
      tiltSamples:(profile.saddle.tiltSamples||[]).map(sample=>({...model(sample),angle:sample.angle-deg}))}:null,
  };
}
export function evaluateFit(v,profiles) {
  const t=makeTarget(v),lift=v.trainerLift??0,theta=trainerTilt(lift);
  return {target:t,trainerLift:lift,tiltDegrees:theta*180/Math.PI,profiles:profiles.map(original=>{
    const p=liftedProfile(original,lift),approximate=t.approximate||lift>0||Boolean(t.saddle&&p.saddle?.kind==='discrete-saddle');
    const handReady=!t.hand||finite(p.hand?.offset);
    const clamp=handReady?(t.hand?sub(t.hand,p.hand.offset):t.clamp):null;
    const bar=clamp?solveBar(clamp,p.handlebar):{status:'missing'};
    const tilt=t.saddle?saddleAtAngle(p.saddle,t.saddleAngle):null;
    const saddle=!t.saddle?{status:'not-requested'}:p.saddle?.kind==='discrete-saddle'?solveMeasuredSaddle(t.saddle,p.saddle,{heightOnly:t.heightOnly,height:v.height,heightType:v.heightType}):tilt.status==='available'?solveSaddle(t.saddle,tilt.calibration):{status:tilt.status};
    const widthRequested=v.width!=null;
    const widthOK=!widthRequested||(Number.isFinite(v.width)&&v.width>=HARDWARE.widthMin&&v.width<=HARDWARE.widthMax);
    const widthCalibrated=p.status==='demo'||!t.hand||(widthRequested&&v.width===p.hand?.referenceWidth)||p.hand?.widthInvariant===true;
    const reachable=bar.status==='reachable'&&(!t.saddle||saddle.status==='reachable')&&widthOK;
    const ready=!approximate&&p.status==='validated'&&(!t.saddle||(p.saddle?.status==='validated'&&tilt?.angleValidated===true&&(t.saddleMode!=='geometry'||HARDWARE.saddleContact?.status==='validated')))&&(!t.hand||p.hand?.status==='validated')&&widthCalibrated;
    return {id:p.id,effectiveProfile:p,approximate,trainerLift:lift,tiltDegrees:theta*180/Math.PI,clamp,bar,saddle,tilt,widthOK,widthRequested,widthCalibrated,reachable,ready,
      scope:t.saddle?'cockpit-and-saddle':'cockpit',
      margin:bar.status==='reachable'?Math.min(bar.u,1-bar.u,bar.v,1-bar.v):-Infinity};
  })};
}
export function recommend(results,current) {
  const feasible=results.filter(p=>p.reachable);
  return feasible.find(p=>p.id===current)||feasible.sort((a,b)=>b.margin-a.margin)[0]||null;
}

// Search in a 1 mm grid, refining the first feasible bracket. Not a proof of
// global infeasibility: narrower feasible intervals can fall between samples.
export function suggestTrainerLift(v,profile){
  const at=h=>evaluateFit({...v,trainerLift:h},[profile]).profiles[0];
  if(at(0).reachable)return {status:'found',height:0,result:at(0)};
  for(let h=1;h<=TRAINER_GEOMETRY.maxLift;h++){
    if(!at(h).reachable)continue;
    let lo=h-1,hi=h;
    for(let i=0;i<18;i++){const mid=(lo+hi)/2;if(at(mid).reachable)hi=mid;else lo=mid;}
    // Recheck rounded output; retain the original feasible integer if necessary.
    const rounded=Math.ceil(hi*10)/10,height=at(rounded).reachable?rounded:h;
    return {status:'found',height,result:at(height)};
  }
  return {status:'not-found',maxLift:TRAINER_GEOMETRY.maxLift};
}
