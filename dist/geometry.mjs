// All coordinates in millimetres, BB=(0,0), +X forward, +Y upward.
export const SOURCE = 'https://cdn.shopify.com/s/files/1/0611/8621/2080/files/zwift-ride-geometry-chart-v2.png?v=1729003651';
export const NOMINAL = Object.freeze({saddleX:[-251,-147],saddleY:[579,830],barX:[390,510],barY:[600,761]});
const rad = d => d * Math.PI / 180;
function finite(...v) { if (v.some(n => typeof n !== 'number' || !Number.isFinite(n))) throw new Error('Bitte alle benötigten Maße als Zahlen eingeben.'); }
export function cockpitTarget(v) {
  finite(v.stack,v.reach,v.head,v.cover,v.spacers,v.stemStack,v.stem,v.angle);
  if(v.head<=0||v.head>=90||v.stack<=0||v.reach<0||v.stem<=0||[v.cover,v.spacers,v.stemStack].some(n=>n<0)) throw new Error('Cockpitmaße liegen außerhalb des gültigen Bereichs.');
  const h=rad(v.head),theta=rad(90-v.head+v.angle),extension=v.cover+v.spacers+v.stemStack/2;
  const steerer={x:v.reach-extension*Math.cos(h),y:v.stack+extension*Math.sin(h)};
  return {frame:{x:v.reach,y:v.stack},steerer,clamp:{x:steerer.x+v.stem*Math.cos(theta),y:steerer.y+v.stem*Math.sin(theta)}};
}
export function saddleTarget(v) {
  finite(v.height,v.setback);
  if(v.height<=0||!['radial','vertical'].includes(v.heightType))throw new Error('Sattelhöhe oder Messmethode ist ungültig.');
  if(v.heightType==='radial'&&Math.abs(v.setback)>=v.height)throw new Error('Der Sattelversatz muss kleiner als die diagonale Sattelhöhe sein.');
  return {x:-v.setback,y:v.heightType==='radial'?Math.sqrt(v.height**2-v.setback**2):v.height};
}
// Compatibility entry for the complete measured-contact transfer.
export function target(v) {
  finite(v.crank,v.rideCrank);if(v.crank<=0||v.rideCrank<=0)throw new Error('Ungültige Kurbellänge.');
  if(!['clamp','hoods'].includes(v.point))throw new Error('Unbekannte Messmethode.');
  const cockpit=cockpitTarget(v),saddle=saddleTarget(v);let hand=null,rideClamp={...cockpit.clamp};
  if(v.point==='hoods'){
    finite(v.bikeHandX,v.bikeHandY,v.rideHandX,v.rideHandY);
    hand={x:cockpit.clamp.x+v.bikeHandX,y:cockpit.clamp.y+v.bikeHandY};
    rideClamp={x:hand.x-v.rideHandX,y:hand.y-v.rideHandY};
  }
  return {...cockpit,saddle,hand,rideClamp,drop:saddle.y-(hand||cockpit.clamp).y,crankDelta:v.rideCrank-v.crank};
}

// Three poses: P0 baseline; P1 changes axis A only; P2 changes axis B only.
// Physical slider travel at P1/P2 supplies the units. No invented letter spacing.
export function solve(goal,c) {
  const keys=['x0','y0','x1','y1','x2','y2','aStep','bStep'];
  if(keys.some(k=>c[k]===null||c[k]===undefined)) return {status:'missing'};
  finite(...keys.map(k=>c[k]));
  if(c.aStep===0||c.bStep===0) throw new Error('Die Kalibrierwege dürfen nicht null sein.');
  const a={x:(c.x1-c.x0)/c.aStep,y:(c.y1-c.y0)/c.aStep};
  const b={x:(c.x2-c.x0)/c.bStep,y:(c.y2-c.y0)/c.bStep};
  const det=a.x*b.y-a.y*b.x, norm=Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y);
  if(norm===0||Math.abs(det)/norm<0.03) throw new Error('Kalibrierung nicht eindeutig: Die beiden Verstellungen müssen unterschiedliche Richtungen abbilden.');
  const dx=goal.x-c.x0,dy=goal.y-c.y0;
  const moves={a:(dx*b.y-dy*b.x)/det,b:(a.x*dy-a.y*dx)/det};
  const limitKeys=['aMin','aMax','bMin','bMax'];
  const supplied=limitKeys.filter(k=>c[k]!==null&&c[k]!==undefined).length;
  if(supplied && supplied!==4) throw new Error('Bitte alle vier Verstellgrenzen ergänzen oder alle leer lassen.');
  if(supplied) {
    finite(...limitKeys.map(k=>c[k]));
    if(c.aMin>=c.aMax||c.bMin>=c.bMax||c.aMin>0||c.aMax<0||c.bMin>0||c.bMax<0) throw new Error('Grenzen müssen die Referenzstellung 0 einschließen: Minimum < Maximum.');
  }
  const limited={a:supplied?Math.min(c.aMax,Math.max(c.aMin,moves.a)):moves.a,b:supplied?Math.min(c.bMax,Math.max(c.bMin,moves.b)):moves.b};
  const achieved={x:c.x0+a.x*limited.a+b.x*limited.b,y:c.y0+a.y*limited.a+b.y*limited.b};
  const reachable=!supplied || (Math.abs(moves.a-limited.a)<1e-7&&Math.abs(moves.b-limited.b)<1e-7);
  return {status:!supplied?'unbounded':reachable?'reachable':'outside',moves,limited,achieved,residual:{x:achieved.x-goal.x,y:achieved.y-goal.y}};
}

export function nominalCheck(t) {
  const checks=[['Sattel X',t.saddle.x,NOMINAL.saddleX],['Sattel Y',t.saddle.y,NOMINAL.saddleY],['Lenker X',t.rideClamp.x,NOMINAL.barX],['Lenker Y',t.rideClamp.y,NOMINAL.barY]];
  return checks.filter(([,value,[min,max]])=>value<min||value>max).map(([name,value,range])=>({name,value,range}));
}
